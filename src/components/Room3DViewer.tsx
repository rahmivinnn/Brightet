import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, Move, ZoomIn, ZoomOut, Home, Lightbulb, Camera, Info, Eye } from 'lucide-react';
import * as THREE from 'three';
import { Product } from '../types';
import { DigitalTwin } from '../services/ImageTo3DConverter';
import { RoomAnalysis } from '../services/ComputerVisionService';

interface Room3DViewerProps {
  roomImage?: string;
  roomAnalysis?: RoomAnalysis;
  digitalTwin?: DigitalTwin;
  isOpen: boolean;
  onClose: () => void;
  selectedProducts?: Product[];
}

interface RoomDimensions {
  width: number;
  height: number;
  depth: number;
}

interface CameraMode {
  position: THREE.Vector3;
  target: THREE.Vector3;
  name: string;
}

const Room3DViewer: React.FC<Room3DViewerProps> = ({
  roomImage,
  roomAnalysis,
  digitalTwin,
  isOpen,
  onClose,
  selectedProducts = []
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const roomGroupRef = useRef<THREE.Group | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomDimensions, setRoomDimensions] = useState<RoomDimensions>({
    width: 10,
    height: 8,
    depth: 12
  });
  const [currentCameraMode, setCurrentCameraMode] = useState(0);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showAnalysisInfo, setShowAnalysisInfo] = useState(false);
  const [usingDigitalTwin, setUsingDigitalTwin] = useState(false);

  // Camera modes for different viewing angles
  const cameraModes: CameraMode[] = [
    {
      position: new THREE.Vector3(0, 4, 8),
      target: new THREE.Vector3(0, 2, 0),
      name: 'Overview'
    },
    {
      position: new THREE.Vector3(-6, 3, 0),
      target: new THREE.Vector3(0, 2, 0),
      name: 'Side View'
    },
    {
      position: new THREE.Vector3(0, 2, 6),
      target: new THREE.Vector3(0, 2, -2),
      name: 'Walk-through'
    },
    {
      position: new THREE.Vector3(4, 6, 4),
      target: new THREE.Vector3(0, 0, 0),
      name: 'Corner View'
    }
  ];

  // Update room dimensions when analysis is available
  useEffect(() => {
    if (roomAnalysis) {
      setRoomDimensions({
        width: roomAnalysis.dimensions.width * 2, // Scale up for better visualization
        height: roomAnalysis.dimensions.height * 2,
        depth: roomAnalysis.dimensions.depth * 2
      });
    }
  }, [roomAnalysis]);

  useEffect(() => {
    if (!isOpen) return;

    const initTimer = setTimeout(() => {
      if (!mountRef.current) {
        setError('Failed to initialize 3D room viewer');
        return;
      }

      try {
        initializeScene();
        if (digitalTwin) {
          loadDigitalTwin();
        } else if (roomImage && roomAnalysis) {
          processRoomImageWithAnalysis();
        } else if (roomImage) {
          processRoomImage();
        } else {
          createDefaultRoom();
        }
        animate();
      } catch (error) {
        console.error('Error initializing 3D room viewer:', error);
        setError('Failed to initialize 3D room viewer');
        setIsLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
      cleanup();
    };
  }, [isOpen, roomImage]);

  const initializeScene = () => {
    if (!mountRef.current) return;

    console.log('Initializing 3D room scene...');

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.copy(cameraModes[0].position);
    camera.lookAt(cameraModes[0].target);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Advanced Lighting Setup
    setupLighting(scene);

    console.log('3D room scene initialized successfully');
  };

  const setupLighting = (scene: THREE.Scene) => {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Main directional light (sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Warm interior lighting
    const pointLight1 = new THREE.PointLight(0xfff8dc, 0.6, 20);
    pointLight1.position.set(0, 6, 0);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    // Additional fill lights
    const pointLight2 = new THREE.PointLight(0xffffff, 0.4, 15);
    pointLight2.position.set(-5, 4, -5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffffff, 0.4, 15);
    pointLight3.position.set(5, 4, 5);
    scene.add(pointLight3);
  };

  const loadDigitalTwin = async () => {
    if (!digitalTwin) return;

    setIsProcessingImage(true);
    setIsLoading(true);
    setUsingDigitalTwin(true);

    try {
      console.log('🏗️ Loading digital twin with', digitalTwin.furniture.length, 'objects');

      // Use the pre-generated digital twin scene
      if (sceneRef.current && digitalTwin.scene) {
        // Clear existing scene
        while (sceneRef.current.children.length > 0) {
          sceneRef.current.remove(sceneRef.current.children[0]);
        }

        // Copy all objects from digital twin scene
        digitalTwin.scene.children.forEach(child => {
          sceneRef.current!.add(child.clone());
        });

        // Update room dimensions from analysis
        if (digitalTwin.metadata.analysis) {
          setRoomDimensions({
            width: digitalTwin.metadata.analysis.dimensions.width,
            height: digitalTwin.metadata.analysis.dimensions.height,
            depth: digitalTwin.metadata.analysis.dimensions.depth
          });
        }

        // Position camera based on analysis
        if (cameraRef.current && digitalTwin.camera) {
          cameraRef.current.position.copy(digitalTwin.camera.position);
          cameraRef.current.rotation.copy(digitalTwin.camera.rotation);
          cameraRef.current.fov = digitalTwin.camera.fov;
          cameraRef.current.updateProjectionMatrix();
        }

        console.log(`✅ Digital twin loaded successfully with ${digitalTwin.metadata.accuracy.toFixed(1)}% accuracy`);
      }

      setIsProcessingImage(false);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error loading digital twin:', error);
      setError('Failed to load digital twin');
      setIsProcessingImage(false);
      setIsLoading(false);
      setUsingDigitalTwin(false);
    }
  };

  const processRoomImageWithAnalysis = async () => {
    if (!roomImage || !roomAnalysis) return;

    setIsProcessingImage(true);
    setIsLoading(true);

    try {
      // Use AI analysis data to create accurate 3D room
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create 3D room based on precise AI analysis
      createRoomFromAnalysis(roomAnalysis);

      setIsProcessingImage(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing room with analysis:', error);
      setError('Failed to process room analysis');
      setIsProcessingImage(false);
      setIsLoading(false);
    }
  };

  const processRoomImage = async () => {
    setIsProcessingImage(true);
    setIsLoading(true);

    try {
      // Simulate AI processing of room image
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Analyze image and extract room dimensions (simulated)
      const analyzedDimensions = analyzeRoomImage(roomImage!);
      setRoomDimensions(analyzedDimensions);

      // Create 3D room based on analysis
      createRoomFromImage(analyzedDimensions);

      setIsProcessingImage(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing room image:', error);
      setError('Failed to process room image');
      setIsProcessingImage(false);
      setIsLoading(false);
    }
  };

  const analyzeRoomImage = (imageUrl: string): RoomDimensions => {
    // Simulated AI analysis - in real implementation, this would use computer vision
    // to analyze the room dimensions, furniture placement, lighting conditions, etc.
    
    // For now, return reasonable default dimensions
    return {
      width: Math.random() * 5 + 8,  // 8-13 meters
      height: Math.random() * 2 + 7, // 7-9 meters  
      depth: Math.random() * 4 + 10  // 10-14 meters
    };
  };

  const createRoomFromAnalysis = (analysis: RoomAnalysis) => {
    if (!sceneRef.current) return;

    const roomGroup = new THREE.Group();
    roomGroupRef.current = roomGroup;

    const dimensions = {
      width: analysis.dimensions.width * 2,
      height: analysis.dimensions.height * 2,
      depth: analysis.dimensions.depth * 2
    };

    // Create room structure with accurate dimensions
    createWalls(roomGroup, dimensions);
    createFloor(roomGroup, dimensions);
    createCeiling(roomGroup, dimensions);

    // Add furniture based on AI analysis
    addFurnitureFromAnalysis(roomGroup, dimensions, analysis);

    // Add lighting based on recommendations
    addRecommendedLighting(roomGroup, dimensions, analysis);

    // Place selected products from catalog
    addSelectedProducts(roomGroup, dimensions);

    sceneRef.current.add(roomGroup);
  };

  const createRoomFromImage = (dimensions: RoomDimensions) => {
    if (!sceneRef.current) return;

    const roomGroup = new THREE.Group();
    roomGroupRef.current = roomGroup;

    // Create room structure
    createWalls(roomGroup, dimensions);
    createFloor(roomGroup, dimensions);
    createCeiling(roomGroup, dimensions);

    // Add furniture and decorations based on image analysis
    addBasicFurniture(roomGroup, dimensions);

    // Place lighting products from catalog
    placeLightingProducts(roomGroup, dimensions);

    sceneRef.current.add(roomGroup);
  };

  const createDefaultRoom = () => {
    if (!sceneRef.current) return;

    const roomGroup = new THREE.Group();
    roomGroupRef.current = roomGroup;

    createWalls(roomGroup, roomDimensions);
    createFloor(roomGroup, roomDimensions);
    createCeiling(roomGroup, roomDimensions);
    addBasicFurniture(roomGroup, roomDimensions);
    placeLightingProducts(roomGroup, roomDimensions);

    sceneRef.current.add(roomGroup);
    setIsLoading(false);
  };

  const createWalls = (group: THREE.Group, dimensions: RoomDimensions) => {
    const wallMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xf5f5f5,
      side: THREE.DoubleSide
    });

    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(dimensions.width, dimensions.height),
      wallMaterial
    );
    backWall.position.set(0, dimensions.height / 2, -dimensions.depth / 2);
    backWall.receiveShadow = true;
    group.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(dimensions.depth, dimensions.height),
      wallMaterial
    );
    leftWall.position.set(-dimensions.width / 2, dimensions.height / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    group.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(dimensions.depth, dimensions.height),
      wallMaterial
    );
    rightWall.position.set(dimensions.width / 2, dimensions.height / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    group.add(rightWall);
  };

  const createFloor = (group: THREE.Group, dimensions: RoomDimensions) => {
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xd2b48c // Tan color for wooden floor
    });

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(dimensions.width, dimensions.depth),
      floorMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    group.add(floor);
  };

  const createCeiling = (group: THREE.Group, dimensions: RoomDimensions) => {
    const ceilingMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      side: THREE.DoubleSide
    });

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(dimensions.width, dimensions.depth),
      ceilingMaterial
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = dimensions.height;
    ceiling.receiveShadow = true;
    group.add(ceiling);
  };

  const addBasicFurniture = (group: THREE.Group, dimensions: RoomDimensions) => {
    // Add a simple sofa
    const sofaGeometry = new THREE.BoxGeometry(3, 1, 1.5);
    const sofaMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const sofa = new THREE.Mesh(sofaGeometry, sofaMaterial);
    sofa.position.set(-2, 0.5, 2);
    sofa.castShadow = true;
    sofa.receiveShadow = true;
    group.add(sofa);

    // Add a coffee table
    const tableGeometry = new THREE.BoxGeometry(2, 0.1, 1);
    const tableMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(-2, 1.05, 0);
    table.castShadow = true;
    table.receiveShadow = true;
    group.add(table);
  };

  const placeLightingProducts = (group: THREE.Group, dimensions: RoomDimensions) => {
    selectedProducts.forEach((product, index) => {
      const productMesh = createProductMesh(product);
      if (productMesh) {
        // Position products strategically in the room
        const x = (index % 2 === 0 ? -1 : 1) * (dimensions.width / 4);
        const z = (index % 3 - 1) * (dimensions.depth / 4);
        
        if (product.name.toLowerCase().includes('chandelier')) {
          productMesh.position.set(x, dimensions.height - 1, z);
        } else if (product.name.toLowerCase().includes('wall')) {
          productMesh.position.set(dimensions.width / 2 - 0.5, dimensions.height / 2, z);
        } else {
          productMesh.position.set(x, 1, z);
        }
        
        group.add(productMesh);
      }
    });
  };

  const createProductMesh = (product: Product): THREE.Object3D | null => {
    const name = product.name.toLowerCase();
    
    if (name.includes('chandelier')) {
      const group = new THREE.Group();
      const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.0, 8);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
      const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
      group.add(bodyMesh);
      
      // Add light emission
      const light = new THREE.PointLight(0xffffff, 1, 10);
      light.position.set(0, -0.5, 0);
      light.castShadow = true;
      group.add(light);
      
      return group;
    } else if (name.includes('lamp')) {
      const group = new THREE.Group();
      const baseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
      const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
      const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
      group.add(baseMesh);
      
      const shadeGeometry = new THREE.ConeGeometry(0.4, 0.5, 8);
      const shadeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFAF0 });
      const shadeMesh = new THREE.Mesh(shadeGeometry, shadeMaterial);
      shadeMesh.position.y = 0.8;
      group.add(shadeMesh);
      
      // Add light emission
      const light = new THREE.PointLight(0xfff8dc, 0.8, 8);
      light.position.set(0, 0.8, 0);
      group.add(light);
      
      return group;
    }
    
    return null;
  };

  const addFurnitureFromAnalysis = (group: THREE.Group, dimensions: RoomDimensions, analysis: RoomAnalysis) => {
    // Add furniture based on AI analysis
    analysis.existingFurniture.forEach((furnitureType, index) => {
      const furniture = createFurnitureByType(furnitureType, index, dimensions);
      if (furniture) {
        group.add(furniture);
      }
    });
  };

  const addRecommendedLighting = (group: THREE.Group, dimensions: RoomDimensions, analysis: RoomAnalysis) => {
    // Add lighting based on AI recommendations
    analysis.recommendations.forEach((recommendation, index) => {
      if (recommendation.toLowerCase().includes('pendant')) {
        const pendant = createPendantLight(index, dimensions);
        group.add(pendant);
      } else if (recommendation.toLowerCase().includes('sconce')) {
        const sconce = createWallSconce(index, dimensions);
        group.add(sconce);
      } else if (recommendation.toLowerCase().includes('chandelier')) {
        const chandelier = createChandelier(dimensions);
        group.add(chandelier);
      } else if (recommendation.toLowerCase().includes('floor lamp')) {
        const floorLamp = createFloorLamp(index, dimensions);
        group.add(floorLamp);
      }
    });
  };

  const addSelectedProducts = (group: THREE.Group, dimensions: RoomDimensions) => {
    selectedProducts.forEach((product, index) => {
      const productMesh = createProductMesh(product);
      if (productMesh) {
        // Position products strategically in the room
        const x = (index % 2 === 0 ? -1 : 1) * (dimensions.width / 4);
        const z = (index % 3 - 1) * (dimensions.depth / 4);

        if (product.name.toLowerCase().includes('chandelier')) {
          productMesh.position.set(x, dimensions.height - 1, z);
        } else if (product.name.toLowerCase().includes('wall')) {
          productMesh.position.set(dimensions.width / 2 - 0.5, dimensions.height / 2, z);
        } else {
          productMesh.position.set(x, 1, z);
        }

        group.add(productMesh);
      }
    });
  };

  const createFurnitureByType = (type: string, index: number, dimensions: RoomDimensions): THREE.Object3D | null => {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('sofa')) {
      const geometry = new THREE.BoxGeometry(3, 1, 1.5);
      const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const sofa = new THREE.Mesh(geometry, material);
      sofa.position.set(-dimensions.width/4, 0.5, 0);
      sofa.castShadow = true;
      sofa.receiveShadow = true;
      return sofa;
    } else if (lowerType.includes('table')) {
      const geometry = new THREE.BoxGeometry(2, 0.1, 1);
      const material = new THREE.MeshLambertMaterial({ color: 0x654321 });
      const table = new THREE.Mesh(geometry, material);
      table.position.set(0, 1.05, 0);
      table.castShadow = true;
      table.receiveShadow = true;
      return table;
    }

    return null;
  };

  const createPendantLight = (index: number, dimensions: RoomDimensions): THREE.Object3D => {
    const group = new THREE.Group();
    const geometry = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
    const pendant = new THREE.Mesh(geometry, material);

    const light = new THREE.PointLight(0xffffff, 0.8, 8);
    light.position.set(0, -0.3, 0);
    light.castShadow = true;

    group.add(pendant);
    group.add(light);
    group.position.set((index - 1) * 2, dimensions.height - 2, 0);

    return group;
  };

  const createWallSconce = (index: number, dimensions: RoomDimensions): THREE.Object3D => {
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(0.3, 0.5, 0.2);
    const material = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 });
    const sconce = new THREE.Mesh(geometry, material);

    const light = new THREE.PointLight(0xffffff, 0.6, 6);
    light.position.set(0, 0, 0.2);
    light.castShadow = true;

    group.add(sconce);
    group.add(light);
    group.position.set(dimensions.width/2 - 0.2, dimensions.height/2, (index - 1) * 3);

    return group;
  };

  const createChandelier = (dimensions: RoomDimensions): THREE.Object3D => {
    const group = new THREE.Group();
    const geometry = new THREE.CylinderGeometry(0.5, 0.8, 1.2, 12);
    const material = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
    const chandelier = new THREE.Mesh(geometry, material);

    const light = new THREE.PointLight(0xffffff, 1.5, 15);
    light.position.set(0, -0.6, 0);
    light.castShadow = true;

    group.add(chandelier);
    group.add(light);
    group.position.set(0, dimensions.height - 1.5, 0);

    return group;
  };

  const createFloorLamp = (index: number, dimensions: RoomDimensions): THREE.Object3D => {
    const group = new THREE.Group();

    // Lamp base
    const baseGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.1, 8);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, 0.05, 0);

    // Lamp pole
    const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 8);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(0, 2, 0);

    // Lamp shade
    const shadeGeometry = new THREE.CylinderGeometry(0.4, 0.6, 0.8, 8);
    const shadeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFF0 });
    const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
    shade.position.set(0, 4, 0);

    const light = new THREE.PointLight(0xffffff, 0.7, 10);
    light.position.set(0, 4, 0);
    light.castShadow = true;

    group.add(base);
    group.add(pole);
    group.add(shade);
    group.add(light);

    const x = (index % 2 === 0 ? -1 : 1) * (dimensions.width / 3);
    const z = (index % 2 === 0 ? -1 : 1) * (dimensions.depth / 3);
    group.position.set(x, 0, z);

    return group;
  };

  const switchCameraMode = () => {
    if (!cameraRef.current) return;
    
    const nextMode = (currentCameraMode + 1) % cameraModes.length;
    setCurrentCameraMode(nextMode);
    
    const mode = cameraModes[nextMode];
    
    // Smooth camera transition
    const startPos = cameraRef.current.position.clone();
    const startTarget = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraRef.current.quaternion).add(cameraRef.current.position);
    
    let progress = 0;
    const animateCamera = () => {
      progress += 0.05;
      if (progress >= 1) {
        cameraRef.current!.position.copy(mode.position);
        cameraRef.current!.lookAt(mode.target);
        return;
      }
      
      cameraRef.current!.position.lerpVectors(startPos, mode.position, progress);
      const currentTarget = new THREE.Vector3().lerpVectors(startTarget, mode.target, progress);
      cameraRef.current!.lookAt(currentTarget);
      
      requestAnimationFrame(animateCamera);
    };
    
    animateCamera();
  };

  const animate = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    try {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationIdRef.current = requestAnimationFrame(animate);
    } catch (error) {
      console.error('Room animation error:', error);
    }
  };

  const cleanup = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      sceneRef.current.clear();
    }
    
    if (rendererRef.current && mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
      mountRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream-200 bg-cream-50">
          <div className="flex items-center space-x-4">
            <Home className="w-6 h-6 text-accent-600" />
            <div>
              <h2 className="text-2xl font-bold text-charcoal-900 font-gilda">3D Room Visualization</h2>
              <p className="text-charcoal-600">Interactive room design with lighting preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-charcoal-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[80vh]">
          {/* 3D Viewer */}
          <div className="flex-1 relative bg-cream-50">
            <div ref={mountRef} className="w-full h-full" />
            
            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-cream-50 bg-opacity-90">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-500 mx-auto mb-4"></div>
                  <p className="text-charcoal-700 text-lg font-medium">
                    {isProcessingImage ? 'Processing room image with AI...' : 'Building 3D room environment...'}
                  </p>
                  <p className="text-charcoal-600 text-sm mt-2">
                    Creating realistic lighting and spatial mapping
                  </p>
                </div>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-cream-50">
                <div className="text-center">
                  <p className="text-charcoal-700 mb-4 text-lg">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setIsLoading(true);
                      createDefaultRoom();
                    }}
                    className="bg-accent-500 text-white px-6 py-3 rounded-lg hover:bg-accent-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
            
            {/* Camera Controls */}
            {!isLoading && !error && (
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={switchCameraMode}
                  className="bg-white p-3 rounded-lg shadow-warm hover:shadow-xl transition-all flex items-center space-x-2"
                  title={`Switch to ${cameraModes[(currentCameraMode + 1) % cameraModes.length].name}`}
                >
                  <Camera className="w-5 h-5 text-charcoal-600" />
                  <span className="text-sm font-medium text-charcoal-700">
                    {cameraModes[currentCameraMode].name}
                  </span>
                </button>

                {/* Digital Twin Info Button */}
                {usingDigitalTwin && digitalTwin && (
                  <button
                    onClick={() => setShowAnalysisInfo(!showAnalysisInfo)}
                    className="bg-gradient-to-r from-accent-500 to-warm-500 text-white p-3 rounded-lg shadow-warm hover:shadow-xl transition-all flex items-center space-x-2"
                    title="View AI Analysis Details"
                  >
                    <Info className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      AI Analysis
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Digital Twin Analysis Overlay */}
            {showAnalysisInfo && digitalTwin && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-charcoal-900 flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-accent-600" />
                    Digital Twin Analysis
                  </h4>
                  <button
                    onClick={() => setShowAnalysisInfo(false)}
                    className="text-charcoal-400 hover:text-charcoal-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Accuracy:</span>
                    <span className="font-semibold text-green-600">
                      {digitalTwin.metadata.accuracy.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Objects Detected:</span>
                    <span className="font-semibold text-charcoal-900">
                      {digitalTwin.metadata.analysis.detectedObjects.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Processing Time:</span>
                    <span className="font-semibold text-charcoal-900">
                      {(digitalTwin.metadata.processingTime / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Room Type:</span>
                    <span className="font-semibold text-charcoal-900">
                      {digitalTwin.metadata.analysis.roomType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Style:</span>
                    <span className="font-semibold text-charcoal-900">
                      {digitalTwin.metadata.analysis.style}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="w-80 bg-white border-l border-cream-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-4 font-gilda">Room Details</h3>
            
            <div className="space-y-4">
              {/* Digital Twin Status */}
              {usingDigitalTwin && digitalTwin && (
                <div className="bg-gradient-to-r from-accent-50 to-warm-50 p-4 rounded-lg border border-accent-200">
                  <h4 className="font-medium text-charcoal-800 mb-2 flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-accent-600" />
                    Digital Twin Active
                  </h4>
                  <div className="text-sm text-charcoal-600 space-y-1">
                    <p className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className="font-semibold text-green-600">
                        {digitalTwin.metadata.accuracy.toFixed(1)}%
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span>Objects:</span>
                      <span className="font-semibold">
                        {digitalTwin.metadata.analysis.detectedObjects.length}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span>Room Type:</span>
                      <span className="font-semibold">
                        {digitalTwin.metadata.analysis.roomType}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-cream-50 p-4 rounded-lg">
                <h4 className="font-medium text-charcoal-800 mb-2">Dimensions</h4>
                <div className="text-sm text-charcoal-600 space-y-1">
                  <p>Width: {roomDimensions.width.toFixed(1)}m</p>
                  <p>Height: {roomDimensions.height.toFixed(1)}m</p>
                  <p>Depth: {roomDimensions.depth.toFixed(1)}m</p>
                </div>
              </div>

              {/* Detected Objects */}
              {digitalTwin && digitalTwin.metadata.analysis.detectedObjects.length > 0 && (
                <div className="bg-cream-50 p-4 rounded-lg">
                  <h4 className="font-medium text-charcoal-800 mb-2">Detected Objects</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {digitalTwin.metadata.analysis.detectedObjects.map((obj, index) => (
                      <div key={obj.id} className="text-sm bg-white p-2 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-charcoal-800 capitalize">
                              {obj.category.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-charcoal-500">
                              {obj.material} • {obj.color}
                            </p>
                          </div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {(obj.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              {digitalTwin && digitalTwin.metadata.analysis.recommendations.length > 0 && (
                <div className="bg-cream-50 p-4 rounded-lg">
                  <h4 className="font-medium text-charcoal-800 mb-2">AI Recommendations</h4>
                  <div className="space-y-2">
                    {digitalTwin.metadata.analysis.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm text-charcoal-600 bg-white p-2 rounded">
                        <p>{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedProducts.length > 0 && (
                <div className="bg-cream-50 p-4 rounded-lg">
                  <h4 className="font-medium text-charcoal-800 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Lighting Products ({selectedProducts.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedProducts.map((product, index) => (
                      <div key={product.id} className="text-sm text-charcoal-600 bg-white p-2 rounded">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-accent-600">${product.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-cream-50 p-4 rounded-lg">
                <h4 className="font-medium text-charcoal-800 mb-2">Camera Views</h4>
                <div className="grid grid-cols-2 gap-2">
                  {cameraModes.map((mode, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentCameraMode(index);
                        switchCameraMode();
                      }}
                      className={`p-2 text-xs rounded transition-colors ${
                        currentCameraMode === index
                          ? 'bg-accent-500 text-white'
                          : 'bg-white text-charcoal-600 hover:bg-accent-100'
                      }`}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room3DViewer;
