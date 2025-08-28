'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  BookOpen, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  TrendingUp,
  Settings,
  ChevronDown,
  Plus,
  Trash2,
  Download,
  Eye,
  Users,
  Target,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PerformanceData {
  studentName: string;
  studentId: string;
  class: string;
  subject: string;
  chapter: string;
  lesson: string;
  analysisType: string;
  timeframe: string;
  assessmentTypes: string[];
  metricsToAnalyze: string[];
  includeComparisons: boolean;
  includeRecommendations: boolean;
  includeVisualCharts: boolean;
  customNotes: string;
}

const StudentPerformanceAnalyzer: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    studentName: '',
    studentId: '',
    class: '',
    subject: '',
    chapter: '',
    lesson: '',
    analysisType: 'comprehensive',
    timeframe: 'current-term',
    assessmentTypes: ['mcq-assessments'],
    metricsToAnalyze: ['overall-score'],
    includeComparisons: true,
    includeRecommendations: true,
    includeVisualCharts: true,
    customNotes: ''
  });

  // Sample data for dropdowns
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Physics', 'Chemistry', 'Biology'];
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
  const lessons = ['Lesson 1.1', 'Lesson 1.2', 'Lesson 1.3', 'Lesson 2.1', 'Lesson 2.2'];

  const analysisTypes = [
    { value: 'comprehensive', label: 'Comprehensive Analysis', description: 'Complete individual performance overview' },
    { value: 'subject-specific', label: 'Subject-Specific', description: 'Focus on specific subject performance' },
    { value: 'skill-based', label: 'Skill-Based Analysis', description: 'Analyze specific learning skills' },
    { value: 'progress-tracking', label: 'Progress Tracking', description: 'Track individual improvement over time' }
  ];

  const timeframes = [
    { value: 'current-week', label: 'Current Week' },
    { value: 'current-month', label: 'Current Month' },
    { value: 'current-term', label: 'Current Term' },
    { value: 'current-year', label: 'Current Academic Year' },
    { value: 'custom-range', label: 'Custom Date Range' }
  ];

  const assessmentTypeOptions = [
    'mcq-assessments',
    'assignments'
  ];

  const metricsOptions = [
    'overall-score',
    'subject-performance',
    'improvement-rate',
    'time-spent',
    'difficulty-analysis',
    'topic-mastery',
    'completion-rate'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!performanceData.subject.trim() || !performanceData.class.trim() || !performanceData.studentName.trim()) return;
    
    setIsLoading(true);
    try {
      // Generate sample performance analysis data
      const analysisResults = {
        ...performanceData,
        results: {
          overallPerformance: {
            studentScore: 82.5,
            averageScore: 78.5,
            improvementRate: 12.3,
            completionRate: 95
          },
          topicAnalysis: [
            { topic: performanceData.chapter || 'Chapter 1', averageScore: 82, difficulty: 'Medium', masteryLevel: 'Good' },
            { topic: performanceData.lesson || 'Lesson 1.1', averageScore: 75, difficulty: 'Hard', masteryLevel: 'Needs Improvement' }
          ],
          performanceLevel: {
            current: 'Good',
            trend: 'Improving',
            strengths: ['Problem Solving', 'Conceptual Understanding'],
            weaknesses: ['Time Management', 'Complex Applications']
          },
          recommendations: [
            'Focus on time management strategies during assessments',
            'Practice more complex application problems',
            'Review conceptual foundations in weaker topics',
            'Maintain current strong performance in problem-solving areas'
          ],
          trends: {
            overallTrend: 'improving',
            monthlyProgress: [75, 78, 80, 82.5],
            strongestAreas: ['MCQ Assessments', 'Basic Concepts'],
            improvementAreas: ['Complex Problems', 'Assignment Completion']
          }
        },
        generatedAt: new Date().toISOString(),
        reportFormats: ['PDF', 'Excel', 'PowerPoint']
      };
      
      // Store performance analysis data in localStorage
      localStorage.setItem('performanceAnalysis', JSON.stringify(analysisResults));
      
      // Redirect to results page
      router.push('/sense-ai/performance-analyzer-results');
    } catch (error) {
      console.error('Error generating performance analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAssessmentType = (type: string) => {
    if (!performanceData.assessmentTypes.includes(type)) {
      setPerformanceData(prev => ({
        ...prev,
        assessmentTypes: [...prev.assessmentTypes, type]
      }));
    }
  };

  const removeAssessmentType = (type: string) => {
    if (performanceData.assessmentTypes.length > 1) {
      setPerformanceData(prev => ({
        ...prev,
        assessmentTypes: prev.assessmentTypes.filter(t => t !== type)
      }));
    }
  };

  const addMetric = (metric: string) => {
    if (!performanceData.metricsToAnalyze.includes(metric)) {
      setPerformanceData(prev => ({
        ...prev,
        metricsToAnalyze: [...prev.metricsToAnalyze, metric]
      }));
    }
  };

  const removeMetric = (metric: string) => {
    if (performanceData.metricsToAnalyze.length > 1) {
      setPerformanceData(prev => ({
        ...prev,
        metricsToAnalyze: prev.metricsToAnalyze.filter(m => m !== metric)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden text-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-6000"></div>
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
              onClick={() => router.push('/sense-ai')}
              className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-200 hover:bg-white hover:border-blue-300 transition-all duration-300 shadow-lg text-blue-600 hover:text-blue-700"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Student Performance Analyzer</h1>
              <p className="text-gray-600 mt-1">Analyze student performance, track progress, and generate insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/sense-ai/performance-preview')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Sample</span>
            </button>
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100/50"
            style={{
              boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Student Performance Analysis</h2>
                <p className="text-gray-600">Analyze individual student performance with comprehensive insights</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-800 mb-3">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={performanceData.studentName}
                    onChange={(e) => setPerformanceData(prev => ({ ...prev, studentName: e.target.value }))}
                    placeholder="Enter student name"
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-800 mb-3">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={performanceData.studentId}
                    onChange={(e) => setPerformanceData(prev => ({ ...prev, studentId: e.target.value }))}
                    placeholder="Enter student ID (optional)"
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:shadow-lg transition-all duration-300"
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-gray-800 mb-3">
                    Class *
                  </label>
                  <select
                    value={performanceData.class}
                    onChange={(e) => setPerformanceData(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:shadow-lg transition-all duration-300"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-800 mb-3">
                    Subject *
                  </label>
                  <select
                    value={performanceData.subject}
                    onChange={(e) => setPerformanceData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:shadow-lg transition-all duration-300"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-800 mb-3">
                    Chapter
                  </label>
                  <select
                    value={performanceData.chapter}
                    onChange={(e) => setPerformanceData(prev => ({ ...prev, chapter: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
                  >
                    <option value="">All Chapters</option>
                    {chapters.map(chapter => (
                      <option key={chapter} value={chapter}>{chapter}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-800 mb-3">
                    Lesson
                  </label>
                  <select
                    value={performanceData.lesson}
                    onChange={(e) => setPerformanceData(prev => ({ ...prev, lesson: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-50 to-sky-50 border border-cyan-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:shadow-lg transition-all duration-300"
                  >
                    <option value="">All Lessons</option>
                    {lessons.map(lesson => (
                      <option key={lesson} value={lesson}>{lesson}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Analysis Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-800 mb-3">
                    Analysis Type
                  </label>
                  <select
                    value={performanceData.analysisType}
                    onChange={(e) => setPerformanceData(prev => ({ ...prev, analysisType: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:shadow-lg transition-all duration-300"
                  >
                    {analysisTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {analysisTypes.find(t => t.value === performanceData.analysisType)?.description}
                  </p>
                </div>
                <div>
                  <label className="block font-semibold text-gray-800 mb-3">
                    Timeframe
                  </label>
                  <select
                    value={performanceData.timeframe}
                    onChange={(e) => setPerformanceData(prev => ({ ...prev, timeframe: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:shadow-lg transition-all duration-300"
                  >
                    {timeframes.map(timeframe => (
                      <option key={timeframe.value} value={timeframe.value}>{timeframe.label}</option>
                    ))}
                  </select>
                </div>
              </div>



              {/* Assessment Types */}
              <div>
                <label className="block font-semibold text-gray-800 mb-3">
                  Assessment Types to Include
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {performanceData.assessmentTypes.map(type => (
                    <span
                      key={type}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                    >
                      <span>{type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                      {performanceData.assessmentTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAssessmentType(type)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addAssessmentType(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
                >
                  <option value="">Add assessment type...</option>
                  {assessmentTypeOptions.filter(type => !performanceData.assessmentTypes.includes(type)).map(type => (
                    <option key={type} value={type}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Metrics to Analyze */}
              <div>
                <label className="block font-semibold text-gray-800 mb-3">
                  Metrics to Analyze
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {performanceData.metricsToAnalyze.map(metric => (
                    <span
                      key={metric}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                    >
                      <span>{metric.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                      {performanceData.metricsToAnalyze.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMetric(metric)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addMetric(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:shadow-lg transition-all duration-300"
                >
                  <option value="">Add metric...</option>
                  {metricsOptions.filter(metric => !performanceData.metricsToAnalyze.includes(metric)).map(metric => (
                    <option key={metric} value={metric}>
                      {metric.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Analysis Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="comparisons"
                    checked={performanceData.includeComparisons}
                    onChange={(e) => setPerformanceData(prev => ({ ...prev, includeComparisons: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="comparisons" className="font-semibold text-gray-800">
                    Include Subject Average Comparisons
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="recommendations"
                    checked={performanceData.includeRecommendations}
                    onChange={(e) => setPerformanceData(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="recommendations" className="font-semibold text-gray-800">
                    Include Improvement Recommendations
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="visualCharts"
                    checked={performanceData.includeVisualCharts}
                    onChange={(e) => setPerformanceData(prev => ({ ...prev, includeVisualCharts: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="visualCharts" className="font-semibold text-gray-800">
                    Include Visual Charts and Graphs
                  </label>
                </div>
              </div>

              {/* Custom Notes */}
              <div>
                <label className="block font-semibold text-gray-800 mb-3">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={performanceData.customNotes}
                  onChange={(e) => setPerformanceData(prev => ({ ...prev, customNotes: e.target.value }))}
                  placeholder="Enter any specific analysis requirements or focus areas..."
                  className="w-full h-24 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300 resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !performanceData.subject.trim() || !performanceData.class.trim() || !performanceData.studentName.trim()}
                className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-700 hover:via-cyan-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold text-lg rounded-2xl transition-all duration-300 disabled:cursor-not-allowed shadow-2xl hover:scale-105 active:scale-95"
                style={{
                  boxShadow: isLoading ? 'none' : '0 20px 40px -10px rgba(59, 130, 246, 0.4), 0 10px 20px -5px rgba(59, 130, 246, 0.3)'
                }}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Analyzing Performance...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Generate Analysis</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformanceAnalyzer;