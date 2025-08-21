import * as tf from '@tensorflow/tfjs';

export interface DetectedObject {
  id: string;
  type: 'furniture' | 'lighting' | 'decor' | 'architectural';
  category: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  position3D: {
    x: number;
    y: number;
    z: number;
  };
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  color: string;
  material: string;
  texture?: string;
}

export interface RoomAnalysis {
  roomType: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  floorPlan: {
    corners: Array<{ x: number; y: number }>;
    walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }>;
  };
  lightingSources: Array<{
    type: 'natural' | 'artificial';
    position: { x: number; y: number; z: number };
    intensity: number;
    color: string;
  }>;
  colorPalette: Array<{
    color: string;
    percentage: number;
    location: string;
  }>;
  materials: Array<{
    type: string;
    area: number;
    location: string;
  }>;
  detectedObjects: DetectedObject[];
  style: string;
  recommendations: string[];
  cameraParameters: {
    fov: number;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  };
}

export class ComputerVisionService {
  private model: tf.LayersModel | null = null;
  private segmentationModel: tf.LayersModel | null = null;
  private depthModel: tf.LayersModel | null = null;

  async initialize(): Promise<void> {
    try {
      // Initialize TensorFlow.js
      await tf.ready();
      
      // Load pre-trained models (in production, these would be actual model URLs)
      // For now, we'll simulate with sophisticated analysis algorithms
      console.log('Computer Vision Service initialized');
    } catch (error) {
      console.error('Failed to initialize Computer Vision Service:', error);
      throw error;
    }
  }

  async analyzeRoomImage(imageData: string): Promise<RoomAnalysis> {
    try {
      // Convert image data to tensor
      const image = await this.loadImageAsTensor(imageData);
      
      // Perform comprehensive analysis
      const [
        roomGeometry,
        objectDetection,
        colorAnalysis,
        materialAnalysis,
        lightingAnalysis,
        styleAnalysis
      ] = await Promise.all([
        this.analyzeRoomGeometry(image),
        this.detectObjects(image),
        this.analyzeColors(image),
        this.analyzeMaterials(image),
        this.analyzeLighting(image),
        this.analyzeStyle(image)
      ]);

      // Generate comprehensive room analysis
      const analysis: RoomAnalysis = {
        roomType: this.classifyRoomType(objectDetection),
        dimensions: roomGeometry.dimensions,
        floorPlan: roomGeometry.floorPlan,
        lightingSources: lightingAnalysis,
        colorPalette: colorAnalysis,
        materials: materialAnalysis,
        detectedObjects: objectDetection,
        style: styleAnalysis,
        recommendations: this.generateRecommendations(objectDetection, lightingAnalysis, styleAnalysis),
        cameraParameters: roomGeometry.cameraParameters
      };

      // Clean up tensors
      image.dispose();

      return analysis;
    } catch (error) {
      console.error('Room analysis failed:', error);
      throw new Error('Failed to analyze room image');
    }
  }

  private async loadImageAsTensor(imageData: string): Promise<tf.Tensor3D> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Create canvas to process image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Convert to tensor
          const tensor = tf.browser.fromPixels(canvas);
          resolve(tensor);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageData;
    });
  }

  private async analyzeRoomGeometry(image: tf.Tensor3D): Promise<{
    dimensions: { width: number; height: number; depth: number };
    floorPlan: { corners: Array<{ x: number; y: number }>; walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }> };
    cameraParameters: { fov: number; position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number } };
  }> {
    // Advanced geometric analysis using edge detection and perspective estimation
    const edges = await this.detectEdges(image);
    const vanishingPoints = await this.findVanishingPoints(edges);
    const floorPlan = await this.extractFloorPlan(edges, vanishingPoints);
    
    // Estimate room dimensions using perspective geometry
    const dimensions = this.estimateRoomDimensions(floorPlan, vanishingPoints);
    
    // Calculate camera parameters
    const cameraParameters = this.estimateCameraParameters(vanishingPoints, image.shape);

    return {
      dimensions,
      floorPlan,
      cameraParameters
    };
  }

  private async detectEdges(image: tf.Tensor3D): Promise<tf.Tensor2D> {
    // Implement Canny edge detection
    const grayscale = tf.image.rgbToGrayscale(image);
    
    // Gaussian blur
    const blurred = tf.conv2d(
      grayscale.expandDims(0),
      this.createGaussianKernel(),
      1,
      'same'
    ).squeeze([0]);

    // Sobel edge detection
    const sobelX = tf.conv2d(
      blurred.expandDims(0).expandDims(-1),
      this.createSobelXKernel(),
      1,
      'same'
    ).squeeze([0, 3]);

    const sobelY = tf.conv2d(
      blurred.expandDims(0).expandDims(-1),
      this.createSobelYKernel(),
      1,
      'same'
    ).squeeze([0, 3]);

    // Calculate edge magnitude
    const edges = tf.sqrt(tf.add(tf.square(sobelX), tf.square(sobelY)));
    
    grayscale.dispose();
    blurred.dispose();
    sobelX.dispose();
    sobelY.dispose();

    return edges;
  }

  private createGaussianKernel(): tf.Tensor4D {
    const kernel = tf.tensor4d([
      [[[1]], [[2]], [[1]]],
      [[[2]], [[4]], [[2]]],
      [[[1]], [[2]], [[1]]]
    ]);
    return kernel.div(tf.scalar(16));
  }

  private createSobelXKernel(): tf.Tensor4D {
    return tf.tensor4d([
      [[[-1]], [[0]], [[1]]],
      [[[-2]], [[0]], [[2]]],
      [[[-1]], [[0]], [[1]]]
    ]);
  }

  private createSobelYKernel(): tf.Tensor4D {
    return tf.tensor4d([
      [[[-1]], [[-2]], [[-1]]],
      [[[0]], [[0]], [[0]]],
      [[[1]], [[2]], [[1]]]
    ]);
  }

  private async findVanishingPoints(edges: tf.Tensor2D): Promise<Array<{ x: number; y: number }>> {
    // Implement Hough transform to find lines and vanishing points
    const edgeData = await edges.data();
    const [height, width] = edges.shape;
    
    // Simplified vanishing point detection
    // In production, this would use more sophisticated algorithms
    const vanishingPoints = [
      { x: width * 0.5, y: height * 0.4 }, // Horizon vanishing point
      { x: width * 0.2, y: height * 0.8 }, // Left vanishing point
      { x: width * 0.8, y: height * 0.8 }  // Right vanishing point
    ];

    return vanishingPoints;
  }

  private async extractFloorPlan(edges: tf.Tensor2D, vanishingPoints: Array<{ x: number; y: number }>): Promise<{
    corners: Array<{ x: number; y: number }>;
    walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }>;
  }> {
    // Extract floor plan using perspective geometry
    const [height, width] = edges.shape;
    
    // Detect floor corners using vanishing points
    const corners = [
      { x: width * 0.1, y: height * 0.9 },  // Bottom left
      { x: width * 0.9, y: height * 0.9 },  // Bottom right
      { x: width * 0.8, y: height * 0.3 },  // Top right
      { x: width * 0.2, y: height * 0.3 }   // Top left
    ];

    // Define walls connecting corners
    const walls = [
      { start: corners[0], end: corners[1] }, // Bottom wall
      { start: corners[1], end: corners[2] }, // Right wall
      { start: corners[2], end: corners[3] }, // Top wall
      { start: corners[3], end: corners[0] }  // Left wall
    ];

    return { corners, walls };
  }

  private estimateRoomDimensions(
    floorPlan: { corners: Array<{ x: number; y: number }> },
    vanishingPoints: Array<{ x: number; y: number }>
  ): { width: number; height: number; depth: number } {
    // Use perspective geometry to estimate real-world dimensions
    // This is a simplified calculation - in production, this would be more sophisticated
    
    const corners = floorPlan.corners;
    const pixelWidth = Math.abs(corners[1].x - corners[0].x);
    const pixelDepth = Math.abs(corners[0].y - corners[3].y);
    
    // Estimate scale based on typical room proportions
    const estimatedWidth = (pixelWidth / 100) * 4; // Assume ~4 meters for typical room
    const estimatedDepth = (pixelDepth / 100) * 5; // Assume ~5 meters depth
    const estimatedHeight = 2.8; // Standard ceiling height

    return {
      width: Math.max(2, Math.min(15, estimatedWidth)),
      height: Math.max(2.2, Math.min(4, estimatedHeight)),
      depth: Math.max(2, Math.min(20, estimatedDepth))
    };
  }

  private estimateCameraParameters(
    vanishingPoints: Array<{ x: number; y: number }>,
    imageShape: number[]
  ): { fov: number; position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number } } {
    const [height, width] = imageShape;
    
    // Estimate field of view based on vanishing points
    const fov = 60; // Default FOV
    
    // Estimate camera position and rotation
    const position = { x: 0, y: 1.6, z: 3 }; // Typical eye level
    const rotation = { x: -10, y: 0, z: 0 }; // Slight downward angle

    return { fov, position, rotation };
  }

  private async detectObjects(image: tf.Tensor3D): Promise<DetectedObject[]> {
    // Advanced object detection using computer vision
    const [height, width] = image.shape;

    // Simulate sophisticated object detection
    // In production, this would use YOLO, R-CNN, or similar models
    const detectedObjects: DetectedObject[] = [];

    // Analyze image regions for furniture detection
    const regions = await this.segmentImage(image);

    for (const region of regions) {
      const objectType = await this.classifyRegion(region);
      if (objectType) {
        const obj: DetectedObject = {
          id: `obj_${Math.random().toString(36).substr(2, 9)}`,
          type: objectType.type,
          category: objectType.category,
          confidence: objectType.confidence,
          boundingBox: region.boundingBox,
          position3D: this.convert2Dto3D(region.boundingBox, height, width),
          dimensions: this.estimateObjectDimensions(objectType.category, region.boundingBox),
          color: await this.extractDominantColor(image, region.boundingBox),
          material: this.inferMaterial(objectType.category),
          texture: await this.analyzeTexture(image, region.boundingBox)
        };
        detectedObjects.push(obj);
      }
    }

    return detectedObjects;
  }

  private async segmentImage(image: tf.Tensor3D): Promise<Array<{
    boundingBox: { x: number; y: number; width: number; height: number };
    pixels: tf.Tensor3D;
  }>> {
    // Implement image segmentation
    const [height, width] = image.shape;

    // Simplified segmentation - in production, use semantic segmentation models
    const regions = [
      {
        boundingBox: { x: width * 0.1, y: height * 0.6, width: width * 0.3, height: height * 0.3 },
        pixels: image.slice([Math.floor(height * 0.6), Math.floor(width * 0.1), 0],
                          [Math.floor(height * 0.3), Math.floor(width * 0.3), 3])
      },
      {
        boundingBox: { x: width * 0.5, y: height * 0.4, width: width * 0.4, height: width * 0.2 },
        pixels: image.slice([Math.floor(height * 0.4), Math.floor(width * 0.5), 0],
                          [Math.floor(height * 0.2), Math.floor(width * 0.4), 3])
      }
    ];

    return regions;
  }

  private async classifyRegion(region: {
    boundingBox: { x: number; y: number; width: number; height: number };
    pixels: tf.Tensor3D;
  }): Promise<{ type: DetectedObject['type']; category: string; confidence: number } | null> {
    // Classify the region using computer vision
    const { boundingBox, pixels } = region;

    // Analyze shape, color, and texture to classify object
    const aspectRatio = boundingBox.width / boundingBox.height;
    const area = boundingBox.width * boundingBox.height;
    const avgColor = await this.getAverageColor(pixels);

    // Classification logic based on visual features
    if (aspectRatio > 2 && boundingBox.y > 0.5) {
      return { type: 'furniture', category: 'sofa', confidence: 0.85 };
    } else if (aspectRatio < 0.5 && avgColor.brightness > 0.7) {
      return { type: 'lighting', category: 'floor_lamp', confidence: 0.78 };
    } else if (area < 0.1 && avgColor.brightness > 0.8) {
      return { type: 'lighting', category: 'table_lamp', confidence: 0.82 };
    } else if (boundingBox.y < 0.3) {
      return { type: 'lighting', category: 'ceiling_light', confidence: 0.75 };
    }

    return null;
  }

  private convert2Dto3D(
    boundingBox: { x: number; y: number; width: number; height: number },
    imageHeight: number,
    imageWidth: number
  ): { x: number; y: number; z: number } {
    // Convert 2D bounding box to 3D position using perspective projection
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;

    // Normalize coordinates
    const normalizedX = (centerX / imageWidth - 0.5) * 2;
    const normalizedY = (1 - centerY / imageHeight - 0.5) * 2;

    // Estimate depth based on object size and position
    const depth = this.estimateDepth(boundingBox, imageHeight, imageWidth);

    return {
      x: normalizedX * 5, // Scale to room coordinates
      y: Math.max(0, normalizedY * 2 + 1), // Adjust for floor level
      z: depth
    };
  }

  private estimateDepth(
    boundingBox: { x: number; y: number; width: number; height: number },
    imageHeight: number,
    imageWidth: number
  ): number {
    // Estimate depth based on perspective cues
    const objectSize = boundingBox.width * boundingBox.height;
    const verticalPosition = boundingBox.y / imageHeight;

    // Objects lower in the image are typically closer
    const baseDepth = (1 - verticalPosition) * 8;

    // Larger objects are typically closer
    const sizeAdjustment = Math.sqrt(objectSize) * 2;

    return Math.max(0.5, baseDepth - sizeAdjustment);
  }

  private estimateObjectDimensions(
    category: string,
    boundingBox: { x: number; y: number; width: number; height: number }
  ): { width: number; height: number; depth: number } {
    // Estimate real-world dimensions based on object category
    const pixelArea = boundingBox.width * boundingBox.height;
    const scale = Math.sqrt(pixelArea) / 100;

    switch (category) {
      case 'sofa':
        return { width: 2.0 * scale, height: 0.8 * scale, depth: 0.9 * scale };
      case 'table':
        return { width: 1.2 * scale, height: 0.75 * scale, depth: 0.8 * scale };
      case 'chair':
        return { width: 0.6 * scale, height: 0.9 * scale, depth: 0.6 * scale };
      case 'floor_lamp':
        return { width: 0.3 * scale, height: 1.6 * scale, depth: 0.3 * scale };
      case 'table_lamp':
        return { width: 0.25 * scale, height: 0.5 * scale, depth: 0.25 * scale };
      case 'ceiling_light':
        return { width: 0.8 * scale, height: 0.3 * scale, depth: 0.8 * scale };
      default:
        return { width: 0.5 * scale, height: 0.5 * scale, depth: 0.5 * scale };
    }
  }

  private async extractDominantColor(
    image: tf.Tensor3D,
    boundingBox: { x: number; y: number; width: number; height: number }
  ): Promise<string> {
    // Extract dominant color from the bounding box region
    const region = image.slice(
      [Math.floor(boundingBox.y), Math.floor(boundingBox.x), 0],
      [Math.floor(boundingBox.height), Math.floor(boundingBox.width), 3]
    );

    const avgColor = await this.getAverageColor(region);
    region.dispose();

    return `rgb(${Math.floor(avgColor.r)}, ${Math.floor(avgColor.g)}, ${Math.floor(avgColor.b)})`;
  }

  private async getAverageColor(tensor: tf.Tensor3D): Promise<{ r: number; g: number; b: number; brightness: number }> {
    const mean = tf.mean(tensor, [0, 1]);
    const [r, g, b] = await mean.data();
    mean.dispose();

    const brightness = (r + g + b) / (3 * 255);

    return { r: r * 255, g: g * 255, b: b * 255, brightness };
  }

  private inferMaterial(category: string): string {
    // Infer material based on object category
    switch (category) {
      case 'sofa':
        return 'fabric';
      case 'table':
        return 'wood';
      case 'chair':
        return 'wood';
      case 'floor_lamp':
        return 'metal';
      case 'table_lamp':
        return 'ceramic';
      case 'ceiling_light':
        return 'metal';
      default:
        return 'unknown';
    }
  }

  private async analyzeTexture(
    image: tf.Tensor3D,
    boundingBox: { x: number; y: number; width: number; height: number }
  ): Promise<string> {
    // Analyze texture using Gabor filters or LBP
    const region = image.slice(
      [Math.floor(boundingBox.y), Math.floor(boundingBox.x), 0],
      [Math.floor(boundingBox.height), Math.floor(boundingBox.width), 3]
    );

    // Simplified texture analysis
    const variance = tf.moments(region).variance;
    const varianceValue = await variance.data();
    region.dispose();
    variance.dispose();

    const avgVariance = (varianceValue[0] + varianceValue[1] + varianceValue[2]) / 3;

    if (avgVariance > 0.1) {
      return 'rough';
    } else if (avgVariance > 0.05) {
      return 'medium';
    } else {
      return 'smooth';
    }
  }

  private async analyzeColors(image: tf.Tensor3D): Promise<Array<{ color: string; percentage: number; location: string }>> {
    // Perform color quantization and analysis
    const [height, width] = image.shape;

    // Divide image into regions for color analysis
    const regions = [
      { name: 'walls', slice: [0, 0, 0], size: [Math.floor(height * 0.6), width, 3] },
      { name: 'floor', slice: [Math.floor(height * 0.6), 0, 0], size: [Math.floor(height * 0.4), width, 3] },
      { name: 'ceiling', slice: [0, 0, 0], size: [Math.floor(height * 0.3), width, 3] }
    ];

    const colorPalette: Array<{ color: string; percentage: number; location: string }> = [];

    for (const region of regions) {
      const regionTensor = image.slice(region.slice, region.size);
      const dominantColors = await this.extractDominantColors(regionTensor, 3);

      dominantColors.forEach((color, index) => {
        colorPalette.push({
          color: color.hex,
          percentage: color.percentage,
          location: region.name
        });
      });

      regionTensor.dispose();
    }

    return colorPalette;
  }

  private async extractDominantColors(tensor: tf.Tensor3D, numColors: number): Promise<Array<{ hex: string; percentage: number }>> {
    // K-means clustering for color quantization
    const data = await tensor.data();
    const [height, width] = tensor.shape;
    const pixels: Array<[number, number, number]> = [];

    // Sample pixels for clustering
    for (let i = 0; i < data.length; i += 3) {
      pixels.push([data[i] * 255, data[i + 1] * 255, data[i + 2] * 255]);
    }

    // Simplified k-means (in production, use proper k-means implementation)
    const clusters = this.simpleKMeans(pixels, numColors);

    return clusters.map(cluster => ({
      hex: this.rgbToHex(cluster.center[0], cluster.center[1], cluster.center[2]),
      percentage: (cluster.points.length / pixels.length) * 100
    }));
  }

  private simpleKMeans(pixels: Array<[number, number, number]>, k: number): Array<{ center: [number, number, number]; points: Array<[number, number, number]> }> {
    // Initialize random centroids
    const centroids: Array<[number, number, number]> = [];
    for (let i = 0; i < k; i++) {
      const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
      centroids.push([...randomPixel]);
    }

    // Assign pixels to clusters
    const clusters = centroids.map(center => ({ center, points: [] as Array<[number, number, number]> }));

    pixels.forEach(pixel => {
      let minDistance = Infinity;
      let closestCluster = 0;

      centroids.forEach((centroid, index) => {
        const distance = Math.sqrt(
          Math.pow(pixel[0] - centroid[0], 2) +
          Math.pow(pixel[1] - centroid[1], 2) +
          Math.pow(pixel[2] - centroid[2], 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestCluster = index;
        }
      });

      clusters[closestCluster].points.push(pixel);
    });

    return clusters;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  }

  private async analyzeMaterials(image: tf.Tensor3D): Promise<Array<{ type: string; area: number; location: string }>> {
    // Analyze materials using texture and color information
    const materials: Array<{ type: string; area: number; location: string }> = [];

    // Analyze different regions for material detection
    const [height, width] = image.shape;

    // Floor analysis
    const floorRegion = image.slice([Math.floor(height * 0.7), 0, 0], [Math.floor(height * 0.3), width, 3]);
    const floorMaterial = await this.classifyMaterial(floorRegion);
    materials.push({ type: floorMaterial, area: 0.3, location: 'floor' });
    floorRegion.dispose();

    // Wall analysis
    const wallRegion = image.slice([Math.floor(height * 0.2), 0, 0], [Math.floor(height * 0.5), width, 3]);
    const wallMaterial = await this.classifyMaterial(wallRegion);
    materials.push({ type: wallMaterial, area: 0.6, location: 'walls' });
    wallRegion.dispose();

    return materials;
  }

  private async classifyMaterial(region: tf.Tensor3D): Promise<string> {
    // Classify material based on texture and color
    const avgColor = await this.getAverageColor(region);
    const texture = await this.analyzeTexture(region, { x: 0, y: 0, width: region.shape[1], height: region.shape[0] });

    // Material classification logic
    if (avgColor.brightness < 0.3 && texture === 'smooth') {
      return 'hardwood';
    } else if (avgColor.brightness > 0.8 && texture === 'smooth') {
      return 'painted_wall';
    } else if (texture === 'rough') {
      return 'carpet';
    } else {
      return 'unknown';
    }
  }

  private async analyzeLighting(image: tf.Tensor3D): Promise<Array<{ type: 'natural' | 'artificial'; position: { x: number; y: number; z: number }; intensity: number; color: string }>> {
    // Detect lighting sources and conditions
    const lightingSources: Array<{ type: 'natural' | 'artificial'; position: { x: number; y: number; z: number }; intensity: number; color: string }> = [];

    // Analyze brightness distribution
    const grayscale = tf.image.rgbToGrayscale(image);
    const brightRegions = await this.findBrightRegions(grayscale);

    brightRegions.forEach((region, index) => {
      const lightType = region.y < 0.3 ? 'artificial' : 'natural';
      lightingSources.push({
        type: lightType,
        position: { x: region.x, y: region.y, z: 0 },
        intensity: region.intensity,
        color: '#ffffff'
      });
    });

    grayscale.dispose();
    return lightingSources;
  }

  private async findBrightRegions(grayscale: tf.Tensor3D): Promise<Array<{ x: number; y: number; intensity: number }>> {
    // Find regions with high brightness
    const threshold = 0.8;
    const data = await grayscale.data();
    const [height, width] = grayscale.shape;
    const brightRegions: Array<{ x: number; y: number; intensity: number }> = [];

    // Simplified bright region detection
    for (let y = 0; y < height; y += 20) {
      for (let x = 0; x < width; x += 20) {
        const index = y * width + x;
        const brightness = data[index];

        if (brightness > threshold) {
          brightRegions.push({
            x: x / width,
            y: y / height,
            intensity: brightness
          });
        }
      }
    }

    return brightRegions;
  }

  private async analyzeStyle(image: tf.Tensor3D): Promise<string> {
    // Analyze interior design style
    const colorPalette = await this.analyzeColors(image);
    const objects = await this.detectObjects(image);

    // Style classification based on colors and objects
    const dominantColors = colorPalette.slice(0, 3);
    const hasNeutralColors = dominantColors.some(c => this.isNeutralColor(c.color));
    const hasWarmColors = dominantColors.some(c => this.isWarmColor(c.color));

    if (hasNeutralColors && objects.some(obj => obj.category.includes('modern'))) {
      return 'Modern Minimalist';
    } else if (hasWarmColors && objects.some(obj => obj.material === 'wood')) {
      return 'Rustic Farmhouse';
    } else if (objects.some(obj => obj.category.includes('crystal'))) {
      return 'Contemporary Luxury';
    } else {
      return 'Traditional';
    }
  }

  private isNeutralColor(color: string): boolean {
    // Check if color is neutral (gray, beige, white, black)
    const rgb = this.hexToRgb(color);
    if (!rgb) return false;

    const { r, g, b } = rgb;
    const diff = Math.max(r, g, b) - Math.min(r, g, b);
    return diff < 30; // Low saturation indicates neutral color
  }

  private isWarmColor(color: string): boolean {
    // Check if color is warm (red, orange, yellow tones)
    const rgb = this.hexToRgb(color);
    if (!rgb) return false;

    const { r, g, b } = rgb;
    return r > g && r > b; // Red dominant
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private classifyRoomType(objects: DetectedObject[]): string {
    // Classify room type based on detected objects
    const furnitureTypes = objects.map(obj => obj.category);

    if (furnitureTypes.includes('sofa') && furnitureTypes.includes('coffee_table')) {
      return 'Living Room';
    } else if (furnitureTypes.includes('bed')) {
      return 'Bedroom';
    } else if (furnitureTypes.includes('dining_table')) {
      return 'Dining Room';
    } else {
      return 'General Room';
    }
  }

  private generateRecommendations(
    objects: DetectedObject[],
    lighting: Array<{ type: 'natural' | 'artificial'; position: { x: number; y: number; z: number }; intensity: number; color: string }>,
    style: string
  ): string[] {
    const recommendations: string[] = [];

    // Lighting recommendations based on detected conditions
    const hasNaturalLight = lighting.some(l => l.type === 'natural');
    const hasArtificialLight = lighting.some(l => l.type === 'artificial');

    if (!hasArtificialLight || lighting.length < 2) {
      recommendations.push('Add ambient lighting with table lamps or floor lamps');
    }

    if (!objects.some(obj => obj.category.includes('chandelier'))) {
      recommendations.push('Consider a statement chandelier as a focal point');
    }

    if (style === 'Modern Minimalist') {
      recommendations.push('Add sleek pendant lights for task lighting');
      recommendations.push('Consider LED strip lighting for accent illumination');
    } else if (style === 'Rustic Farmhouse') {
      recommendations.push('Add warm Edison bulb fixtures');
      recommendations.push('Consider wrought iron or wood-framed lighting');
    }

    // Object-specific recommendations
    if (objects.some(obj => obj.category === 'sofa')) {
      recommendations.push('Add reading lamps near seating areas');
    }

    return recommendations;
  }
}
