import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Box,
  Plane,
  Html,
  useProgress,
  Sky
} from '@react-three/drei';
import { X, Home, Lightbulb, Camera, Settings } from 'lucide-react';
import * as THREE from 'three';
import { Product } from '../types';

interface EnhancedRoom3DViewerProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

// Loading component
function RoomLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        <div className="text-charcoal-600 font-medium">
          Building 3D Room... {Math.round(progress)}%
        </div>
      </div>
    </Html>
  );
}

// Room Environment Component
function RoomEnvironment() {
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
          color="#8B7355" 
          roughness={0.8}
          metalness={0.1}
        />
      </Plane>

      {/* Walls */}
      <Plane 
        args={[20, 12]} 
        position={[0, 4, -10]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#F5F5DC" 
          roughness={0.9}
        />
      </Plane>

      <Plane 
        args={[20, 12]} 
        rotation={[0, Math.PI / 2, 0]}
        position={[-10, 4, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#F0F0F0" 
          roughness={0.9}
        />
      </Plane>

      <Plane 
        args={[20, 12]} 
        rotation={[0, -Math.PI / 2, 0]}
        position={[10, 4, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#F0F0F0" 
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
          color="#FFFFFF" 
          roughness={0.8}
        />
      </Plane>
    </group>
  );
}

// Furniture Components
function RoomFurniture() {
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
          {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([lx, lz], j) => (
            <Box key={j} args={[0.03, 0.8, 0.03]} position={[lx, 0, lz]} castShadow>
              <meshStandardMaterial color="#333333" roughness={0.8} />
            </Box>
          ))}
        </group>
      ))}

      {/* Side Cabinet */}
      <Box args={[2, 1, 0.6]} position={[-6, -1, -8]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </Box>
    </group>
  );
}

// Product in Room Component
function ProductInRoom({ product, position }: { product: Product; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && product.category === 'Chandeliers') {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  const createProductModel = () => {
    const group = new THREE.Group();
    
    if (product.category === 'Chandeliers') {
      // Chain from ceiling
      const chain = new THREE.CylinderGeometry(0.01, 0.01, 2, 8);
      const chainMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
      const chainMesh = new THREE.Mesh(chain, chainMaterial);
      chainMesh.position.y = 1;
      chainMesh.castShadow = true;
      group.add(chainMesh);

      // Main body
      const body = new THREE.CylinderGeometry(0.3, 0.5, 1, 8);
      const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xFFD700,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0
      });
      const bodyMesh = new THREE.Mesh(body, bodyMaterial);
      bodyMesh.castShadow = true;
      group.add(bodyMesh);

      // Light emission
      const light = new THREE.PointLight(0xffffff, 1, 10);
      light.position.set(0, 0, 0);
      light.castShadow = true;
      group.add(light);

      // Crystals
      for (let i = 0; i < 8; i++) {
        const crystal = new THREE.OctahedronGeometry(0.05, 0);
        const crystalMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
          roughness: 0,
          transmission: 0.9,
          ior: 2.4
        });
        const crystalMesh = new THREE.Mesh(crystal, crystalMaterial);
        crystalMesh.castShadow = true;
        
        const angle = (i / 8) * Math.PI * 2;
        crystalMesh.position.x = Math.cos(angle) * 0.6;
        crystalMesh.position.z = Math.sin(angle) * 0.6;
        crystalMesh.position.y = -0.3;
        
        group.add(crystalMesh);
      }
    } else if (product.category === 'Wall Lights') {
      // Wall sconce
      const backplate = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
      const plateMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
      const plateMesh = new THREE.Mesh(backplate, plateMaterial);
      plateMesh.rotation.x = Math.PI / 2;
      plateMesh.castShadow = true;
      group.add(plateMesh);

      const shade = new THREE.SphereGeometry(0.15, 16, 16, 0, Math.PI);
      const shadeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        transmission: 0.7
      });
      const shadeMesh = new THREE.Mesh(shade, shadeMaterial);
      shadeMesh.position.z = 0.1;
      shadeMesh.castShadow = true;
      group.add(shadeMesh);

      const wallLight = new THREE.PointLight(0xffffff, 0.5, 5);
      wallLight.position.set(0, 0, 0.2);
      wallLight.castShadow = true;
      group.add(wallLight);
    } else if (product.category === 'Table Lamps') {
      // Table lamp
      const base = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
      const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const baseMesh = new THREE.Mesh(base, baseMaterial);
      baseMesh.position.y = -0.4;
      baseMesh.castShadow = true;
      group.add(baseMesh);

      const stem = new THREE.CylinderGeometry(0.01, 0.01, 0.6, 8);
      const stemMesh = new THREE.Mesh(stem, baseMaterial);
      stemMesh.position.y = -0.1;
      stemMesh.castShadow = true;
      group.add(stemMesh);

      const shade = new THREE.ConeGeometry(0.2, 0.3, 16, 1, true);
      const shadeMaterial = new THREE.MeshStandardMaterial({
        color: 0xF5F5DC,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      const shadeMesh = new THREE.Mesh(shade, shadeMaterial);
      shadeMesh.position.y = 0.3;
      shadeMesh.castShadow = true;
      group.add(shadeMesh);

      const lampLight = new THREE.PointLight(0xffffff, 0.3, 3);
      lampLight.position.set(0, 0.3, 0);
      lampLight.castShadow = true;
      group.add(lampLight);
    }
    
    return group;
  };

  return (
    <group ref={meshRef} position={position}>
      <primitive object={createProductModel()} />
    </group>
  );
}

const EnhancedRoom3DViewer: React.FC<EnhancedRoom3DViewerProps> = ({
  products,
  isOpen,
  onClose
}) => {
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'dining' | 'detail'>('overview');
  const [lightingMode, setLightingMode] = useState<'day' | 'evening' | 'night'>('day');
  const [showProducts, setShowProducts] = useState(true);

  if (!isOpen) return null;

  const getCameraPosition = (): [number, number, number] => {
    switch (cameraPreset) {
      case 'overview': return [8, 6, 8];
      case 'dining': return [0, 2, 6];
      case 'detail': return [2, 1, 2];
      default: return [8, 6, 8];
    }
  };

  const getLightingIntensity = () => {
    switch (lightingMode) {
      case 'day': return { ambient: 0.8, directional: 1.2 };
      case 'evening': return { ambient: 0.4, directional: 0.6 };
      case 'night': return { ambient: 0.2, directional: 0.3 };
      default: return { ambient: 0.8, directional: 1.2 };
    }
  };

  const lighting = getLightingIntensity();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
          <div>
            <h2 className="text-2xl font-bold text-charcoal-900 font-gilda flex items-center">
              <Home className="w-6 h-6 mr-2" />
              3D Room Visualization
            </h2>
            <p className="text-charcoal-600 mt-1">{products.length} lighting products in room</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-charcoal-600" />
          </button>
        </div>

        {/* 3D Room Viewer */}
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
              <RoomEnvironment />
              <RoomFurniture />
              
              {/* Products in Room */}
              {showProducts && products.map((product, index) => {
                let position: [number, number, number];
                
                if (product.category === 'Chandeliers') {
                  position = [0, 8, 0];
                } else if (product.category === 'Wall Lights') {
                  position = [-9.5, 2, -5 + index * 3];
                } else if (product.category === 'Table Lamps') {
                  position = [-6, -0.5, -8];
                } else {
                  position = [index * 2 - 2, 0, 3];
                }
                
                return (
                  <ProductInRoom 
                    key={product.id} 
                    product={product} 
                    position={position}
                  />
                );
              })}
              
              {/* Contact Shadows */}
              <ContactShadows 
                position={[0, -2, 0]} 
                opacity={0.4} 
                scale={20} 
                blur={1} 
                far={10} 
              />
              
              {/* Controls */}
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={3}
                maxDistance={20}
                maxPolarAngle={Math.PI / 2.2}
                target={[0, 0, 0]}
              />
            </Suspense>
          </Canvas>

          {/* Control Panel */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg space-y-4 min-w-[200px]">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Camera View</label>
              <select
                value={cameraPreset}
                onChange={(e) => setCameraPreset(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="overview">Room Overview</option>
                <option value="dining">Dining Area</option>
                <option value="detail">Detail View</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Lighting Mode</label>
              <select
                value={lightingMode}
                onChange={(e) => setLightingMode(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="day">Daylight</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showProducts"
                checked={showProducts}
                onChange={(e) => setShowProducts(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showProducts" className="text-sm text-charcoal-700">Show Products</label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-charcoal-600">
              <p><strong>Navigation:</strong> Click and drag to orbit • Scroll to zoom • Right-click to pan</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                Save Room Design
              </button>
              <button className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors">
                Share Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRoom3DViewer;
