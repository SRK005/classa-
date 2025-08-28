'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  BookOpen, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  Users,
  Settings,
  ChevronDown,
  Plus,
  Trash2,
  Download,
  Eye,
  Target,
  Zap,
  BookMarked
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DifferentiationData {
  class: string;
  subject: string;
  chapter: string;
  lesson: string;
  topic: string;
  difficultyLevels: string[];
  contentTypes: string[];
  customRequirements: string;
}

const ContentDifferentiator: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [differentiationData, setDifferentiationData] = useState<DifferentiationData>({
    class: '',
    subject: '',
    chapter: '',
    lesson: '',
    topic: '',
    difficultyLevels: ['standard'],
    contentTypes: ['text-based'],
    customRequirements: ''
  });

  // Sample data for dropdowns
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Physics', 'Chemistry', 'Biology'];
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
  const lessons = ['Lesson 1.1', 'Lesson 1.2', 'Lesson 1.3', 'Lesson 2.1', 'Lesson 2.2'];



  const difficultyLevelOptions = [
    'below-grade',
    'on-grade',
    'above-grade',
    'intermediate',
    'advanced',
    'remedial',
    'standard'
  ];

  const contentTypeOptions = [
    'text-based',
    'visual-infographics',
    'interactive-activities',
    'games-puzzles',
    'real-world-examples',
    'case-studies',
    'simulations'
  ];



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!differentiationData.subject.trim() || !differentiationData.chapter.trim()) return;
    
    setIsLoading(true);
    try {
      // Generate sample differentiated content
      const differentiatedContent = {
        ...differentiationData,
        generatedContent: {
          visualLearners: {
            materials: ['Concept maps', 'Infographics', 'Diagrams', 'Charts'],
            activities: ['Visual organizers', 'Mind mapping', 'Color coding'],
            assessments: ['Visual presentations', 'Poster creation', 'Diagram labeling']
          },
          auditoryLearners: {
            materials: ['Audio recordings', 'Podcasts', 'Discussion guides'],
            activities: ['Group discussions', 'Verbal explanations', 'Audio summaries'],
            assessments: ['Oral presentations', 'Verbal quizzes', 'Discussion participation']
          },
          kinestheticLearners: {
            materials: ['Hands-on manipulatives', 'Physical models', 'Interactive tools'],
            activities: ['Lab experiments', 'Building activities', 'Role-playing'],
            assessments: ['Practical demonstrations', 'Project-based tasks', 'Performance assessments']
          },
          accommodations: []
        },
        difficultyVariations: differentiationData.difficultyLevels.map(level => ({
          level,
          content: `${level.replace('-', ' ')} level content for ${differentiationData.topic || differentiationData.chapter}`,
          activities: [`${level} difficulty activities`, `Scaffolded learning for ${level} students`],
          assessments: [`${level} appropriate assessments`, `Modified evaluation criteria`]
        })),
        generatedAt: new Date().toISOString(),
        downloadFormats: ['PDF', 'Word', 'PowerPoint']
      };
      
      // Store differentiated content data in localStorage
      localStorage.setItem('differentiatedContent', JSON.stringify(differentiatedContent));
      
      // Redirect to results page
      router.push('/sense-ai/content-differentiator-results');
    } catch (error) {
      console.error('Error generating differentiated content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = (category: keyof DifferentiationData, item: string) => {
    const currentItems = differentiationData[category] as string[];
    if (!currentItems.includes(item)) {
      setDifferentiationData(prev => ({
        ...prev,
        [category]: [...currentItems, item]
      }));
    }
  };

  const removeItem = (category: keyof DifferentiationData, item: string) => {
    const currentItems = differentiationData[category] as string[];
    if (currentItems.length > 1) {
      setDifferentiationData(prev => ({
        ...prev,
        [category]: currentItems.filter(i => i !== item)
      }));
    }
  };

  const renderTagSection = (title: string, category: keyof DifferentiationData, options: string[], colorClass: string) => {
    const items = differentiationData[category] as string[];
    return (
      <div>
        <label className="block font-semibold text-gray-800 mb-3">
          {title}
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {items.map(item => (
            <span
              key={item}
              className={`inline-flex items-center space-x-2 px-3 py-1 ${colorClass} rounded-lg text-sm`}
            >
              <span>{item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(category, item)}
                  className="text-current hover:text-opacity-80"
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
              addItem(category, e.target.value);
              e.target.value = '';
            }
          }}
          className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
        >
          <option value="">Add {title.toLowerCase()}...</option>
          {options.filter(option => !items.includes(option)).map(option => (
            <option key={option} value={option}>
              {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-900" style={{
      background: `
        radial-gradient(1200px 600px at 50% 6%, rgba(59, 130, 246, 0.05), rgba(255,255,255,0) 60%),
        radial-gradient(1000px 600px at 50% 100%, rgba(99, 102, 241, 0.08), rgba(249, 250, 251, 1) 70%),
        radial-gradient(2200px 900px at 50% -10%, rgba(147, 197, 253, 0.06), rgba(255,255,255,0) 60%),
        #ffffff
      `
    }}>
      {/* Premium Color Blur Spots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-cyan-300/15 to-blue-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-300/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-gradient-to-r from-blue-300/15 to-cyan-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-200/10 to-cyan-200/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Content Differentiator</h1>
              <p className="text-gray-600 mt-1">Create personalized learning materials for diverse student needs</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/sense-ai/content-diff-preview')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Sample</span>
            </button>
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
              <Layers className="w-8 h-8 text-white" />
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
            transition={{ duration: 0.5 }}
            className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Differentiation Configuration</h2>
                <p className="text-gray-600 text-sm">Configure content differentiation for diverse learning needs and styles</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-gray-800 mb-3">
                    Class *
                  </label>
                  <select
                    value={differentiationData.class}
                    onChange={(e) => setDifferentiationData(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
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
                    value={differentiationData.subject}
                    onChange={(e) => setDifferentiationData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:shadow-lg transition-all duration-300"
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
                    Chapter *
                  </label>
                  <select
                    value={differentiationData.chapter}
                    onChange={(e) => setDifferentiationData(prev => ({ ...prev, chapter: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:shadow-lg transition-all duration-300"
                    required
                  >
                    <option value="">Select Chapter</option>
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
                    value={differentiationData.lesson}
                    onChange={(e) => setDifferentiationData(prev => ({ ...prev, lesson: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:shadow-lg transition-all duration-300"
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
                <label className="block font-semibold text-gray-800 mb-3">
                  Specific Topic/Concept
                </label>
                <input
                  type="text"
                  value={differentiationData.topic}
                  onChange={(e) => setDifferentiationData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Fractions, Ecosystem, Grammar rules"
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
                />
              </div>

              {/* Difficulty Levels */}
              {renderTagSection('Difficulty Levels', 'difficultyLevels', difficultyLevelOptions, 'bg-blue-100 text-blue-700')}

              {/* Content Types */}
              {renderTagSection('Content Types', 'contentTypes', contentTypeOptions, 'bg-cyan-100 text-cyan-700')}

              {/* Custom Requirements */}
              <div>
                <label className="block font-semibold text-gray-800 mb-3">
                  Custom Requirements (Optional)
                </label>
                <textarea
                  value={differentiationData.customRequirements}
                  onChange={(e) => setDifferentiationData(prev => ({ ...prev, customRequirements: e.target.value }))}
                  placeholder="Enter any specific differentiation requirements or student needs..."
                  className="w-full h-24 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300 resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !differentiationData.subject.trim() || !differentiationData.chapter.trim()}
                className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-700 hover:via-cyan-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-semibold rounded-2xl transition-all duration-300 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/25"
                whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                style={{
                  boxShadow: isLoading ? undefined : "0 20px 40px -10px rgba(59, 130, 246, 0.3), 0 10px 20px -5px rgba(59, 130, 246, 0.2)"
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Differentiating Content...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Generate Differentiated Content</span>
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

export default ContentDifferentiator;