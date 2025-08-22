'use client';

import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  SparklesIcon, 
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  CameraIcon,
  DocumentIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import Link from 'next/link';

export default function PaperToPixelPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedText, setProcessedText] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      setUploadedFile(file);
      processImage(file);
    } else {
      alert('Please upload an image file (JPEG, PNG, etc.)');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    
    // Simulate OCR processing
    setTimeout(() => {
      const sampleTexts = [
        "Newton's Laws of Motion:\n\n1. First Law (Inertia): An object at rest stays at rest unless acted upon by an external force.\n\n2. Second Law (F = ma): Force equals mass times acceleration.\n\n3. Third Law (Action-Reaction): For every action, there is an equal and opposite reaction.",
        
        "Photosynthesis Equation:\n\n6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂\n\nThis process converts carbon dioxide and water into glucose and oxygen using light energy.",
        
        "Quadratic Formula:\n\nx = (-b ± √(b² - 4ac)) / 2a\n\nThis formula solves any quadratic equation in the form ax² + bx + c = 0."
      ];
      
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      setProcessedText(randomText);
      setIsProcessing(false);
    }, 3000);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-radial from-pink-500/30 via-pink-600/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/6 w-80 h-80 bg-gradient-radial from-rose-500/25 via-pink-500/8 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/sense-ai" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Paper to Pixel</h1>
                  <p className="text-sm text-gray-400">Digitize your handwritten notes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Transform Handwritten Notes
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Upload images of your handwritten notes and get them converted to digital text with AI-powered OCR technology.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Area */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Upload Your Notes</h3>
                
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-pink-400 bg-pink-500/10' 
                      : 'border-white/20 hover:border-pink-400/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto" />
                      <div>
                        <p className="text-white font-medium">{uploadedFile.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {isProcessing && (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin"></div>
                          <span className="text-pink-300">Processing...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ArrowUpTrayIcon className="w-16 h-16 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-white font-medium mb-2">
                          Drag and drop your image here
                        </p>
                        <p className="text-gray-400 text-sm mb-4">
                          or click to browse files
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInput}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300"
                        >
                          <CameraIcon className="w-5 h-5 mr-2" />
                          Choose Image
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-sm text-gray-400">
                  <p>Supported formats: JPEG, PNG, GIF</p>
                  <p>Maximum file size: 10MB</p>
                </div>
              </motion.div>

              {/* Results Area */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Digital Text</h3>
                
                {processedText ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <SparklesIcon className="w-5 h-5 text-pink-400" />
                      <span className="text-sm font-medium text-pink-300">AI Processed</span>
                    </div>
                    <div className="bg-black/40 rounded-lg p-4 border border-white/20">
                      <pre className="text-gray-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                        {processedText}
                      </pre>
                    </div>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg transition-colors">
                        Copy Text
                      </button>
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DocumentIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Upload an image to see the digitized text here
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
                  <CameraIcon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">OCR Technology</h4>
                <p className="text-gray-400 text-sm">
                  Advanced optical character recognition to accurately convert handwritten text to digital format.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">AI Enhancement</h4>
                <p className="text-gray-400 text-sm">
                  AI-powered text correction and formatting to improve readability and accuracy.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
                  <DocumentIcon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Export Options</h4>
                <p className="text-gray-400 text-sm">
                  Export your digitized notes in various formats including text, PDF, and more.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 