'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, BarChart3, TrendingUp, TrendingDown, Target, Award, AlertTriangle, CheckCircle, User, Calendar, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PerformancePDF from './PerformancePDF';

const PerformancePreview: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{
      background: `
        #ffffff,
        radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.04) 0%, transparent 50%)
      `
    }}>
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
              <h1 className="text-3xl font-bold text-white">Performance Analysis</h1>
              <p className="text-white/80 mt-1">Individual Student Report - Rahul Sharma</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <PDFDownloadLink
              key="performance-pdf"
              document={<PerformancePDF studentName="Rahul Sharma" />}
              fileName="Academic_Performance_Report.pdf"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              {({ loading }) => (
                <>
                  <Download className="w-4 h-4" />
                  <span>{loading ? 'Preparing PDF...' : 'Download Report'}</span>
                </>
              )}
            </PDFDownloadLink>
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-600">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            {/* Student Info Header */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-8 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Rahul Sharma</h2>
                    <p className="text-gray-600">Student ID: STU2024001 | Class 10-A</p>
                    <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>Analysis Period: January - March 2024</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">78.5%</div>
                  <p className="text-sm text-gray-600">Overall Performance</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+5.2% from last term</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-green-700">85%</h3>
                <p className="text-sm text-gray-600">MCQ Performance</p>
                <p className="text-xs text-green-600 mt-1">Strong analytical skills</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-blue-700">72%</h3>
                <p className="text-sm text-gray-600">Assignment Scores</p>
                <p className="text-xs text-blue-600 mt-1">Consistent improvement</p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <TrendingDown className="w-5 h-5 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold text-yellow-700">68%</h3>
                <p className="text-sm text-gray-600">Test Performance</p>
                <p className="text-xs text-yellow-600 mt-1">Needs attention</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-purple-700">92%</h3>
                <p className="text-sm text-gray-600">Participation</p>
                <p className="text-xs text-purple-600 mt-1">Excellent engagement</p>
              </div>
            </div>

            {/* Subject-wise Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Performance Chart */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Subject-wise Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Mathematics</span>
                      <span className="text-sm font-bold text-green-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Science</span>
                      <span className="text-sm font-bold text-blue-600">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" style={{width: '78%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">English</span>
                      <span className="text-sm font-bold text-purple-600">82%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full" style={{width: '82%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Social Studies</span>
                      <span className="text-sm font-bold text-yellow-600">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full" style={{width: '65%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Hindi</span>
                      <span className="text-sm font-bold text-indigo-600">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-3 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="space-y-6">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Key Strengths</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Excellent problem-solving skills in Mathematics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Strong analytical thinking in MCQ assessments</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Consistent participation in class activities</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Good understanding of English grammar concepts</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Areas for Improvement</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Social Studies historical timeline understanding</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Science practical application questions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Time management during test situations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Hindi creative writing and expression</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recent Assessment Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Assessment Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Assessment</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Algebra Test</td>
                      <td className="py-3 px-4">Mathematics</td>
                      <td className="py-3 px-4">MCQ</td>
                      <td className="py-3 px-4 font-bold text-green-600">88%</td>
                      <td className="py-3 px-4">Mar 15, 2024</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Excellent</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Physics Assignment</td>
                      <td className="py-3 px-4">Science</td>
                      <td className="py-3 px-4">Assignment</td>
                      <td className="py-3 px-4 font-bold text-blue-600">75%</td>
                      <td className="py-3 px-4">Mar 12, 2024</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Good</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Essay Writing</td>
                      <td className="py-3 px-4">English</td>
                      <td className="py-3 px-4">Assignment</td>
                      <td className="py-3 px-4 font-bold text-purple-600">82%</td>
                      <td className="py-3 px-4">Mar 10, 2024</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Very Good</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">History Quiz</td>
                      <td className="py-3 px-4">Social Studies</td>
                      <td className="py-3 px-4">MCQ</td>
                      <td className="py-3 px-4 font-bold text-yellow-600">62%</td>
                      <td className="py-3 px-4">Mar 8, 2024</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Needs Work</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Personalized Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-bold text-blue-700 mb-3 flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Focus Areas</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Practice more Social Studies timeline questions</li>
                    <li>• Work on Science practical applications</li>
                    <li>• Improve time management strategies</li>
                    <li>• Enhance Hindi creative writing skills</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-bold text-green-700 mb-3 flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Suggested Activities</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Additional MCQ practice sessions</li>
                    <li>• Group study for Social Studies</li>
                    <li>• Science lab experiment reviews</li>
                    <li>• Hindi story writing exercises</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Generated by SenseAI Performance Analyzer</span>
                <span>Report Date: March 20, 2024 | Next Review: April 20, 2024</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePreview;