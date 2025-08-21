import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, ZoomIn, ZoomOut, Move3D } from 'lucide-react';
import * as THREE from 'three';

interface Product3DViewerProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

const Product3DViewer: React.FC<Product3DViewerProps> = ({
  productId,
  productName,
  isOpen,
  onClose
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Object3D | null>(null);
  const frameRef = useRef<number>();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mouse interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen && mountRef.current) {
      initScene();
      createProduct3D();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, productName]);

  const cleanup = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    if (mountRef.current && rendererRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
    }
  };

  const initScene = () => {
    if (!mountRef.current) return;

    try {
      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f5f5);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 5);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      mountRef.current.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 0.5);
      pointLight.position.set(-10, -10, -5);
      scene.add(pointLight);

      // Start render loop
      animate();

      console.log('Scene initialized successfully');
    } catch (error) {
      console.error('Error initializing scene:', error);
      setError('Failed to initialize 3D scene');
      setIsLoading(false);
    }
  };

  const createProduct3D = async () => {
    if (!sceneRef.current) {
      console.log('No scene available for 3D model creation');
      return;
    }

    console.log('Creating 3D model for:', productName);
    setIsLoading(true);
    setError(null);

    try {
      // Add a small delay to simulate loading
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create a simple 3D model based on product name
      let mesh: THREE.Object3D;
      const name = productName.toLowerCase();

      if (name.includes('chandelier')) {
        // Enhanced realistic chandelier
        const group = new THREE.Group();

        if (name.includes('crystal')) {
          // Crystal Chandelier
          const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.5, 12);
          const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            shininess: 150,
            specular: 0x888888
          });
          const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
          group.add(bodyMesh);

          // Decorative rings
          for (let ring = 0; ring < 3; ring++) {
            const ringGeometry = new THREE.TorusGeometry(0.5 + ring * 0.1, 0.03, 8, 32);
            const ringMesh = new THREE.Mesh(ringGeometry, bodyMaterial);
            ringMesh.position.y = -0.3 - ring * 0.4;
            group.add(ringMesh);
          }

          // Crystal drops - multiple tiers
          const crystalMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.95,
            shininess: 200,
            specular: 0xffffff
          });

          // First tier - large crystals
          for (let i = 0; i < 12; i++) {
            const crystal = new THREE.OctahedronGeometry(0.08, 1);
            const crystalMesh = new THREE.Mesh(crystal, crystalMaterial);

            const angle = (i / 12) * Math.PI * 2;
            crystalMesh.position.x = Math.cos(angle) * 0.7;
            crystalMesh.position.z = Math.sin(angle) * 0.7;
            crystalMesh.position.y = -0.5;
            crystalMesh.rotation.y = angle;

            group.add(crystalMesh);
          }

          // Second tier - medium crystals
          for (let i = 0; i < 18; i++) {
            const crystal = new THREE.OctahedronGeometry(0.06, 1);
            const crystalMesh = new THREE.Mesh(crystal, crystalMaterial);

            const angle = (i / 18) * Math.PI * 2;
            crystalMesh.position.x = Math.cos(angle) * 0.9;
            crystalMesh.position.z = Math.sin(angle) * 0.9;
            crystalMesh.position.y = -0.9;
            crystalMesh.rotation.y = angle;

            group.add(crystalMesh);
          }

          // Third tier - small crystals
          for (let i = 0; i < 24; i++) {
            const crystal = new THREE.OctahedronGeometry(0.04, 1);
            const crystalMesh = new THREE.Mesh(crystal, crystalMaterial);

            const angle = (i / 24) * Math.PI * 2;
            crystalMesh.position.x = Math.cos(angle) * 1.1;
            crystalMesh.position.z = Math.sin(angle) * 1.1;
            crystalMesh.position.y = -1.3;
            crystalMesh.rotation.y = angle;

            group.add(crystalMesh);
          }

        } else if (name.includes('modern') || name.includes('led')) {
          // Modern LED Chandelier
          const frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a2a,
            shininess: 100,
            specular: 0x444444
          });

          // Outer ring
          const outerRing = new THREE.TorusGeometry(0.8, 0.05, 8, 32);
          const outerRingMesh = new THREE.Mesh(outerRing, frameMaterial);
          group.add(outerRingMesh);

          // Inner rings
          for (let i = 1; i <= 3; i++) {
            const ring = new THREE.TorusGeometry(0.6 - i * 0.12, 0.03, 6, 24);
            const ringMesh = new THREE.Mesh(ring, frameMaterial);
            ringMesh.position.y = -i * 0.2;
            group.add(ringMesh);
          }

          // LED elements
          const ledMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x444444,
            shininess: 50
          });

          // LED strips on each ring
          for (let ring = 0; ring <= 3; ring++) {
            const radius = ring === 0 ? 0.8 : 0.6 - ring * 0.12;
            const segments = Math.floor(radius * 30);

            for (let i = 0; i < segments; i++) {
              const ledGeometry = new THREE.SphereGeometry(0.01, 6, 6);
              const ledMesh = new THREE.Mesh(ledGeometry, ledMaterial);

              const angle = (i / segments) * Math.PI * 2;
              ledMesh.position.x = Math.cos(angle) * radius;
              ledMesh.position.z = Math.sin(angle) * radius;
              ledMesh.position.y = -ring * 0.2;

              group.add(ledMesh);
            }
          }

        } else {
          // Traditional chandelier
          const material = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            shininess: 80,
            specular: 0x444444
          });

          const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.4, 1.2, 8);
          const bodyMesh = new THREE.Mesh(bodyGeometry, material);
          group.add(bodyMesh);

          // Arms with candle holders
          for (let i = 0; i < 8; i++) {
            const arm = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
            const armMesh = new THREE.Mesh(arm, material);

            const angle = (i / 8) * Math.PI * 2;
            armMesh.position.x = Math.cos(angle) * 0.4;
            armMesh.position.z = Math.sin(angle) * 0.4;
            armMesh.rotation.z = Math.PI / 4;

            group.add(armMesh);

            // Candle holders
            const holder = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
            const holderMesh = new THREE.Mesh(holder, material);
            holderMesh.position.x = Math.cos(angle) * 0.6;
            holderMesh.position.z = Math.sin(angle) * 0.6;
            holderMesh.position.y = 0.3;

            group.add(holderMesh);

            // Candle flames
            const flame = new THREE.SphereGeometry(0.015, 8, 8);
            const flameMaterial = new THREE.MeshPhongMaterial({
              color: 0xffaa00,
              emissive: 0xff4400
            });
            const flameMesh = new THREE.Mesh(flame, flameMaterial);
            flameMesh.position.x = Math.cos(angle) * 0.6;
            flameMesh.position.z = Math.sin(angle) * 0.6;
            flameMesh.position.y = 0.4;

            group.add(flameMesh);
          }
        }

        mesh = group;
      } else if (name.includes('lamp')) {
        // Simple table lamp
        const group = new THREE.Group();

        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        baseMesh.position.y = -0.6;
        group.add(baseMesh);

        // Shade
        const shadeGeometry = new THREE.ConeGeometry(0.5, 0.6, 8);
        const shadeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFAF0 });
        const shadeMesh = new THREE.Mesh(shadeGeometry, shadeMaterial);
        shadeMesh.position.y = 0.3;
        group.add(shadeMesh);

        mesh = group;
      } else if (name.includes('solar') && name.includes('light')) {
        // Solar landscape lights
        const group = new THREE.Group();

        for (let i = 0; i < 4; i++) {
          const lightGroup = new THREE.Group();
          
          // Solar panel
          const panelGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8);
          const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
          const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
          panelMesh.position.y = 0.3;
          lightGroup.add(panelMesh);

          // Light housing
          const housingGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
          const housingMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 });
          const housingMesh = new THREE.Mesh(housingGeometry, housingMaterial);
          housingMesh.position.y = 0.2;
          lightGroup.add(housingMesh);

          // Stake
          const stakeGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.4, 6);
          const stakeMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
          const stakeMesh = new THREE.Mesh(stakeGeometry, stakeMaterial);
          stakeMesh.position.y = 0.0;
          lightGroup.add(stakeMesh);

          // Position lights in a grid
          const x = (i % 2) * 0.5 - 0.25;
          const z = Math.floor(i / 2) * 0.5 - 0.25;
          lightGroup.position.set(x, 0, z);
          group.add(lightGroup);
        }

        mesh = group;
      } else {
        // Default simple box
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x888888 });
        mesh = new THREE.Mesh(geometry, material);
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      sceneRef.current.add(mesh);
      meshRef.current = mesh;

      console.log('3D model created successfully');
      setIsLoading(false);
    } catch (err) {
      console.error('3D Model loading error:', err);
      setError('Failed to load 3D model');
      setIsLoading(false);
    }
  };

  const animate = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    frameRef.current = requestAnimationFrame(animate);

    // Enhanced animations
    if (meshRef.current && !isDragging) {
      // Smooth rotation
      meshRef.current.rotation.y += 0.003;

      // Floating animation for chandeliers
      if (productName.toLowerCase().includes('chandelier')) {
        meshRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.03;
        // Subtle swaying
        meshRef.current.rotation.z = Math.sin(Date.now() * 0.0008) * 0.02;
      }
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    setPreviousMousePosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !meshRef.current) return;

    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    };

    meshRef.current.rotation.y += deltaMove.x * 0.01;
    meshRef.current.rotation.x += deltaMove.y * 0.01;

    setPreviousMousePosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    if (meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
      meshRef.current.position.set(0, 0, 0);
      meshRef.current.scale.set(1, 1, 1);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 5);
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(cameraRef.current.position.z - 0.5, 1);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(cameraRef.current.position.z + 0.5, 10);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">3D Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="px-4 py-2 bg-gray-50 border-b">
          <h3 className="font-medium text-gray-900">{productName}</h3>
          <p className="text-sm text-gray-600">Product ID: {productId}</p>
        </div>

        {/* 3D Viewer */}
        <div className="relative">
          <div
            ref={mountRef}
            className="w-full h-96 bg-gray-100 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading 3D model...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <div className="text-center text-red-600">
                <p className="font-medium">Error loading 3D model</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={resetView}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={zoomIn}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 text-sm text-gray-600">
          <p><strong>Controls:</strong> Click and drag to rotate • Use zoom buttons or scroll to zoom • Reset button to return to original view</p>
        </div>
      </div>
    </div>
  );
};

export default Product3DViewer;
