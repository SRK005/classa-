'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, BookOpen, Clock, Target, CheckCircle, AlertCircle, Star, Calculator, PenTool, FileText, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HomeworkPDF from './HomeworkPDF';

const HomeworkPreview: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.8) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.6) 0%, transparent 50%)'
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
              <h1 className="text-3xl font-bold text-white">Homework Assignment Preview</h1>
              <p className="text-white/80 mt-1">Mathematics - Quadratic Equations</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <PDFDownloadLink
                key="homework-pdf"
                document={<HomeworkPDF />}
                fileName="Mathematics_Homework_Assignment.pdf"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              {({ loading }) => (
                <>
                  <Download className="w-4 h-4" />
                  <span>{loading ? 'Preparing PDF...' : 'Download PDF'}</span>
                </>
              )}
            </PDFDownloadLink>
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            {/* Assignment Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Calculator className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quadratic Equations</h2>
                    <p className="text-gray-600">Class 10 Mathematics | Chapter 4</p>
                    <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>Due Date: March 25, 2024</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">Total: 50 Marks</div>
                  <p className="text-sm text-gray-600">Expected Time: 2 hours</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-600">Mixed difficulty level</span>
                  </div>
                </div>
              </div>
              
              {/* Assignment Instructions */}
              <div className="bg-white rounded-lg p-4 border border-blue-300">
                <h3 className="font-bold text-blue-700 mb-3 flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Instructions</span>
                </h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Answer all questions in your mathematics notebook</li>
                  <li>• Show all working steps clearly</li>
                  <li>• Use proper mathematical notation</li>
                  <li>• Submit by March 25, 2024, before 9:00 AM</li>
                  <li>• Marks will be deducted for incomplete solutions</li>
                </ul>
              </div>
            </div>

            {/* Section A - Multiple Choice Questions */}
            <div className="mb-8">
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6" />
                  <span>Section A: Multiple Choice Questions (10 Marks)</span>
                </h3>
                <p className="text-sm text-gray-600 mb-6">Choose the correct answer for each question. Each question carries 2 marks.</p>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <h4 className="font-bold text-gray-800 mb-3">Question 1:</h4>
                    <p className="text-gray-700 mb-4">What is the discriminant of the quadratic equation 2x² + 5x + 3 = 0?</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q1" id="q1a" className="text-green-500" />
                        <label htmlFor="q1a" className="text-gray-700">a) 1</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q1" id="q1b" className="text-green-500" />
                        <label htmlFor="q1b" className="text-gray-700">b) 25</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q1" id="q1c" className="text-green-500" />
                        <label htmlFor="q1c" className="text-gray-700">c) -1</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q1" id="q1d" className="text-green-500" />
                        <label htmlFor="q1d" className="text-gray-700">d) 49</label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <h4 className="font-bold text-gray-800 mb-3">Question 2:</h4>
                    <p className="text-gray-700 mb-4">The roots of the equation x² - 7x + 12 = 0 are:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q2" id="q2a" className="text-green-500" />
                        <label htmlFor="q2a" className="text-gray-700">a) 3, 4</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q2" id="q2b" className="text-green-500" />
                        <label htmlFor="q2b" className="text-gray-700">b) 2, 6</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q2" id="q2c" className="text-green-500" />
                        <label htmlFor="q2c" className="text-gray-700">c) 1, 12</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q2" id="q2d" className="text-green-500" />
                        <label htmlFor="q2d" className="text-gray-700">d) -3, -4</label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <h4 className="font-bold text-gray-800 mb-3">Question 3:</h4>
                    <p className="text-gray-700 mb-4">If one root of the equation x² + kx + 8 = 0 is 2, then the value of k is:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q3" id="q3a" className="text-green-500" />
                        <label htmlFor="q3a" className="text-gray-700">a) -6</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q3" id="q3b" className="text-green-500" />
                        <label htmlFor="q3b" className="text-gray-700">b) 6</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q3" id="q3c" className="text-green-500" />
                        <label htmlFor="q3c" className="text-gray-700">c) -4</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="q3" id="q3d" className="text-green-500" />
                        <label htmlFor="q3d" className="text-gray-700">d) 4</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section B - Short Answer Questions */}
            <div className="mb-8">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center space-x-2">
                  <PenTool className="w-6 h-6" />
                  <span>Section B: Short Answer Questions (20 Marks)</span>
                </h3>
                <p className="text-sm text-gray-600 mb-6">Solve the following questions. Each question carries 4 marks.</p>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 border border-blue-300">
                    <h4 className="font-bold text-gray-800 mb-3">Question 4: (4 marks)</h4>
                    <p className="text-gray-700 mb-4">Solve the quadratic equation: x² - 5x + 6 = 0 using the factorization method.</p>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm">Write your solution here...</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-300">
                    <h4 className="font-bold text-gray-800 mb-3">Question 5: (4 marks)</h4>
                    <p className="text-gray-700 mb-4">Find the discriminant of 3x² + 2x - 1 = 0 and determine the nature of its roots.</p>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm">Write your solution here...</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-300">
                    <h4 className="font-bold text-gray-800 mb-3">Question 6: (4 marks)</h4>
                    <p className="text-gray-700 mb-4">If α and β are the roots of x² - 6x + 8 = 0, find the value of α + β and αβ.</p>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm">Write your solution here...</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-300">
                    <h4 className="font-bold text-gray-800 mb-3">Question 7: (4 marks)</h4>
                    <p className="text-gray-700 mb-4">Solve: 2x² + 7x + 3 = 0 using the quadratic formula.</p>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm">Write your solution here...</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-300">
                    <h4 className="font-bold text-gray-800 mb-3">Question 8: (4 marks)</h4>
                    <p className="text-gray-700 mb-4">Find the value of k for which the equation kx² + 4x + 1 = 0 has equal roots.</p>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm">Write your solution here...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section C - Long Answer Questions */}
            <div className="mb-8">
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center space-x-2">
                  <FileText className="w-6 h-6" />
                  <span>Section C: Long Answer Questions (20 Marks)</span>
                </h3>
                <p className="text-sm text-gray-600 mb-6">Solve the following questions with detailed explanations. Each question carries 10 marks.</p>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 border border-purple-300">
                    <h4 className="font-bold text-gray-800 mb-3">Question 9: (10 marks)</h4>
                    <p className="text-gray-700 mb-4">
                      A rectangular field has a length that is 3 meters more than twice its width. If the area of the field is 54 square meters, find the dimensions of the field.
                    </p>
                    <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200">
                      <p className="text-sm text-yellow-800 font-medium">Hint: Let width = x meters, then length = (2x + 3) meters</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[150px] border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm">Write your detailed solution here...</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-purple-300">
                    <h4 className="font-bold text-gray-800 mb-3">Question 10: (10 marks)</h4>
                    <p className="text-gray-700 mb-4">
                      The sum of the squares of two consecutive positive integers is 365. Find the integers.
                    </p>
                    <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200">
                      <p className="text-sm text-yellow-800 font-medium">Hint: Let the consecutive integers be n and (n+1)</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[150px] border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm">Write your detailed solution here...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Summary */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Assignment Summary</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-300 text-center">
                  <div className="text-2xl font-bold text-green-600">10</div>
                  <p className="text-sm text-gray-600">Total Questions</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-300 text-center">
                  <div className="text-2xl font-bold text-blue-600">50</div>
                  <p className="text-sm text-gray-600">Total Marks</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-300 text-center">
                  <div className="text-2xl font-bold text-purple-600">2 hrs</div>
                  <p className="text-sm text-gray-600">Expected Time</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-800 mb-2">Important Reminders:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Review the quadratic formula: x = [-b ± √(b² - 4ac)] / 2a</li>
                      <li>• Remember to check your answers by substitution</li>
                      <li>• For word problems, define your variables clearly</li>
                      <li>• Show all steps for full marks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Generated by SenseAI Homework Creator</span>
                <span>Assignment ID: HW-MATH-QE-001 | Created: March 18, 2024</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomeworkPreview;