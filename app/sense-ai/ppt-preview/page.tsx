'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Presentation, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize, Eye, Lightbulb, Target, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PPTPreview: React.FC = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPPTX = async () => {
    setIsDownloading(true);
    try {
      // Create PPTX content with slides data
      const pptxContent = {
        title: "Photosynthesis Presentation",
        slides: slides.map(slide => ({
          title: slide.title,
          subtitle: slide.subtitle || '',
          content: slide.content,
          type: slide.type
        })),
        metadata: {
          subject: "Class 7 Science",
          chapter: "Chapter 1: Life Processes",
          createdBy: "SenseAI PPT Slide Maker",
          createdAt: new Date().toISOString()
        }
      };

      // Convert to blob and download
      const blob = new Blob([JSON.stringify(pptxContent, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Photosynthesis_Presentation.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Note: For actual PPTX generation, you would need a library like PptxGenJS
      // This creates a JSON file with all slide content including emojis and icons
      
    } catch (error) {
      console.error('Error downloading PPTX:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const slides = [
    {
      id: 1,
      title: "Photosynthesis",
      subtitle: "The Process of Making Food in Plants",
      type: "title",
      content: {
        class: "Class 7 Science",
        chapter: "Chapter 1: Life Processes",
        teacher: "Ms. Sarah Johnson"
      }
    },
    {
      id: 2,
      title: "Learning Objectives",
      type: "objectives",
      content: {
        objectives: [
          "Understand what photosynthesis is",
          "Identify the raw materials needed for photosynthesis",
          "Explain the process of photosynthesis",
          "Recognize the importance of photosynthesis in nature"
        ]
      }
    },
    {
      id: 3,
      title: "What is Photosynthesis?",
      type: "definition",
      content: {
        definition: "Photosynthesis is the process by which green plants make their own food using sunlight, water, and carbon dioxide.",
        keyPoints: [
          "Photo = Light",
          "Synthesis = Making",
          "Plants are autotrophs (self-feeding)",
          "Occurs mainly in leaves"
        ]
      }
    },
    {
      id: 4,
      title: "Raw Materials for Photosynthesis",
      type: "materials",
      content: {
        materials: [
          {
            name: "Sunlight",
            icon: "☀️",
            description: "Provides energy for the process",
            source: "Sun"
          },
          {
            name: "Water",
            icon: "💧",
            description: "Absorbed by roots from soil",
            source: "Soil"
          },
          {
            name: "Carbon Dioxide",
            icon: "🌬️",
            description: "Taken in through stomata",
            source: "Air"
          }
        ]
      }
    },
    {
      id: 5,
      title: "The Photosynthesis Equation",
      type: "equation",
      content: {
        equation: "6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂",
        breakdown: {
          reactants: "Carbon Dioxide + Water + Light Energy",
          products: "Glucose + Oxygen",
          location: "Chloroplasts in leaves"
        }
      }
    },
    {
      id: 6,
      title: "Importance of Photosynthesis",
      type: "importance",
      content: {
        points: [
          {
            title: "Food Production",
            description: "Plants make glucose for energy and growth",
            icon: "🌱"
          },
          {
            title: "Oxygen Release",
            description: "Produces oxygen that we breathe",
            icon: "🫁"
          },
          {
            title: "Carbon Dioxide Removal",
            description: "Removes CO₂ from the atmosphere",
            icon: "🌍"
          },
          {
            title: "Food Chain Base",
            description: "Foundation of all food chains",
            icon: "🔗"
          }
        ]
      }
    },
    {
      id: 7,
      title: "Summary & Review",
      type: "summary",
      content: {
        keyTakeaways: [
          "Photosynthesis is how plants make food",
          "Requires sunlight, water, and carbon dioxide",
          "Produces glucose and oxygen",
          "Essential for life on Earth"
        ],
        nextClass: "Factors affecting photosynthesis"
      }
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const renderSlideContent = (slide: any) => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-blue-800 mb-4">{slide.title}</h1>
              <p className="text-2xl text-gray-600">{slide.subtitle}</p>
            </div>
            <div className="space-y-2 text-lg text-gray-500">
              <p>{slide.content.class}</p>
              <p>{slide.content.chapter}</p>
              <p className="font-medium">{slide.content.teacher}</p>
            </div>
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-6xl">🌱</span>
              </div>
            </div>
          </div>
        );

      case 'objectives':
        return (
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-blue-800 text-center mb-8">{slide.title}</h1>
            <div className="grid grid-cols-1 gap-6">
              {slide.content.objectives.map((objective: string, index: number) => (
                <div key={index} className="flex items-center space-x-4 bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {index + 1}
                  </div>
                  <p className="text-xl text-gray-800">{objective}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'definition':
        return (
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-blue-800 text-center mb-8">{slide.title}</h1>
            <div className="bg-green-50 rounded-2xl p-8 border border-green-200 mb-8">
              <p className="text-2xl text-gray-800 leading-relaxed text-center">{slide.content.definition}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {slide.content.keyPoints.map((point: string, index: number) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <p className="text-lg text-gray-800">{point}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'materials':
        return (
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-blue-800 text-center mb-8">{slide.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {slide.content.materials.map((material: any, index: number) => (
                <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg text-center">
                  <div className="text-6xl mb-4">{material.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{material.name}</h3>
                  <p className="text-gray-600 mb-4">{material.description}</p>
                  <div className="bg-blue-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">Source: {material.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'equation':
        return (
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-blue-800 text-center mb-8">{slide.title}</h1>
            <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-200 text-center">
              <p className="text-3xl font-mono font-bold text-gray-800 mb-6">{slide.content.equation}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white rounded-xl p-6 border border-yellow-300">
                  <h4 className="font-bold text-yellow-800 mb-2">Reactants</h4>
                  <p className="text-gray-700">{slide.content.breakdown.reactants}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-yellow-300">
                  <h4 className="font-bold text-yellow-800 mb-2">Products</h4>
                  <p className="text-gray-700">{slide.content.breakdown.products}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-yellow-300">
                  <h4 className="font-bold text-yellow-800 mb-2">Location</h4>
                  <p className="text-gray-700">{slide.content.breakdown.location}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'importance':
        return (
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-blue-800 text-center mb-8">{slide.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {slide.content.points.map((point: any, index: number) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{point.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{point.title}</h3>
                      <p className="text-gray-600">{point.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-blue-800 text-center mb-8">{slide.title}</h1>
            <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
              <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">Key Takeaways</h3>
              <div className="space-y-4">
                {slide.content.keyTakeaways.map((takeaway: string, index: number) => (
                  <div key={index} className="flex items-center space-x-4 bg-white rounded-xl p-4 border border-green-300">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <p className="text-lg text-gray-800">{takeaway}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-center">
              <h4 className="font-bold text-blue-800 mb-2">Next Class:</h4>
              <p className="text-lg text-gray-700">{slide.content.nextClass}</p>
            </div>
          </div>
        );

      default:
        return <div>Slide content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.8) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.6) 0%, transparent 50%)'
          }}
        />
      </div>
      {/* Header */}
      <div className="relative z-10 p-6">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">PPT Slide Preview</h1>
              <p className="text-white/80 mt-1">Photosynthesis Presentation - 7 Slides</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={downloadPPTX}
              disabled={isDownloading}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isDownloading ? 'Preparing...' : 'Download PPTX'}</span>
            </button>
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-600">
              <Presentation className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Presentation Area */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Slide Display */}
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-green-50 p-12 relative">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col justify-center"
              >
                {renderSlideContent(slides[currentSlide])}
              </motion.div>
              
              {/* Slide Number */}
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium text-gray-600">
                {currentSlide + 1} / {slides.length}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-50 p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                {/* Navigation Controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Slide Thumbnails */}
                <div className="flex items-center space-x-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                {/* Additional Controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentSlide(0)}
                    className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300"
                    title="Reset to first slide"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300">
                    <Maximize className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Presentation Info */}
            <div className="bg-white p-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <Presentation className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-blue-800">Presentation Details</h4>
                      <p className="text-sm text-blue-600">7 slides • Science topic</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Target className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-bold text-green-800">Learning Focus</h4>
                      <p className="text-sm text-green-600">Interactive & Visual</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-6 h-6 text-purple-600" />
                    <div>
                      <h4 className="font-bold text-purple-800">Duration</h4>
                      <p className="text-sm text-purple-600">~20 minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 text-center">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Generated by SenseAI PPT Slide Maker</span>
                <span>Current Slide: {slides[currentSlide].title}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PPTPreview;