'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  BookOpen, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  Image,
  Settings,
  ChevronDown,
  Plus,
  Trash2,
  Download,
  Eye,
  Layout,
  Type,
  Shapes
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TeachingAidData {
  class: string;
  subject: string;
  chapter: string;
  lesson: string;
  topic: string;
  aidType: string;
  visualStyle: string;
  colorScheme: string;
  includeText: boolean;
  includeImages: boolean;
  includeCharts: boolean;
  customInstructions: string;
  targetAudience: string;
  learningObjectives: string[];
}

const TeachingAidDesigner: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [aidData, setAidData] = useState<TeachingAidData>({
    class: '',
    subject: '',
    chapter: '',
    lesson: '',
    topic: '',
    aidType: 'poster',
    visualStyle: 'modern',
    colorScheme: 'vibrant',
    includeText: true,
    includeImages: true,
    includeCharts: false,
    customInstructions: '',
    targetAudience: 'students',
    learningObjectives: ['understand-concept']
  });

  // Sample data for dropdowns
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Physics', 'Chemistry', 'Biology'];
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
  const lessons = ['Lesson 1.1', 'Lesson 1.2', 'Lesson 1.3', 'Lesson 2.1', 'Lesson 2.2'];

  const aidTypes = [
    { value: 'poster', label: 'Educational Poster', description: 'Visual learning posters for classroom display' },
    { value: 'infographic', label: 'Infographic', description: 'Data-driven visual representations' },
    { value: 'flashcard', label: 'Flash Cards', description: 'Quick reference and memorization cards' },
    { value: 'diagram', label: 'Concept Diagram', description: 'Process flows and concept maps' },
    { value: 'timeline', label: 'Timeline', description: 'Historical or sequential events' },
    { value: 'comparison', label: 'Comparison Chart', description: 'Side-by-side comparisons' },
    { value: 'mindmap', label: 'Mind Map', description: 'Branching concept visualization' }
  ];

  const visualStyles = [
    { value: 'modern', label: 'Modern', description: 'Clean, contemporary design' },
    { value: 'playful', label: 'Playful', description: 'Fun, engaging for younger students' },
    { value: 'academic', label: 'Academic', description: 'Professional, scholarly appearance' },
    { value: 'minimalist', label: 'Minimalist', description: 'Simple, focused design' },
    { value: 'colorful', label: 'Colorful', description: 'Bright, vibrant visuals' }
  ];

  const colorSchemes = [
    { value: 'vibrant', label: 'Vibrant', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'] },
    { value: 'pastel', label: 'Pastel', colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA'] },
    { value: 'professional', label: 'Professional', colors: ['#2C3E50', '#3498DB', '#E74C3C', '#F39C12'] },
    { value: 'monochrome', label: 'Monochrome', colors: ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7'] },
    { value: 'nature', label: 'Nature', colors: ['#27AE60', '#F39C12', '#E67E22', '#8E44AD'] }
  ];

  const learningObjectiveOptions = [
    'understand-concept',
    'memorize-facts',
    'analyze-data',
    'compare-contrast',
    'visualize-process',
    'identify-patterns',
    'solve-problems',
    'apply-knowledge'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aidData.subject.trim() || !aidData.chapter.trim()) return;
    
    setIsLoading(true);
    try {
      // Generate sample teaching aid data
      const generatedAid = {
        ...aidData,
        design: {
          layout: aidData.aidType === 'poster' ? 'vertical' : aidData.aidType === 'timeline' ? 'horizontal' : 'grid',
          elements: [
            { type: 'title', content: `${aidData.topic || aidData.chapter} - ${aidData.subject}`, position: 'top' },
            ...(aidData.includeText ? [{ type: 'text', content: `Key concepts about ${aidData.topic || aidData.chapter}`, position: 'center' }] : []),
            ...(aidData.includeImages ? [{ type: 'image', content: 'Relevant educational imagery', position: 'center-right' }] : []),
            ...(aidData.includeCharts ? [{ type: 'chart', content: 'Data visualization', position: 'bottom' }] : [])
          ],
          colorPalette: colorSchemes.find(scheme => scheme.value === aidData.colorScheme)?.colors || [],
          style: aidData.visualStyle
        },
        generatedAt: new Date().toISOString(),
        downloadFormats: ['PDF', 'PNG', 'SVG'],
        printReady: true
      };
      
      // Store teaching aid data in localStorage
      localStorage.setItem('generatedTeachingAid', JSON.stringify(generatedAid));
      
      // Redirect to results page
      router.push('/sense-ai/teaching-aid-designer-results');
    } catch (error) {
      console.error('Error generating teaching aid:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addLearningObjective = (objective: string) => {
    if (!aidData.learningObjectives.includes(objective)) {
      setAidData(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, objective]
      }));
    }
  };

  const removeLearningObjective = (objective: string) => {
    if (aidData.learningObjectives.length > 1) {
      setAidData(prev => ({
        ...prev,
        learningObjectives: prev.learningObjectives.filter(obj => obj !== objective)
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
              <h1 className="text-3xl font-bold text-gray-900">Teaching Aid Designer</h1>
              <p className="text-gray-600 mt-1">Create visual learning materials, posters, and educational graphics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/sense-ai/teaching-aid-preview')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Sample</span>
            </button>
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
              <Palette className="w-8 h-8 text-white" />
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
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8"
              style={{
                boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)'
              }}
            >
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                <Palette className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Design Configuration</h2>
                <p className="text-gray-600">Customize your teaching aid parameters and visual preferences</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Class *
                  </label>
                  <select
                    value={aidData.class}
                    onChange={(e) => setAidData(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-lg font-medium"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Subject *
                  </label>
                  <select
                    value={aidData.subject}
                    onChange={(e) => setAidData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 hover:shadow-lg font-medium"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Chapter *
                  </label>
                  <select
                    value={aidData.chapter}
                    onChange={(e) => setAidData(prev => ({ ...prev, chapter: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:shadow-lg font-medium"
                    required
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map(chapter => (
                      <option key={chapter} value={chapter}>{chapter}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Lesson
                  </label>
                  <select
                    value={aidData.lesson}
                    onChange={(e) => setAidData(prev => ({ ...prev, lesson: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:shadow-lg font-medium"
                  >
                    <option value="">Select Lesson</option>
                    {lessons.map(lesson => (
                      <option key={lesson} value={lesson}>{lesson}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Specific Topic/Concept *
                </label>
                <input
                  type="text"
                  value={aidData.topic}
                  onChange={(e) => setAidData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Solar System, Photosynthesis, Fractions"
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 hover:shadow-lg font-medium"
                  required
                />
              </div>

              {/* Design Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Teaching Aid Type
                  </label>
                  <select
                    value={aidData.aidType}
                    onChange={(e) => setAidData(prev => ({ ...prev, aidType: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 hover:shadow-lg font-medium"
                  >
                    {aidTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {aidTypes.find(t => t.value === aidData.aidType)?.description}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Visual Style
                  </label>
                  <select
                    value={aidData.visualStyle}
                    onChange={(e) => setAidData(prev => ({ ...prev, visualStyle: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 hover:shadow-lg font-medium"
                  >
                    {visualStyles.map(style => (
                      <option key={style.value} value={style.value}>{style.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {visualStyles.find(s => s.value === aidData.visualStyle)?.description}
                  </p>
                </div>
              </div>

              {/* Color Scheme */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Color Scheme
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {colorSchemes.map(scheme => (
                    <div
                      key={scheme.value}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        aidData.colorScheme === scheme.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setAidData(prev => ({ ...prev, colorScheme: scheme.value }))}
                    >
                      <div className="flex space-x-1 mb-2">
                        {scheme.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-medium text-gray-700">{scheme.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Elements */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Include Elements
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeText"
                      checked={aidData.includeText}
                      onChange={(e) => setAidData(prev => ({ ...prev, includeText: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="includeText" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Type className="w-4 h-4" />
                      <span>Text Content</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeImages"
                      checked={aidData.includeImages}
                      onChange={(e) => setAidData(prev => ({ ...prev, includeImages: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="includeImages" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Image className="w-4 h-4" />
                      <span>Images</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeCharts"
                      checked={aidData.includeCharts}
                      onChange={(e) => setAidData(prev => ({ ...prev, includeCharts: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="includeCharts" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Shapes className="w-4 h-4" />
                      <span>Charts/Diagrams</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Target Audience
                </label>
                <select
                  value={aidData.targetAudience}
                  onChange={(e) => setAidData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 hover:shadow-lg font-medium"
                >
                  <option value="students">Students</option>
                  <option value="teachers">Teachers</option>
                  <option value="parents">Parents</option>
                  <option value="general">General Audience</option>
                </select>
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Learning Objectives
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {aidData.learningObjectives.map(objective => (
                    <span
                      key={objective}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm"
                    >
                      <span>{objective.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                      {aidData.learningObjectives.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLearningObjective(objective)}
                          className="text-purple-600 hover:text-purple-800"
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
                      addLearningObjective(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 hover:shadow-lg font-medium"
                >
                  <option value="">Add learning objective...</option>
                  {learningObjectiveOptions.filter(obj => !aidData.learningObjectives.includes(obj)).map(objective => (
                    <option key={objective} value={objective}>
                      {objective.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={aidData.customInstructions}
                  onChange={(e) => setAidData(prev => ({ ...prev, customInstructions: e.target.value }))}
                  placeholder="Enter any specific design requirements or content preferences..."
                  className="w-full h-24 px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300 hover:shadow-lg font-medium resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !aidData.subject.trim() || !aidData.chapter.trim() || !aidData.topic.trim()}
                className={`w-full py-4 px-8 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-2xl ${
                  isLoading || !aidData.subject.trim() || !aidData.chapter.trim() || !aidData.topic.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-700 hover:via-cyan-700 hover:to-indigo-700 hover:shadow-3xl'
                }`}
                style={{
                  boxShadow: isLoading || !aidData.subject.trim() || !aidData.chapter.trim() || !aidData.topic.trim()
                    ? 'none' 
                    : '0 20px 40px -12px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-lg">Designing Teaching Aid...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Sparkles className="w-6 h-6" />
                    <span className="text-lg">Generate Teaching Aid</span>
                  </div>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeachingAidDesigner;