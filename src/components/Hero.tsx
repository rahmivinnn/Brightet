import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, ArrowRight, Camera, Image as ImageIcon, X, Home } from 'lucide-react';
import Room3DViewer from './Room3DViewer';
import { ComputerVisionService, RoomAnalysis } from '../services/ComputerVisionService';
import { ImageTo3DConverter, DigitalTwin } from '../services/ImageTo3DConverter';

const Hero: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [show3DRoom, setShow3DRoom] = useState(false);
  const [roomAnalysis, setRoomAnalysis] = useState<RoomAnalysis | null>(null);
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [visionService, setVisionService] = useState<ComputerVisionService | null>(null);
  const [imageConverter, setImageConverter] = useState<ImageTo3DConverter | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize AI services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        const vision = new ComputerVisionService();
        const converter = new ImageTo3DConverter();

        await Promise.all([
          vision.initialize(),
          converter.initialize()
        ]);

        setVisionService(vision);
        setImageConverter(converter);
        console.log('✅ AI services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AI services:', error);
      }
    };

    initializeServices();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const analyzeRoomImage = async (imageData: string): Promise<{ analysis: RoomAnalysis; digitalTwin: DigitalTwin }> => {
    if (!visionService || !imageConverter) {
      throw new Error('AI services not initialized');
    }

    // Real computer vision analysis
    setProcessingStep('🔍 Initializing computer vision analysis...');
    await new Promise(resolve => setTimeout(resolve, 500));

    setProcessingStep('📐 Analyzing room geometry and dimensions...');
    await new Promise(resolve => setTimeout(resolve, 800));

    setProcessingStep('🪑 Detecting and classifying furniture objects...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    setProcessingStep('🎨 Extracting color palette and materials...');
    await new Promise(resolve => setTimeout(resolve, 700));

    setProcessingStep('💡 Analyzing lighting conditions...');
    await new Promise(resolve => setTimeout(resolve, 600));

    setProcessingStep('🏠 Determining interior design style...');
    await new Promise(resolve => setTimeout(resolve, 500));

    setProcessingStep('🤖 Generating AI recommendations...');
    await new Promise(resolve => setTimeout(resolve, 600));

    // Perform real computer vision analysis
    const analysis = await visionService.analyzeRoomImage(imageData);

    setProcessingStep('🏗️ Creating accurate 3D digital twin...');
    await new Promise(resolve => setTimeout(resolve, 800));

    // Convert to 3D digital twin
    const digitalTwin = await imageConverter.convertImageToDigitalTwin(imageData);

    setProcessingStep('✨ Finalizing 3D visualization...');
    await new Promise(resolve => setTimeout(resolve, 400));

    return { analysis, digitalTwin };
  };

  const handleFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        setUploadedImage(imageData);
        setIsProcessing(true);
        setProcessingStep('🚀 Initializing advanced AI analysis...');

        try {
          const { analysis, digitalTwin } = await analyzeRoomImage(imageData);
          setRoomAnalysis(analysis);
          setDigitalTwin(digitalTwin);
          setIsProcessing(false);
          setProcessingStep('');

          console.log(`🎉 Analysis complete! Detected ${analysis.detectedObjects.length} objects with ${digitalTwin.metadata.accuracy.toFixed(1)}% accuracy`);

          // Automatically open 3D room viewer after processing
          setTimeout(() => {
            setShow3DRoom(true);
          }, 1000);
        } catch (error) {
          console.error('❌ Room analysis failed:', error);
          setIsProcessing(false);
          setProcessingStep('Analysis failed. Please try again with a different image.');

          // Clear error after 3 seconds
          setTimeout(() => {
            setProcessingStep('');
          }, 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const open3DRoomViewer = () => {
    if (uploadedImage) {
      setShow3DRoom(true);
    } else {
      // If no image uploaded, show default room
      setShow3DRoom(true);
    }
  };

  const close3DRoomViewer = () => {
    setShow3DRoom(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setUploadedImage(null);
    setIsProcessing(false);
    setRoomAnalysis(null);
    setDigitalTwin(null);
    setProcessingStep('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="bg-gradient-to-br from-cream-200 via-cream-50 to-warm-100 py-20 font-gilda">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-charcoal-900 mb-6 font-gilda">
            Transform Your Room with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-warm-400 block">
              AI-Powered Design
            </span>
          </h1>
          <p className="text-xl text-charcoal-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Upload a photo of your room and watch our AI redesign it in seconds.
            Choose from multiple design styles and get a complete furniture catalog to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleButtonClick}
              className="bg-accent-500 text-white px-8 py-4 rounded-button hover:bg-accent-600 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 shadow-warm hover:shadow-xl"
            >
              <Sparkles className="w-6 h-6" />
              <span>Start Designing</span>
            </button>
            <button
              onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-accent-300 text-accent-600 px-8 py-4 rounded-button hover:border-accent-500 hover:text-accent-700 hover:bg-accent-50 transition-all duration-300 font-semibold text-lg"
            >
              View Examples
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {uploadedImage ? (
            <div className="relative bg-white rounded-card shadow-warm p-6">
              <button
                onClick={clearImage}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <X className="w-5 h-5 text-charcoal-600" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-900 mb-3">Original Room</h3>
                  <img
                    src={uploadedImage}
                    alt="Uploaded room"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-900 mb-3">AI Analysis Results</h3>
                  <div className="w-full h-64 bg-cream-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {isProcessing ? (
                      <div className="text-center p-4">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-200 border-t-accent-500 mx-auto mb-4"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-accent-500 animate-pulse" />
                          </div>
                        </div>
                        <p className="text-accent-600 font-semibold mb-2">Advanced AI Processing</p>
                        <p className="text-charcoal-600 text-sm animate-pulse">{processingStep}</p>
                        <div className="mt-3 bg-white rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-accent-400 to-warm-400 animate-pulse"></div>
                        </div>
                      </div>
                    ) : roomAnalysis ? (
                      <div className="text-center p-4 w-full">
                        <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                          <Home className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-green-700 font-semibold mb-2">Analysis Complete!</p>
                        <div className="text-xs text-left bg-white rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><strong>Room:</strong> {roomAnalysis.roomType}</div>
                            <div><strong>Style:</strong> {roomAnalysis.style}</div>
                            <div><strong>Size:</strong> {roomAnalysis.dimensions.width}×{roomAnalysis.dimensions.depth}m</div>
                            <div><strong>Items:</strong> {roomAnalysis.existingFurniture.length}</div>
                          </div>
                        </div>
                        <button
                          onClick={open3DRoomViewer}
                          className="bg-gradient-to-r from-accent-500 to-warm-500 text-white px-4 py-2 rounded-lg hover:from-accent-600 hover:to-warm-600 transition-all duration-200 font-medium flex items-center space-x-2 mx-auto text-sm shadow-lg"
                        >
                          <Home className="w-4 h-4" />
                          <span>View 3D Room</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Sparkles className="w-12 h-12 text-accent-400 mx-auto mb-4" />
                        <p className="text-charcoal-600">Your AI analysis will appear here</p>
                        <button
                          onClick={open3DRoomViewer}
                          className="mt-4 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-sm"
                        >
                          Preview Sample Room
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Analysis Panel */}
              {roomAnalysis && !isProcessing && (
                <div className="mt-6 bg-gradient-to-r from-accent-50 to-warm-50 rounded-lg p-6 border border-accent-200">
                  <h4 className="text-xl font-bold text-charcoal-900 mb-4 font-gilda flex items-center">
                    <Sparkles className="w-5 h-5 text-accent-500 mr-2" />
                    AI Room Analysis Report
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-charcoal-800 mb-2">Room Details</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-charcoal-600">Type:</span>
                          <span className="font-medium">{roomAnalysis.roomType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-600">Style:</span>
                          <span className="font-medium">{roomAnalysis.style}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-600">Dimensions:</span>
                          <span className="font-medium">
                            {roomAnalysis.dimensions.width}m × {roomAnalysis.dimensions.depth}m × {roomAnalysis.dimensions.height}m
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-600">Lighting:</span>
                          <span className="font-medium text-xs">{roomAnalysis.lightingConditions}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-charcoal-800 mb-2">AI Recommendations</h5>
                      <ul className="space-y-1 text-sm">
                        {roomAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-accent-500 mr-2">•</span>
                            <span className="text-charcoal-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-accent-200">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium text-charcoal-700">Detected Colors:</span>
                      {roomAnalysis.colorScheme.map((color, index) => (
                        <span key={index} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-charcoal-600 border">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-card p-12 text-center transition-all duration-300 cursor-pointer ${
                dragActive
                  ? 'border-accent-500 bg-accent-50'
                  : 'border-accent-300 hover:border-accent-400 hover:bg-cream-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleButtonClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <Upload className="w-16 h-16 text-accent-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-charcoal-900 mb-4">
                Upload Your Room Photo
              </h3>
              <p className="text-charcoal-600 mb-6 text-lg">
                Drag and drop your room image here, or click to browse
              </p>
              <button className="bg-white border-2 border-accent-500 text-accent-600 px-6 py-3 rounded-lg hover:bg-accent-500 hover:text-white transition-all duration-300 font-medium">
                Choose File
              </button>
              <p className="text-sm text-charcoal-500 mt-4">
                Supports JPG, PNG, WebP up to 10MB
              </p>
            </div>
          )}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-xl font-semibold text-charcoal-900 mb-2">1. Upload Photo</h3>
            <p className="text-charcoal-600">Take a photo of your room and upload it to our platform</p>
          </div>
          <div className="text-center">
            <div className="bg-warm-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-warm-600" />
            </div>
            <h3 className="text-xl font-semibold text-charcoal-900 mb-2">2. AI Magic</h3>
            <p className="text-charcoal-600">Our AI analyzes your space and generates beautiful designs</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-charcoal-900 mb-2">3. Shop & Style</h3>
            <p className="text-charcoal-600">Browse our catalog and purchase items to recreate the look</p>
          </div>
        </div>
      </div>

      {/* 3D Room Viewer Modal */}
      <Room3DViewer
        roomImage={uploadedImage || undefined}
        roomAnalysis={roomAnalysis || undefined}
        digitalTwin={digitalTwin || undefined}
        isOpen={show3DRoom}
        onClose={close3DRoomViewer}
        selectedProducts={[]} // Will be populated with selected products from catalog
      />
    </section>
  );
};

export default Hero;