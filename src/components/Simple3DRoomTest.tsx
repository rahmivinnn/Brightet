import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Product } from '../types';

interface Simple3DRoomTestProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

function SimpleRoom() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 2, -5]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>

      {/* Simple Chandelier */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 0.8, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Light */}
      <pointLight position={[0, 4, 0]} intensity={1} color="#fff8dc" />
    </group>
  );
}

const Simple3DRoomTest: React.FC<Simple3DRoomTestProps> = ({
  product,
  isOpen,
  onClose
}) => {
  console.log('Simple3DRoomTest render:', { product: product?.name, isOpen });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[90vw] h-[80vh] max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
            <p className="text-gray-600">3D Room Test - ${product.price}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 3D Viewer */}
        <div className="flex-1 relative">
          <Canvas
            camera={{ position: [5, 5, 5], fov: 60 }}
            style={{ background: 'linear-gradient(135deg, #87CEEB 0%, #98D8E8 100%)' }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
            />

            {/* Room */}
            <SimpleRoom />

            {/* Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={15}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default Simple3DRoomTest;
