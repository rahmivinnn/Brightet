import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Plane, Box, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Product } from '../types';

interface Product3DRoomPreviewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

// Room Types
type RoomType = 'dining' | 'living' | 'bedroom' | 'kitchen' | 'foyer';

// Room Environment Component
function RoomEnvironment({ roomType }: { roomType: RoomType }) {
  const getRoomColors = () => {
    switch (roomType) {
      case 'dining':
        return { floor: '#8B7355', walls: '#F5F5DC', ceiling: '#FFFFFF' };
      case 'living':
        return { floor: '#A0826D', walls: '#F0F0F0', ceiling: '#FAFAFA' };
      case 'bedroom':
        return { floor: '#D2B48C', walls: '#E6E6FA', ceiling: '#F8F8FF' };
      case 'kitchen':
        return { floor: '#696969', walls: '#F5F5F5', ceiling: '#FFFFFF' };
      case 'foyer':
        return { floor: '#8B4513', walls: '#FFF8DC', ceiling: '#FFFAF0' };
      default:
        return { floor: '#8B7355', walls: '#F5F5DC', ceiling: '#FFFFFF' };
    }
  };

  const colors = getRoomColors();

  return (
    <group>
      {/* Floor */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color={colors.floor} 
          roughness={0.8}
          metalness={0.1}
        />
      </Plane>

      {/* Back Wall */}
      <Plane 
        args={[20, 12]} 
        position={[0, 4, -10]}
        receiveShadow
      >
        <meshStandardMaterial 
          color={colors.walls} 
          roughness={0.9}
        />
      </Plane>

      {/* Left Wall */}
      <Plane 
        args={[20, 12]} 
        rotation={[0, Math.PI / 2, 0]}
        position={[-10, 4, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color={colors.walls} 
          roughness={0.9}
        />
      </Plane>

      {/* Right Wall */}
      <Plane 
        args={[20, 12]} 
        rotation={[0, -Math.PI / 2, 0]}
        position={[10, 4, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color={colors.walls} 
          roughness={0.9}
        />
      </Plane>

      {/* Ceiling */}
      <Plane 
        args={[20, 20]} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 10, 0]}
      >
        <meshStandardMaterial 
          color={colors.ceiling} 
          roughness={0.8}
        />
      </Plane>
    </group>
  );
}

// Room Furniture Component
function RoomFurniture({ roomType }: { roomType: RoomType }) {
  const getFurniture = () => {
    switch (roomType) {
      case 'dining':
        return (
          <group>
            {/* Dining Table */}
            <Box args={[4, 0.1, 2]} position={[0, -1.5, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#8B4513" roughness={0.7} />
            </Box>
            
            {/* Table Legs */}
            {[[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].map(([x, z], i) => (
              <Box key={i} args={[0.1, 1.2, 0.1]} position={[x, -1.9, z]} castShadow>
                <meshStandardMaterial color="#654321" roughness={0.8} />
              </Box>
            ))}

            {/* Chairs */}
            {[[-2.5, 0], [2.5, 0], [0, -2.5], [0, 2.5]].map(([x, z], i) => (
              <group key={i} position={[x, -1.5, z]}>
                <Box args={[0.5, 0.05, 0.5]} position={[0, 0.4, 0]} castShadow>
                  <meshStandardMaterial color="#4A4A4A" roughness={0.6} />
                </Box>
                <Box args={[0.5, 0.8, 0.05]} position={[0, 0.8, -0.225]} castShadow>
                  <meshStandardMaterial color="#4A4A4A" roughness={0.6} />
                </Box>
              </group>
            ))}
          </group>
        );

      case 'living':
        return (
          <group>
            {/* Sofa */}
            <Box args={[4, 1, 1.5]} position={[-2, -1, 2]} castShadow receiveShadow>
              <meshStandardMaterial color="#8B4513" roughness={0.7} />
            </Box>
            
            {/* Coffee Table */}
            <Box args={[2, 0.1, 1]} position={[-2, -1.45, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#654321" roughness={0.7} />
            </Box>

            {/* TV Stand */}
            <Box args={[3, 0.5, 0.8]} position={[0, -1.75, -8]} castShadow receiveShadow>
              <meshStandardMaterial color="#2F2F2F" roughness={0.6} />
            </Box>
          </group>
        );

      case 'bedroom':
        return (
          <group>
            {/* Bed */}
            <Box args={[3, 0.5, 5]} position={[-3, -1.75, -3]} castShadow receiveShadow>
              <meshStandardMaterial color="#8B4513" roughness={0.7} />
            </Box>
            
            {/* Nightstand */}
            <Box args={[1, 1, 1]} position={[-6, -1.5, -3]} castShadow receiveShadow>
              <meshStandardMaterial color="#654321" roughness={0.7} />
            </Box>
          </group>
        );

      case 'kitchen':
        return (
          <group>
            {/* Kitchen Island */}
            <Box args={[4, 1, 2]} position={[0, -1.5, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
            </Box>
            
            {/* Cabinets */}
            <Box args={[8, 2, 1]} position={[0, -1, -9]} castShadow receiveShadow>
              <meshStandardMaterial color="#8B4513" roughness={0.7} />
            </Box>
          </group>
        );

      case 'foyer':
        return (
          <group>
            {/* Console Table */}
            <Box args={[3, 0.1, 1]} position={[0, -1, -8]} castShadow receiveShadow>
              <meshStandardMaterial color="#8B4513" roughness={0.7} />
            </Box>
          </group>
        );

      default:
        return null;
    }
  };

  return getFurniture();
}

// Product 3D Model Component
function Product3DModel({ product, position }: { product: Product; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && product.category === 'Chandeliers') {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const createProductModel = () => {
    const group = new THREE.Group();
    
    if (product.category === 'Chandeliers') {
      // Main fixture body
      const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.8, 8);
      const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: product.name.includes('Gold') ? 0xFFD700 : 
               product.name.includes('Chrome') || product.name.includes('Silver') ? 0xC0C0C0 : 
               product.name.includes('Black') ? 0x2F2F2F : 0xFFD700,
        shininess: 100 
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      group.add(body);

      // Crystal elements
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 0.8;
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.05),
          new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF, 
            transparent: true, 
            opacity: 0.8,
            shininess: 100 
          })
        );
        crystal.position.set(
          Math.cos(angle) * radius,
          -0.5 + Math.sin(i * 0.5) * 0.2,
          Math.sin(angle) * radius
        );
        group.add(crystal);
      }

      // Light emission
      const light = new THREE.PointLight(0xfff8dc, 1.5, 10);
      light.position.set(0, 0, 0);
      light.castShadow = true;
      group.add(light);

    } else if (product.category === 'Wall Lights') {
      // Wall sconce
      const baseGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 6);
      const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      group.add(base);

      const shadeGeometry = new THREE.SphereGeometry(0.3, 8, 6);
      const shadeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFFAF0, 
        transparent: true, 
        opacity: 0.8 
      });
      const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
      shade.position.y = 0.3;
      group.add(shade);

      const light = new THREE.PointLight(0xfff8dc, 0.8, 6);
      light.position.set(0, 0.3, 0);
      group.add(light);

    } else if (product.category === 'Table Lamps') {
      // Table lamp base
      const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 8);
      const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      group.add(base);

      // Lamp shade
      const shadeGeometry = new THREE.ConeGeometry(0.4, 0.5, 8);
      const shadeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFAF0 });
      const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
      shade.position.y = 0.8;
      group.add(shade);

      const light = new THREE.PointLight(0xfff8dc, 0.6, 5);
      light.position.set(0, 0.8, 0);
      group.add(light);
    }
    
    return group;
  };

  return (
    <group ref={meshRef} position={position}>
      <primitive object={createProductModel()} />
    </group>
  );
}

// Loading Component
function RoomLoader() {
  return (
    <Html center>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto mb-2"></div>
        <p className="text-charcoal-700 text-sm">Loading 3D Room...</p>
      </div>
    </Html>
  );
}

const Product3DRoomPreview: React.FC<Product3DRoomPreviewProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const [roomType, setRoomType] = useState<RoomType>('dining');
  const [lightingMode, setLightingMode] = useState<'day' | 'evening' | 'night'>('day');
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'close' | 'detail'>('overview');

  if (!isOpen) return null;

  const getCameraPosition = (): [number, number, number] => {
    switch (cameraPreset) {
      case 'overview': return [8, 6, 8];
      case 'close': return [4, 3, 4];
      case 'detail': return [2, 1, 2];
      default: return [8, 6, 8];
    }
  };

  const getProductPosition = (): [number, number, number] => {
    if (product.category === 'Chandeliers') {
      return [0, 8, 0];
    } else if (product.category === 'Wall Lights') {
      return [-9.5, 2, -5];
    } else if (product.category === 'Table Lamps') {
      return roomType === 'bedroom' ? [-6, -0.5, -3] : [-2, -1, 0];
    } else {
      return [0, 0, 0];
    }
  };

  const getLighting = () => {
    switch (lightingMode) {
      case 'day': return { ambient: 0.6, directional: 1.0 };
      case 'evening': return { ambient: 0.4, directional: 0.6 };
      case 'night': return { ambient: 0.2, directional: 0.3 };
      default: return { ambient: 0.6, directional: 1.0 };
    }
  };

  const lighting = getLighting();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[95vw] h-[90vh] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <div>
            <h2 className="text-2xl font-bold text-charcoal-800">{product.name}</h2>
            <p className="text-charcoal-600 mt-1">3D Room Preview - ${product.price}</p>
          </div>
          <button
            onClick={onClose}
            className="text-charcoal-400 hover:text-charcoal-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1">
          {/* Controls Panel */}
          <div className="w-80 p-6 border-r border-cream-200 bg-cream-50">
            <div className="space-y-6">
              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as RoomType)}
                  className="w-full p-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                >
                  <option value="dining">Dining Room</option>
                  <option value="living">Living Room</option>
                  <option value="bedroom">Bedroom</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="foyer">Foyer/Entryway</option>
                </select>
              </div>

              {/* Lighting Mode */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Time of Day
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['day', 'evening', 'night'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setLightingMode(mode)}
                      className={`p-2 text-sm rounded-md capitalize ${
                        lightingMode === mode
                          ? 'bg-accent-500 text-white'
                          : 'bg-white text-charcoal-700 border border-cream-300 hover:bg-cream-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Preset */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Camera View
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['overview', 'close', 'detail'] as const).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setCameraPreset(preset)}
                      className={`p-2 text-sm rounded-md capitalize ${
                        cameraPreset === preset
                          ? 'bg-accent-500 text-white'
                          : 'bg-white text-charcoal-700 border border-cream-300 hover:bg-cream-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-white p-4 rounded-lg border border-cream-200">
                <h3 className="font-semibold text-charcoal-800 mb-2">Product Details</h3>
                <div className="space-y-2 text-sm text-charcoal-600">
                  <p><span className="font-medium">Category:</span> {product.category}</p>
                  <p><span className="font-medium">Brand:</span> {product.brand}</p>
                  <p><span className="font-medium">Dimensions:</span> {product.dimensions}</p>
                  <p><span className="font-medium">Material:</span> {product.material}</p>
                  <p><span className="font-medium">Rating:</span> ⭐ {product.rating}/5 ({product.reviews} reviews)</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-accent-50 p-4 rounded-lg border border-accent-200">
                <h3 className="font-semibold text-accent-800 mb-2">Controls</h3>
                <div className="space-y-1 text-sm text-accent-700">
                  <p>• Drag to rotate view</p>
                  <p>• Scroll to zoom in/out</p>
                  <p>• Right-click drag to pan</p>
                  <p>• Try different rooms & lighting</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Viewer */}
          <div className="flex-1 relative">
            <Canvas
              camera={{ position: getCameraPosition(), fov: 60 }}
              style={{ background: 'linear-gradient(135deg, #87CEEB 0%, #98D8E8 100%)' }}
              shadows
            >
              <Suspense fallback={<RoomLoader />}>
                {/* Lighting */}
                <ambientLight intensity={lighting.ambient} />
                <directionalLight 
                  position={[10, 15, 5]} 
                  intensity={lighting.directional}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  shadow-camera-far={50}
                  shadow-camera-left={-20}
                  shadow-camera-right={20}
                  shadow-camera-top={20}
                  shadow-camera-bottom={-20}
                />
                
                {/* Environment */}
                {lightingMode === 'day' && <Sky sunPosition={[100, 20, 100]} />}
                <Environment preset={lightingMode === 'day' ? 'sunset' : 'night'} />
                
                {/* Room */}
                <RoomEnvironment roomType={roomType} />
                <RoomFurniture roomType={roomType} />
                
                {/* Product */}
                <Product3DModel 
                  product={product} 
                  position={getProductPosition()}
                />
                
                {/* Controls */}
                <OrbitControls 
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={3}
                  maxDistance={20}
                  maxPolarAngle={Math.PI / 2}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product3DRoomPreview;
