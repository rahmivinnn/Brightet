import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Smartphone, Download, Share2, RotateCcw } from 'lucide-react';
import { Product } from '../types';

interface ARPreviewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ARPreview: React.FC<ARPreviewProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if device supports AR features
    const checkARSupport = async () => {
      try {
        // Check for WebXR support
        if ('xr' in navigator) {
          const xr = (navigator as any).xr;
          if (xr) {
            const supported = await xr.isSessionSupported('immersive-ar');
            setIsARSupported(supported);
          }
        }
        
        // Fallback: Check for camera access
        if (!isARSupported && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          setIsARSupported(true);
        }
      } catch (err) {
        console.error('AR support check failed:', err);
        setError('AR not supported on this device');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      checkARSupport();
    }
  }, [isOpen, isARSupported]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setError('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        // Add product overlay (simplified AR effect)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(50, 50, 200, 100);
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.fillText(product.name, 60, 80);
        ctx.fillText(`$${product.price.toLocaleString()}`, 60, 100);
        ctx.fillText('AR Preview', 60, 120);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `${product.name}-AR-preview.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  };

  const shareARExperience = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - AR Preview`,
          text: `Check out this ${product.category} in AR!`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    if (isOpen && isARSupported && !error) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, isARSupported, error]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/80 text-white z-10">
        <div>
          <h2 className="text-lg font-bold">{product.name}</h2>
          <p className="text-sm opacity-80">AR Preview</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main AR View */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p>Initializing AR...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
            <div className="text-center p-6">
              <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">AR Not Available</h3>
              <p className="text-sm opacity-80 mb-4">{error}</p>
              <p className="text-xs opacity-60">
                Try using a mobile device with camera access
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Camera Feed */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* AR Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Product Info Overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <h3 className="font-bold text-charcoal-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-charcoal-600 mb-2">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-accent-600">
                      ${product.price.toLocaleString()}
                    </span>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      AR Preview
                    </span>
                  </div>
                </div>
              </div>

              {/* Placement Guide */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                  Point camera at ceiling or wall to place {product.category.toLowerCase()}
                </div>
              </div>

              {/* AR Crosshair */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 border-2 border-white rounded-full opacity-50">
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/80 p-4">
        <div className="flex justify-center space-x-6">
          <button
            onClick={capturePhoto}
            disabled={isLoading || !!error}
            className="flex flex-col items-center space-y-1 text-white hover:text-primary-300 transition-colors disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs">Capture</span>
          </button>

          <button
            onClick={shareARExperience}
            disabled={isLoading || !!error}
            className="flex flex-col items-center space-y-1 text-white hover:text-primary-300 transition-colors disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-xs">Share</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setTimeout(startCamera, 100);
            }}
            disabled={isLoading || !!error}
            className="flex flex-col items-center space-y-1 text-white hover:text-primary-300 transition-colors disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <span className="text-xs">Reset</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-white/80 text-sm">
            Move your device to see how this {product.category.toLowerCase()} would look in your space
          </p>
        </div>
      </div>
    </div>
  );
};

export default ARPreview;
