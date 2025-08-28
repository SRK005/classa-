'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
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
  Clock,
  Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuizData {
  class: string;
  subject: string;
  chapter: string;
  lesson: string;
  topic: string;
  quizType: string;
  difficulty: string;
  questionCount: number;
  timeLimit: number;
  questionTypes: string[];
  includeExplanations: boolean;
  randomizeQuestions: boolean;
  customInstructions: string;
}

const InteractiveQuizMaker: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [quizData, setQuizData] = useState<QuizData>({
    class: '',
    subject: '',
    chapter: '',
    lesson: '',
    topic: '',
    quizType: 'practice',
    difficulty: 'medium',
    questionCount: 10,
    timeLimit: 15,
    questionTypes: ['multiple-choice'],
    includeExplanations: true,
    randomizeQuestions: false,
    customInstructions: ''
  });

  // Sample data for dropdowns
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Physics', 'Chemistry', 'Biology'];
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
  const lessons = ['Lesson 1.1', 'Lesson 1.2', 'Lesson 1.3', 'Lesson 2.1', 'Lesson 2.2'];

  const quizTypes = [
    { value: 'practice', label: 'Practice Quiz' },
    { value: 'assessment', label: 'Assessment Quiz' },
    { value: 'review', label: 'Review Quiz' },
    { value: 'diagnostic', label: 'Diagnostic Quiz' }
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'mixed', label: 'Mixed Difficulty' }
  ];

  const questionTypeOptions = [
    'multiple-choice',
    'true-false',
    'fill-in-blanks',
    'short-answer',
    'matching',
    'ordering'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizData.subject.trim() || !quizData.chapter.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to quiz preview
      router.push('/sense-ai/quiz-preview');
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestionType = (type: string) => {
    if (!quizData.questionTypes.includes(type)) {
      setQuizData(prev => ({
        ...prev,
        questionTypes: [...prev.questionTypes, type]
      }));
    }
  };

  const removeQuestionType = (type: string) => {
    if (quizData.questionTypes.length > 1) {
      setQuizData(prev => ({
        ...prev,
        questionTypes: prev.questionTypes.filter(t => t !== type)
      }));
    }
  };

  const renderDropdown = (label: string, value: string, options: string[], onChange: (value: string) => void) => (
    <div>
      <label className="block font-semibold text-gray-800 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

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
              <h1 className="text-3xl font-bold text-gray-900">Interactive Quiz & Poll Maker</h1>
              <p className="text-gray-600 mt-1">Create engaging quizzes and polls for interactive learning</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/sense-ai/quiz-preview')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Sample</span>
            </button>
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
              <HelpCircle className="w-8 h-8 text-white" />
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
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg">
                <HelpCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quiz Configuration</h2>
                <p className="text-gray-600">Set up your interactive quiz parameters and question types</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderDropdown('Class', quizData.class, classes, (value) => setQuizData(prev => ({ ...prev, class: value })))}
                {renderDropdown('Subject', quizData.subject, subjects, (value) => setQuizData(prev => ({ ...prev, subject: value })))}
                {renderDropdown('Chapter', quizData.chapter, chapters, (value) => setQuizData(prev => ({ ...prev, chapter: value })))}
                {renderDropdown('Lesson', quizData.lesson, lessons, (value) => setQuizData(prev => ({ ...prev, lesson: value })))}
              </div>

              {/* Topic */}
              <div>
                <label className="block font-semibold text-gray-800 mb-2">Topic</label>
                <input
                  type="text"
                  value={quizData.topic}
                  onChange={(e) => setQuizData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Photosynthesis, Algebra, Grammar"
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
                />
              </div>

              {/* Quiz Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-gray-800 mb-2">Quiz Type</label>
                  <select
                    value={quizData.quizType}
                    onChange={(e) => setQuizData(prev => ({ ...prev, quizType: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
                  >
                    {quizTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-800 mb-2">Difficulty</label>
                  <select
                    value={quizData.difficulty}
                    onChange={(e) => setQuizData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
                  >
                    {difficultyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-2">Questions</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={quizData.questionCount}
                    onChange={(e) => setQuizData(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 10 }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-2">Time (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 15 }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
                  />
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="block font-semibold text-gray-800 mb-3">Question Types</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {quizData.questionTypes.map(type => (
                    <span
                      key={type}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                    >
                      <span>{type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                      {quizData.questionTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestionType(type)}
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
                      addQuestionType(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
                >
                  <option value="">Add question type...</option>
                  {questionTypeOptions.filter(option => !quizData.questionTypes.includes(option)).map(option => (
                    <option key={option} value={option}>
                      {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="explanations"
                    checked={quizData.includeExplanations}
                    onChange={(e) => setQuizData(prev => ({ ...prev, includeExplanations: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="explanations" className="text-gray-800 font-medium">Include explanations for answers</label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="randomize"
                    checked={quizData.randomizeQuestions}
                    onChange={(e) => setQuizData(prev => ({ ...prev, randomizeQuestions: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="randomize" className="text-gray-800 font-medium">Randomize question order</label>
                </div>
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block font-semibold text-gray-800 mb-3">Custom Instructions (Optional)</label>
                <textarea
                  value={quizData.customInstructions}
                  onChange={(e) => setQuizData(prev => ({ ...prev, customInstructions: e.target.value }))}
                  placeholder="Enter any specific requirements for the quiz..."
                  className="w-full h-24 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300 resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !quizData.subject.trim() || !quizData.chapter.trim()}
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
                    <span>Creating Quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Generate Interactive Quiz</span>
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

export default InteractiveQuizMaker;