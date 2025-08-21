import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PresentationControls,
  Stage,
  Text,
  Html,
  useProgress
} from '@react-three/drei';
import { X, RotateCcw, ZoomIn, ZoomOut, Move3D, Lightbulb, Settings } from 'lucide-react';
import * as THREE from 'three';
import { Product } from '../types';
import { RealisticLightingModels, Realistic3DConfig } from '../utils/realistic3DModels';

interface Enhanced3DViewerProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        <div className="text-charcoal-600 font-medium">
          Loading 3D Model... {Math.round(progress)}%
        </div>
      </div>
    </Html>
  );
}



// Enhanced 3D Model Component with realistic materials and lighting
function Enhanced3DModel({ product }: { product: Product }) {
  const meshRef = useRef<THREE.Group>(null);
  const [modelConfig, setModelConfig] = useState<Realistic3DConfig | null>(null);

  useEffect(() => {
    const config = RealisticLightingModels.createRealisticModel(product);
    setModelConfig(config);
  }, [product]);

  useFrame((state) => {
    if (meshRef.current && modelConfig?.animations) {
      modelConfig.animations.forEach(animation => {
        if (animation.type === 'floating') {
          meshRef.current!.position.y = Math.sin(state.clock.elapsedTime * animation.speed) * animation.amplitude;
        } else if (animation.type === 'rotation') {
          meshRef.current!.rotation.y += animation.speed * 0.01;
        } else if (animation.type === 'pulsing') {
          const scale = 1 + Math.sin(state.clock.elapsedTime * animation.speed) * animation.amplitude;
          meshRef.current!.scale.setScalar(scale);
        }
      });
    }
  });

  if (!modelConfig) return null;

  return (
    <group ref={meshRef}>
      <primitive object={modelConfig.geometry} />
    </group>
  );
}

const Enhanced3DViewer: React.FC<Enhanced3DViewerProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const [lightingIntensity, setLightingIntensity] = useState(1);
  const [showWireframe, setShowWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
          <div>
            <h2 className="text-2xl font-bold text-charcoal-900 font-gilda">{product.name}</h2>
            <p className="text-charcoal-600 mt-1">{product.category} • ${product.price.toLocaleString()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-charcoal-600" />
          </button>
        </div>

        {/* 3D Viewer */}
        <div className="flex-1 relative">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}
          >
            <Suspense fallback={<Loader />}>
              {/* Lighting */}
              <ambientLight intensity={0.4 * lightingIntensity} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={0.8 * lightingIntensity}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <pointLight position={[-10, -10, -10]} intensity={0.3 * lightingIntensity} />
              
              {/* Environment */}
              <Environment preset="studio" />
              
              {/* 3D Model with Stage */}
              <Stage contactShadow={{ opacity: 0.2, blur: 1 }} environment="studio">
                <PresentationControls
                  global
                  config={{ mass: 2, tension: 500 }}
                  snap={{ mass: 4, tension: 1500 }}
                  rotation={[0, 0, 0]}
                  polar={[-Math.PI / 3, Math.PI / 3]}
                  azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                >
                  <Enhanced3DModel product={product} />
                </PresentationControls>
              </Stage>
              
              {/* Controls */}
              <OrbitControls
                autoRotate={autoRotate}
                autoRotateSpeed={0.5}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>

          {/* Control Panel */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg space-y-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-accent-600" />
              <span className="text-sm font-medium text-charcoal-700">Lighting</span>
              <input
                type="range"
                min="0.2"
                max="2"
                step="0.1"
                value={lightingIntensity}
                onChange={(e) => setLightingIntensity(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRotate"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoRotate" className="text-sm text-charcoal-700">Auto Rotate</label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-charcoal-600">
              <p><strong>Controls:</strong> Click and drag to rotate • Scroll to zoom • Right-click and drag to pan</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                Add to Cart
              </button>
              <button className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors">
                Add to Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced3DViewer;
