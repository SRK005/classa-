'use client';

import { motion } from 'framer-motion';
import { 
  CursorArrowRaysIcon, 
  SparklesIcon, 
  ArrowLeftIcon,
  LightBulbIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import Link from 'next/link';

export default function ClickToClarifyPage() {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleContent = [
    {
      id: 'newton-laws',
      title: "Newton's Laws of Motion",
      content: "Newton's three laws of motion are fundamental principles that describe the relationship between forces acting on a body and the motion of that body.",
      elements: [
        { id: 'force', text: 'forces', type: 'concept' },
        { id: 'motion', text: 'motion', type: 'concept' },
        { id: 'body', text: 'body', type: 'concept' }
      ]
    },
    {
      id: 'photosynthesis',
      title: "Photosynthesis Process",
      content: "Photosynthesis is the process by which plants convert light energy into chemical energy to fuel their growth and development.",
      elements: [
        { id: 'light-energy', text: 'light energy', type: 'concept' },
        { id: 'chemical-energy', text: 'chemical energy', type: 'concept' },
        { id: 'plants', text: 'plants', type: 'subject' }
      ]
    },
    {
      id: 'quadratic',
      title: "Quadratic Equations",
      content: "A quadratic equation is a second-degree polynomial equation in a single variable x, with a ≠ 0, which can be written as ax² + bx + c = 0.",
      elements: [
        { id: 'polynomial', text: 'polynomial', type: 'concept' },
        { id: 'variable', text: 'variable', type: 'concept' },
        { id: 'ax2', text: 'ax²', type: 'formula' }
      ]
    }
  ];

  const handleElementClick = async (elementId: string, elementText: string) => {
    setSelectedElement(elementId);
    setIsLoading(true);
    
    // Simulate AI explanation
    setTimeout(() => {
      const explanations: { [key: string]: string } = {
        'force': 'A force is any interaction that, when unopposed, will change the motion of an object. Forces can be categorized as contact forces (like friction) or non-contact forces (like gravity).',
        'motion': 'Motion refers to the change in position of an object over time. It can be described in terms of displacement, velocity, and acceleration.',
        'body': 'In physics, a body refers to any object with mass that can be acted upon by forces. It can be a particle, rigid body, or deformable body.',
        'light-energy': 'Light energy is electromagnetic radiation that can be seen by the human eye. It travels in waves and is essential for photosynthesis.',
        'chemical-energy': 'Chemical energy is the potential energy stored in the bonds between atoms and molecules. It can be released during chemical reactions.',
        'plants': 'Plants are multicellular organisms that use photosynthesis to convert light energy into chemical energy for growth and development.',
        'polynomial': 'A polynomial is a mathematical expression consisting of variables and coefficients, involving only addition, subtraction, multiplication, and non-negative integer exponents.',
        'variable': 'A variable is a symbol that represents a quantity that can change or vary. In mathematics, variables are often represented by letters like x, y, or z.',
        'ax2': 'ax² represents a quadratic term where a is the coefficient and x is the variable raised to the power of 2. This is the highest degree term in a quadratic equation.'
      };
      
      setExplanation(explanations[elementId] || `This is an explanation of "${elementText}". Click to Clarify helps you understand complex concepts by providing instant explanations.`);
      setIsLoading(false);
    }, 1000);
  };

  const clearSelection = () => {
    setSelectedElement(null);
    setExplanation('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-radial from-blue-500/30 via-blue-600/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/6 w-80 h-80 bg-gradient-radial from-cyan-500/25 via-blue-500/8 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        
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
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <CursorArrowRaysIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Click to Clarify</h1>
                  <p className="text-sm text-gray-400">Point and click for instant explanations</p>
                </div>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="flex items-center space-x-2 text-sm text-blue-300">
              <InformationCircleIcon className="w-4 h-4" />
              <span>Click on highlighted terms for explanations</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  Interactive Learning
                </h2>
                <p className="text-gray-300 text-lg">
                  Click on any highlighted term to get instant explanations powered by AI.
                </p>
              </motion.div>

              {/* Sample Content */}
              <div className="space-y-8">
                {sampleContent.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">{section.title}</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {section.content.split(' ').map((word, wordIndex) => {
                        const element = section.elements.find(el => 
                          section.content.toLowerCase().includes(el.text.toLowerCase()) &&
                          section.content.toLowerCase().indexOf(el.text.toLowerCase()) === 
                          section.content.toLowerCase().indexOf(word.toLowerCase())
                        );
                        
                        if (element) {
                          return (
                            <span
                              key={wordIndex}
                              className="inline-block px-1 py-0.5 bg-blue-500/20 hover:bg-blue-500/30 rounded cursor-pointer transition-colors border border-blue-500/30 hover:border-blue-400/50"
                              onClick={() => handleElementClick(element.id, element.text)}
                              title={`Click to learn about ${element.text}`}
                            >
                              {word}
                            </span>
                          );
                        }
                        return <span key={wordIndex}>{word} </span>;
                      })}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Explanation Panel */}
          <div className="w-96 border-l border-white/10 bg-black/20 backdrop-blur-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Explanation</h3>
                {selectedElement && (
                  <button
                    onClick={clearSelection}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              
              {selectedElement ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 rounded-lg p-4 border border-white/20"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                      <span className="text-blue-300">Analyzing...</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <SparklesIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">AI Explanation</span>
                      </div>
                      <p className="text-gray-200 leading-relaxed">{explanation}</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <LightBulbIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Click on any highlighted term to get an instant explanation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 