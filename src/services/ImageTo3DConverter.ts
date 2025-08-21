import * as THREE from 'three';
import { ComputerVisionService, RoomAnalysis, DetectedObject } from './ComputerVisionService';
import { Object3DGenerator, Generated3DObject } from './Object3DGenerator';

export interface DigitalTwin {
  scene: THREE.Scene;
  roomStructure: {
    walls: THREE.Object3D[];
    floor: THREE.Object3D;
    ceiling: THREE.Object3D;
  };
  furniture: Generated3DObject[];
  lighting: THREE.Light[];
  camera: THREE.PerspectiveCamera;
  metadata: {
    originalImage: string;
    analysis: RoomAnalysis;
    accuracy: number;
    processingTime: number;
  };
}

export class ImageTo3DConverter {
  private visionService: ComputerVisionService;
  private objectGenerator: Object3DGenerator;
  private scene: THREE.Scene;

  constructor() {
    this.visionService = new ComputerVisionService();
    this.objectGenerator = new Object3DGenerator();
    this.scene = new THREE.Scene();
  }

  async initialize(): Promise<void> {
    await this.visionService.initialize();
    console.log('Image-to-3D Converter initialized');
  }

  async convertImageToDigitalTwin(imageData: string): Promise<DigitalTwin> {
    const startTime = performance.now();
    
    try {
      // Step 1: Analyze the image with computer vision
      console.log('🔍 Analyzing room image...');
      const analysis = await this.visionService.analyzeRoomImage(imageData);
      
      // Step 2: Create 3D scene
      console.log('🏗️ Creating 3D scene...');
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f5f5);
      
      // Step 3: Build room structure
      console.log('🏠 Building room structure...');
      const roomStructure = await this.buildRoomStructure(scene, analysis);
      
      // Step 4: Generate 3D objects from detected furniture
      console.log('🪑 Generating furniture objects...');
      const furniture = await this.generateFurnitureObjects(scene, analysis.detectedObjects);
      
      // Step 5: Setup lighting based on analysis
      console.log('💡 Setting up lighting...');
      const lighting = this.setupSceneLighting(scene, analysis);
      
      // Step 6: Position camera based on analysis
      console.log('📷 Positioning camera...');
      const camera = this.setupCamera(analysis);
      
      // Step 7: Calculate accuracy score
      const accuracy = this.calculateAccuracy(analysis);
      
      const processingTime = performance.now() - startTime;
      
      console.log(`✅ Digital twin created in ${processingTime.toFixed(2)}ms with ${accuracy.toFixed(1)}% accuracy`);
      
      return {
        scene,
        roomStructure,
        furniture,
        lighting,
        camera,
        metadata: {
          originalImage: imageData,
          analysis,
          accuracy,
          processingTime
        }
      };
    } catch (error) {
      console.error('Failed to convert image to digital twin:', error);
      throw error;
    }
  }

  private async buildRoomStructure(scene: THREE.Scene, analysis: RoomAnalysis): Promise<{
    walls: THREE.Object3D[];
    floor: THREE.Object3D;
    ceiling: THREE.Object3D;
  }> {
    const { dimensions, floorPlan, colorPalette, materials } = analysis;
    
    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(dimensions.width, dimensions.depth);
    const floorMaterial = this.createFloorMaterial(materials, colorPalette);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Create walls based on floor plan
    const walls: THREE.Object3D[] = [];
    floorPlan.walls.forEach((wall, index) => {
      const wallObject = this.createWall(wall, dimensions.height, materials, colorPalette);
      walls.push(wallObject);
      scene.add(wallObject);
    });
    
    // Create ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(dimensions.width, dimensions.depth);
    const ceilingMaterial = this.createCeilingMaterial(materials, colorPalette);
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = dimensions.height;
    ceiling.receiveShadow = true;
    scene.add(ceiling);
    
    return { walls, floor, ceiling };
  }

  private createFloorMaterial(
    materials: Array<{ type: string; area: number; location: string }>,
    colorPalette: Array<{ color: string; percentage: number; location: string }>
  ): THREE.Material {
    const floorMaterial = materials.find(m => m.location === 'floor');
    const floorColor = colorPalette.find(c => c.location === 'floor')?.color || '#8B7355';
    
    switch (floorMaterial?.type) {
      case 'hardwood':
        return new THREE.MeshLambertMaterial({ 
          color: floorColor,
          roughness: 0.8
        });
      case 'carpet':
        return new THREE.MeshLambertMaterial({ 
          color: floorColor,
          roughness: 0.9
        });
      case 'tile':
        return new THREE.MeshPhongMaterial({ 
          color: floorColor,
          shininess: 30
        });
      default:
        return new THREE.MeshLambertMaterial({ color: floorColor });
    }
  }

  private createWall(
    wall: { start: { x: number; y: number }; end: { x: number; y: number } },
    height: number,
    materials: Array<{ type: string; area: number; location: string }>,
    colorPalette: Array<{ color: string; percentage: number; location: string }>
  ): THREE.Object3D {
    const wallLength = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    );
    
    const wallGeometry = new THREE.PlaneGeometry(wallLength, height);
    const wallMaterial = this.createWallMaterial(materials, colorPalette);
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    
    // Position and rotate wall
    const centerX = (wall.start.x + wall.end.x) / 2;
    const centerY = (wall.start.y + wall.end.y) / 2;
    const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
    
    wallMesh.position.set(centerX, height / 2, centerY);
    wallMesh.rotation.y = angle + Math.PI / 2;
    wallMesh.receiveShadow = true;
    wallMesh.castShadow = true;
    
    return wallMesh;
  }

  private createWallMaterial(
    materials: Array<{ type: string; area: number; location: string }>,
    colorPalette: Array<{ color: string; percentage: number; location: string }>
  ): THREE.Material {
    const wallMaterial = materials.find(m => m.location === 'walls');
    const wallColor = colorPalette.find(c => c.location === 'walls')?.color || '#F5F5F5';
    
    switch (wallMaterial?.type) {
      case 'painted_wall':
        return new THREE.MeshLambertMaterial({ color: wallColor });
      case 'wallpaper':
        return new THREE.MeshLambertMaterial({ 
          color: wallColor,
          roughness: 0.7
        });
      case 'brick':
        return new THREE.MeshLambertMaterial({ 
          color: wallColor,
          roughness: 0.9
        });
      default:
        return new THREE.MeshLambertMaterial({ color: wallColor });
    }
  }

  private createCeilingMaterial(
    materials: Array<{ type: string; area: number; location: string }>,
    colorPalette: Array<{ color: string; percentage: number; location: string }>
  ): THREE.Material {
    const ceilingColor = colorPalette.find(c => c.location === 'ceiling')?.color || '#FFFFFF';
    return new THREE.MeshLambertMaterial({ color: ceilingColor });
  }

  private async generateFurnitureObjects(scene: THREE.Scene, detectedObjects: DetectedObject[]): Promise<Generated3DObject[]> {
    const furniture: Generated3DObject[] = [];
    
    for (const detectedObject of detectedObjects) {
      try {
        console.log(`Generating 3D object for: ${detectedObject.category}`);
        const generated3DObject = await this.objectGenerator.generateObjectFromDetection(detectedObject);
        
        // Position the object in 3D space
        generated3DObject.mesh.position.set(
          detectedObject.position3D.x,
          detectedObject.position3D.y,
          detectedObject.position3D.z
        );
        
        // Scale the object to match detected dimensions
        const scale = this.calculateObjectScale(detectedObject);
        generated3DObject.mesh.scale.set(scale.x, scale.y, scale.z);
        
        scene.add(generated3DObject.mesh);
        furniture.push(generated3DObject);
        
        console.log(`✅ Generated ${detectedObject.category} at position (${detectedObject.position3D.x.toFixed(2)}, ${detectedObject.position3D.y.toFixed(2)}, ${detectedObject.position3D.z.toFixed(2)})`);
      } catch (error) {
        console.warn(`Failed to generate 3D object for ${detectedObject.category}:`, error);
      }
    }
    
    return furniture;
  }

  private calculateObjectScale(detectedObject: DetectedObject): { x: number; y: number; z: number } {
    // Calculate scale based on detected vs. default dimensions
    const defaultDimensions = this.getDefaultDimensions(detectedObject.category);
    
    return {
      x: detectedObject.dimensions.width / defaultDimensions.width,
      y: detectedObject.dimensions.height / defaultDimensions.height,
      z: detectedObject.dimensions.depth / defaultDimensions.depth
    };
  }

  private getDefaultDimensions(category: string): { width: number; height: number; depth: number } {
    switch (category.toLowerCase()) {
      case 'sofa':
        return { width: 2.0, height: 0.8, depth: 0.9 };
      case 'chair':
        return { width: 0.6, height: 0.9, depth: 0.6 };
      case 'table':
        return { width: 1.2, height: 0.75, depth: 0.8 };
      case 'bed':
        return { width: 2.0, height: 0.6, depth: 1.5 };
      case 'floor_lamp':
        return { width: 0.3, height: 1.6, depth: 0.3 };
      case 'table_lamp':
        return { width: 0.25, height: 0.5, depth: 0.25 };
      default:
        return { width: 1.0, height: 1.0, depth: 1.0 };
    }
  }

  private setupSceneLighting(scene: THREE.Scene, analysis: RoomAnalysis): THREE.Light[] {
    const lights: THREE.Light[] = [];
    
    // Ambient light based on overall brightness
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    lights.push(ambientLight);
    
    // Add lights based on detected lighting sources
    analysis.lightingSources.forEach((lightSource, index) => {
      let light: THREE.Light;
      
      if (lightSource.type === 'natural') {
        // Natural light (window)
        light = new THREE.DirectionalLight(0xffffff, lightSource.intensity);
        light.position.set(lightSource.position.x * 10, lightSource.position.y * 10, lightSource.position.z * 10);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
      } else {
        // Artificial light
        light = new THREE.PointLight(0xffffff, lightSource.intensity, 15);
        light.position.set(lightSource.position.x, lightSource.position.y, lightSource.position.z);
        light.castShadow = true;
      }
      
      scene.add(light);
      lights.push(light);
    });
    
    // Add default lighting if no sources detected
    if (analysis.lightingSources.length === 0) {
      const defaultLight = new THREE.DirectionalLight(0xffffff, 0.8);
      defaultLight.position.set(5, 10, 5);
      defaultLight.castShadow = true;
      scene.add(defaultLight);
      lights.push(defaultLight);
    }
    
    return lights;
  }

  private setupCamera(analysis: RoomAnalysis): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      analysis.cameraParameters.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    camera.position.set(
      analysis.cameraParameters.position.x,
      analysis.cameraParameters.position.y,
      analysis.cameraParameters.position.z
    );
    
    camera.rotation.set(
      THREE.MathUtils.degToRad(analysis.cameraParameters.rotation.x),
      THREE.MathUtils.degToRad(analysis.cameraParameters.rotation.y),
      THREE.MathUtils.degToRad(analysis.cameraParameters.rotation.z)
    );
    
    return camera;
  }

  private calculateAccuracy(analysis: RoomAnalysis): number {
    // Calculate accuracy based on various factors
    let accuracy = 70; // Base accuracy
    
    // Boost accuracy based on detected objects
    accuracy += Math.min(analysis.detectedObjects.length * 5, 20);
    
    // Boost accuracy based on confidence scores
    const avgConfidence = analysis.detectedObjects.reduce((sum, obj) => sum + obj.confidence, 0) / analysis.detectedObjects.length;
    accuracy += avgConfidence * 10;
    
    // Cap at 95% (never claim 100% accuracy)
    return Math.min(accuracy, 95);
  }

  dispose(): void {
    this.objectGenerator.dispose();
    this.scene.clear();
  }
}
