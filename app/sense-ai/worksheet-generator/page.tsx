'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  BookOpen, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  FileText,
  Settings,
  ChevronDown,
  Plus,
  Trash2,
  Download,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorksheetData {
  class: string;
  subject: string;
  chapter: string;
  lesson: string;
  topic: string;
  worksheetType: string;
  difficultyLevel: string;
  questionCount: number;
  includeAnswerKey: boolean;
  includeInstructions: boolean;
  customInstructions: string;
  questionTypes: string[];
}

const WorksheetGenerator: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [worksheetData, setWorksheetData] = useState<WorksheetData>({
    class: '',
    subject: '',
    chapter: '',
    lesson: '',
    topic: '',
    worksheetType: 'practice',
    difficultyLevel: 'mixed',
    questionCount: 10,
    includeAnswerKey: true,
    includeInstructions: true,
    customInstructions: '',
    questionTypes: ['multiple-choice']
  });

  // Sample data for dropdowns
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Physics', 'Chemistry', 'Biology'];
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
  const lessons = ['Lesson 1.1', 'Lesson 1.2', 'Lesson 1.3', 'Lesson 2.1', 'Lesson 2.2'];

  const worksheetTypes = [
    { value: 'practice', label: 'Practice Worksheet', description: 'Regular practice exercises' },
    { value: 'homework', label: 'Homework Assignment', description: 'Take-home assignments' },
    { value: 'assessment', label: 'Assessment Sheet', description: 'Evaluation and testing' },
    { value: 'revision', label: 'Revision Sheet', description: 'Review and recap' },
    { value: 'enrichment', label: 'Enrichment Activities', description: 'Advanced challenges' }
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'hard', label: 'Hard', color: 'text-red-600' },
    { value: 'mixed', label: 'Mixed Difficulty', color: 'text-blue-600' }
  ];

  const questionTypes = [
    'multiple-choice',
    'true-false',
    'short-answer',
    'long-answer',
    'fill-in-the-blank',
    'matching',
    'diagram-based',
    'calculation'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worksheetData.subject.trim() || !worksheetData.chapter.trim()) return;
    
    setIsLoading(true);
    try {
      // Generate sample worksheet data
      const generatedWorksheet = {
        ...worksheetData,
        questions: Array.from({ length: worksheetData.questionCount }, (_, i) => ({
          id: i + 1,
          question: `Sample ${worksheetData.difficultyLevel} question ${i + 1} about ${worksheetData.topic || worksheetData.chapter}`,
          type: worksheetData.questionTypes[i % worksheetData.questionTypes.length],
          options: worksheetData.questionTypes[i % worksheetData.questionTypes.length] === 'multiple-choice' 
            ? ['Option A', 'Option B', 'Option C', 'Option D'] 
            : null,
          correctAnswer: 'Option A',
          points: worksheetData.difficultyLevel === 'easy' ? 1 : worksheetData.difficultyLevel === 'medium' ? 2 : 3,
          explanation: `This question tests understanding of ${worksheetData.topic || worksheetData.chapter}.`
        })),
        generatedAt: new Date().toISOString(),
        totalPoints: worksheetData.questionCount * (worksheetData.difficultyLevel === 'mixed' ? 2 : 
          worksheetData.difficultyLevel === 'easy' ? 1 : worksheetData.difficultyLevel === 'medium' ? 2 : 3)
      };
      
      // Store worksheet data in localStorage
      localStorage.setItem('generatedWorksheet', JSON.stringify(generatedWorksheet));
      
      // Redirect to results page
      router.push('/sense-ai/worksheet-generator-results');
    } catch (error) {
      console.error('Error generating worksheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestionType = (type: string) => {
    if (!worksheetData.questionTypes.includes(type)) {
      setWorksheetData(prev => ({
        ...prev,
        questionTypes: [...prev.questionTypes, type]
      }));
    }
  };

  const removeQuestionType = (type: string) => {
    if (worksheetData.questionTypes.length > 1) {
      setWorksheetData(prev => ({
        ...prev,
        questionTypes: prev.questionTypes.filter(t => t !== type)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-indigo-400/8 to-blue-400/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-72 h-72 bg-gradient-to-r from-cyan-400/12 to-blue-500/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-gradient-to-r from-blue-300/10 to-indigo-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
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
              className="p-3 rounded-2xl bg-white backdrop-blur-sm border border-blue-100/50 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <ArrowRight className="w-5 h-5 rotate-180 text-blue-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Smart Worksheet Generator</h1>
              <p className="text-gray-600 mt-1">Generate exercises, question papers, and homework sheets from any chapter</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/sense-ai/worksheet-preview')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Preview Sample</span>
            </button>
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
              <Target className="w-8 h-8 text-white" />
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
            className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100/50"
            style={{
              boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Worksheet Configuration</h2>
                  <p className="text-gray-600 text-sm">Configure your worksheet parameters and generate custom exercises</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{worksheetData.questionCount}</div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{worksheetData.includeAnswerKey ? 'Yes' : 'No'}</div>
                  <div className="text-xs text-gray-500">Answer Key</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class *
                  </label>
                  <select
                    value={worksheetData.class}
                    onChange={(e) => setWorksheetData(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    value={worksheetData.subject}
                    onChange={(e) => setWorksheetData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter *
                  </label>
                  <select
                    value={worksheetData.chapter}
                    onChange={(e) => setWorksheetData(prev => ({ ...prev, chapter: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map(chapter => (
                      <option key={chapter} value={chapter}>{chapter}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson
                  </label>
                  <select
                    value={worksheetData.lesson}
                    onChange={(e) => setWorksheetData(prev => ({ ...prev, lesson: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Topic/Concept
                </label>
                <input
                  type="text"
                  value={worksheetData.topic}
                  onChange={(e) => setWorksheetData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Solving linear equations, Photosynthesis process"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>

              {/* Worksheet Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Worksheet Type
                  </label>
                  <select
                    value={worksheetData.worksheetType}
                    onChange={(e) => setWorksheetData(prev => ({ ...prev, worksheetType: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {worksheetTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {worksheetTypes.find(t => t.value === worksheetData.worksheetType)?.description}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={worksheetData.difficultyLevel}
                    onChange={(e) => setWorksheetData(prev => ({ ...prev, difficultyLevel: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {difficultyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions: {worksheetData.questionCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={worksheetData.questionCount}
                  onChange={(e) => setWorksheetData(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Types
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {worksheetData.questionTypes.map(type => (
                    <span
                      key={type}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                    >
                      <span>{type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                      {worksheetData.questionTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestionType(type)}
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
                      addQuestionType(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="">Add question type...</option>
                  {questionTypes.filter(type => !worksheetData.questionTypes.includes(type)).map(type => (
                    <option key={type} value={type}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="answerKey"
                    checked={worksheetData.includeAnswerKey}
                    onChange={(e) => setWorksheetData(prev => ({ ...prev, includeAnswerKey: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="answerKey" className="text-sm font-medium text-gray-700">
                    Include Answer Key
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="instructions"
                    checked={worksheetData.includeInstructions}
                    onChange={(e) => setWorksheetData(prev => ({ ...prev, includeInstructions: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="instructions" className="text-sm font-medium text-gray-700">
                    Include Instructions
                  </label>
                </div>
              </div>

              {/* Custom Instructions */}
              {worksheetData.includeInstructions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Instructions (Optional)
                  </label>
                  <textarea
                    value={worksheetData.customInstructions}
                    onChange={(e) => setWorksheetData(prev => ({ ...prev, customInstructions: e.target.value }))}
                    placeholder="Enter any specific instructions for students..."
                    className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !worksheetData.subject.trim() || !worksheetData.chapter.trim()}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-[1.02] transform"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Worksheet...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Worksheet</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetGenerator;