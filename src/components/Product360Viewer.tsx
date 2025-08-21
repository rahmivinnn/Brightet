import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, Play, Pause, SkipBack, SkipForward, Download } from 'lucide-react';
import { Product } from '../types';

interface Product360ViewerProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const Product360Viewer: React.FC<Product360ViewerProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  
  const totalFrames = 36; // 360° / 10° = 36 frames
  const frameRate = 10; // frames per second for auto-rotation

  // Generate 360° frames from the product image
  useEffect(() => {
    if (!isOpen) return;

    const generateFrames = async () => {
      setIsLoading(true);
      const frameImages: HTMLImageElement[] = [];

      // For demo purposes, we'll create rotated versions of the main image
      // In a real implementation, you'd have pre-rendered 360° images
      for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // Create a promise for each image load
        const imagePromise = new Promise<HTMLImageElement>((resolve) => {
          img.onload = () => resolve(img);
          img.src = product.image; // In real app, this would be product.images360[i]
        });
        
        frameImages.push(await imagePromise);
      }

      setImages(frameImages);
      setIsLoading(false);
    };

    generateFrames();
  }, [isOpen, product]);

  // Auto-rotation effect
  useEffect(() => {
    if (!isPlaying || isLoading) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % totalFrames);
    }, 1000 / frameRate);

    return () => clearInterval(interval);
  }, [isPlaying, isLoading, totalFrames, frameRate]);

  // Draw current frame
  useEffect(() => {
    if (!canvasRef.current || !images[currentFrame] || isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = images[currentFrame];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions to fit image in canvas while maintaining aspect ratio
    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = img.width / img.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgAspect > canvasAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgAspect;
      drawHeight = canvas.height;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }

    // Apply rotation effect based on current frame
    const rotation = (currentFrame / totalFrames) * Math.PI * 2;
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * 0.1); // Subtle rotation effect
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    
    // Draw image
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    
    // Add subtle shadow/depth effect
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + Math.sin(rotation) * 0.05})`;
    ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
    
    ctx.restore();

    // Add frame indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(10, canvas.height - 30, 200, 20);
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(`Frame ${currentFrame + 1} / ${totalFrames}`, 15, canvas.height - 15);
    
    // Add rotation indicator
    const angle = (currentFrame / totalFrames) * 360;
    ctx.fillText(`${Math.round(angle)}°`, 120, canvas.height - 15);
    
  }, [currentFrame, images, isLoading, totalFrames]);

  // Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouseX(e.clientX);
    setIsPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouseX;
    const sensitivity = 2;
    const frameChange = Math.round(deltaX / sensitivity);
    
    if (frameChange !== 0) {
      setCurrentFrame(prev => {
        let newFrame = prev + frameChange;
        if (newFrame < 0) newFrame = totalFrames - 1;
        if (newFrame >= totalFrames) newFrame = 0;
        return newFrame;
      });
      setLastMouseX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const goToFrame = (frame: number) => {
    setCurrentFrame(frame);
    setIsPlaying(false);
  };

  const resetView = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const downloadFrame = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `${product.name}-360-frame-${currentFrame + 1}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
          <div>
            <h2 className="text-2xl font-bold text-charcoal-900 font-gilda">{product.name}</h2>
            <p className="text-charcoal-600 mt-1">360° Interactive View</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-charcoal-600" />
          </button>
        </div>

        {/* Main 360° Viewer */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-charcoal-600 font-medium">Loading 360° View...</p>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ display: isLoading ? 'none' : 'block' }}
          />

          {/* Rotation indicator */}
          {!isLoading && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 relative">
                  <div className="w-full h-full border-2 border-gray-300 rounded-full"></div>
                  <div 
                    className="absolute top-0 left-1/2 w-0.5 h-4 bg-primary-500 origin-bottom transform -translate-x-0.5"
                    style={{ 
                      transform: `translateX(-50%) rotate(${(currentFrame / totalFrames) * 360}deg)`,
                      transformOrigin: 'bottom center'
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-charcoal-700">
                  {Math.round((currentFrame / totalFrames) * 360)}°
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          {/* Playback Controls */}
          <div className="flex justify-center items-center space-x-4 mb-4">
            <button
              onClick={() => goToFrame(Math.max(0, currentFrame - 1))}
              className="p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
              disabled={isLoading}
            >
              <SkipBack className="w-5 h-5 text-charcoal-600" />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="p-3 bg-primary-500 text-white rounded-full shadow hover:shadow-md transition-all hover:bg-primary-600"
              disabled={isLoading}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <button
              onClick={() => goToFrame(Math.min(totalFrames - 1, currentFrame + 1))}
              className="p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
              disabled={isLoading}
            >
              <SkipForward className="w-5 h-5 text-charcoal-600" />
            </button>
            
            <button
              onClick={resetView}
              className="p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
              disabled={isLoading}
            >
              <RotateCcw className="w-5 h-5 text-charcoal-600" />
            </button>
            
            <button
              onClick={downloadFrame}
              className="p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
              disabled={isLoading}
            >
              <Download className="w-5 h-5 text-charcoal-600" />
            </button>
          </div>

          {/* Frame Scrubber */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={totalFrames - 1}
              value={currentFrame}
              onChange={(e) => goToFrame(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-charcoal-500 mt-1">
              <span>0°</span>
              <span>90°</span>
              <span>180°</span>
              <span>270°</span>
              <span>360°</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-charcoal-600">
            <p><strong>Controls:</strong> Click and drag to rotate • Use playback controls • Drag the slider to jump to specific angles</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product360Viewer;
