'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, Clock, Users, Target, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PDFDownloadLink } from '@react-pdf/renderer';
import WorksheetPDF from './WorksheetPDF';

const WorksheetPreview: React.FC = () => {
  const router = useRouter();
  const [showAnswers, setShowAnswers] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-6000"></div>
      </div>
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-2xl text-gray-700 hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800">Worksheet Preview</h1>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAnswers(!showAnswers)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform ${
                  showAnswers 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600' 
                    : 'bg-gradient-to-r from-gray-500 to-slate-500 text-white hover:from-gray-600 hover:to-slate-600'
                }`}
              >
                {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showAnswers ? 'Hide Answers' : 'Show Answers'}
              </button>
              <PDFDownloadLink
                key={`worksheet-pdf-${showAnswers}`}
                document={<WorksheetPDF showAnswers={showAnswers} />}
                fileName={`Mathematics_Worksheet_${showAnswers ? 'with_answers' : 'questions_only'}.pdf`}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                {({ loading }) => (
                  <>
                    <Download className="w-4 h-4" />
                    {loading ? 'Preparing PDF...' : 'Download PDF'}
                  </>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="worksheet-content bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.05)'
            }}
          >
            {/* Worksheet Header */}
            <div className="text-center mb-8 pb-6 border-b border-gray-100">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Mathematics Worksheet</h2>
              </div>
              <div className="flex justify-center items-center gap-8 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="font-medium text-blue-700">Class:</span>
                  <span className="text-blue-600">8th Grade</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-xl border border-cyan-100">
                  <span className="font-medium text-cyan-700">Chapter:</span>
                  <span className="text-cyan-600">Algebraic Expressions</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="font-medium text-indigo-700">Time:</span>
                  <span className="text-indigo-600">45 minutes</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl shadow-md">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                Instructions
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-6 rounded-2xl shadow-sm">
                <ul className="text-gray-700 space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span>Answer all questions in the space provided</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0"></div>
                    <span>Show your working for all calculations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                    <span>Use proper mathematical notation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0"></div>
                    <span>Total marks: 50</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl shadow-md">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                Questions
              </h3>
              
              {/* Section A */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 bg-gradient-to-r from-gray-100 to-blue-100 p-4 rounded-2xl border border-gray-200 shadow-sm">
                  Section A: Multiple Choice Questions (10 marks)
                </h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-r from-gray-50 to-green-50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-semibold text-gray-800 text-lg">1. What is the coefficient of x² in the expression 3x² + 5x - 7?</span>
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 px-3 py-2 rounded-xl">
                        <span className="text-sm font-bold text-green-700">(2 marks)</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 ml-4">
                      <label className={`flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-white/50 transition-colors ${
                        showAnswers ? 'bg-green-100 border-2 border-green-500' : ''
                      }`}>
                        <input type="radio" name="q1" className="text-green-600 w-4 h-4" defaultChecked={showAnswers} />
                        <span className="font-medium">a) 3</span>
                        {showAnswers && <span className="text-green-600 font-bold">✓ Correct</span>}
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-white/50 transition-colors">
                        <input type="radio" name="q1" className="text-green-600 w-4 h-4" />
                        <span className="font-medium">b) 5</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-white/50 transition-colors">
                        <input type="radio" name="q1" className="text-green-600 w-4 h-4" />
                        <span className="font-medium">c) -7</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-white/50 transition-colors">
                        <input type="radio" name="q1" className="text-green-600 w-4 h-4" />
                        <span className="font-medium">d) 2</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium text-gray-800 mb-2">2. Simplify: 2x + 3x - x</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <label className={`flex items-center space-x-2 p-2 rounded ${
                        showAnswers ? 'bg-green-100 border-2 border-green-500' : ''
                      }`}>
                        <input type="radio" name="q2" className="text-green-500" defaultChecked={showAnswers} />
                        <span>a) 4x</span>
                        {showAnswers && <span className="text-green-600 font-bold ml-2">✓ Correct</span>}
                      </label>
                      <label className="flex items-center space-x-2 p-2 rounded">
                        <input type="radio" name="q2" className="text-green-500" />
                        <span>b) 5x</span>
                      </label>
                      <label className="flex items-center space-x-2 p-2 rounded">
                        <input type="radio" name="q2" className="text-green-500" />
                        <span>c) 6x</span>
                      </label>
                      <label className="flex items-center space-x-2 p-2 rounded">
                        <input type="radio" name="q2" className="text-green-500" />
                        <span>d) 3x</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section B */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 bg-gray-100 p-3 rounded-lg">
                  Section B: Short Answer Questions (20 marks)
                </h3>
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium text-gray-800 mb-3">3. Add the following algebraic expressions:</p>
                    <p className="text-gray-700 mb-3">(3x² + 2x - 5) + (x² - 4x + 3)</p>
                    <div className="border border-gray-300 rounded p-4 min-h-[80px] bg-gray-50">
                      <p className="text-sm text-gray-500">Show your working:</p>
                      {showAnswers && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm font-semibold text-green-800 mb-2">Answer:</p>
                          <p className="text-green-700">(3x² + 2x - 5) + (x² - 4x + 3) = 4x² - 2x - 2</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium text-gray-800 mb-3">4. Find the value of the expression 2x + 3y when x = 4 and y = 2</p>
                    <div className="border border-gray-300 rounded p-4 min-h-[80px] bg-gray-50">
                      <p className="text-sm text-gray-500">Solution:</p>
                      {showAnswers && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm font-semibold text-green-800 mb-2">Answer:</p>
                          <p className="text-green-700">2x + 3y = 2(4) + 3(2) = 8 + 6 = 14</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section C */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 bg-gray-100 p-3 rounded-lg">
                  Section C: Long Answer Questions (20 marks)
                </h3>
                <div className="space-y-6">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="font-medium text-gray-800 mb-3">5. A rectangle has length (3x + 2) units and breadth (2x - 1) units.</p>
                    <div className="ml-4 space-y-2 text-gray-700">
                      <p>a) Find the expression for the perimeter of the rectangle. (5 marks)</p>
                      <p>b) Find the expression for the area of the rectangle. (5 marks)</p>
                      <p>c) If x = 3, calculate the actual perimeter and area. (5 marks)</p>
                    </div>
                    <div className="border border-gray-300 rounded p-4 min-h-[120px] bg-gray-50 mt-3">
                      <p className="text-sm text-gray-500">Detailed solution:</p>
                      {showAnswers && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm font-semibold text-green-800 mb-2">Answer:</p>
                          <div className="text-green-700 space-y-2">
                            <p>a) Perimeter = 2(length + breadth) = 2[(3x + 2) + (2x - 1)] = 2(5x + 1) = 10x + 2</p>
                            <p>b) Area = length × breadth = (3x + 2)(2x - 1) = 6x² - 3x + 4x - 2 = 6x² + x - 2</p>
                            <p>c) When x = 3: Perimeter = 10(3) + 2 = 32 units, Area = 6(9) + 3 - 2 = 55 square units</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="font-medium text-gray-800 mb-3">6. Factorize the following expressions: (5 marks)</p>
                    <div className="ml-4 space-y-2 text-gray-700">
                      <p>a) 6x² + 9x</p>
                      <p>b) x² - 4</p>
                    </div>
                    <div className="border border-gray-300 rounded p-4 min-h-[100px] bg-gray-50 mt-3">
                      <p className="text-sm text-gray-500">Show step-by-step factorization:</p>
                      {showAnswers && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm font-semibold text-green-800 mb-2">Answer:</p>
                          <div className="text-green-700 space-y-2">
                            <p>a) 6x² + 9x = 3x(2x + 3)</p>
                            <p>b) x² - 4 = (x + 2)(x - 2)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Generated by SenseAI Worksheet Generator</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetPreview;