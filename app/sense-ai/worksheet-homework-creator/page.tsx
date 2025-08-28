'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
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
  BookMarked,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle,
  Calendar,
  Home
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HomeworkData {
  class: string;
  subject: string;
  chapter: string;
  lesson: string;
  topic: string;
  assignmentType: string;
  difficulty: string;
  estimatedTime: number;
  questionTypes: string[];
  totalQuestions: number;
  includeInstructions: boolean;
  includeAnswerKey: boolean;
  includeRubric: boolean;
  includeDueDate: boolean;
  dueDate: string;
  customInstructions: string;
  learningObjectives: string[];
  skillsFocus: string[];
}

const WorksheetHomeworkCreator: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [homeworkData, setHomeworkData] = useState<HomeworkData>({
    class: '',
    subject: '',
    chapter: '',
    lesson: '',
    topic: '',
    assignmentType: 'worksheet',
    difficulty: 'medium',
    estimatedTime: 30,
    questionTypes: ['multiple-choice'],
    totalQuestions: 10,
    includeInstructions: true,
    includeAnswerKey: true,
    includeRubric: false,
    includeDueDate: false,
    dueDate: '',
    customInstructions: '',
    learningObjectives: ['understand-concepts'],
    skillsFocus: ['problem-solving']
  });

  // Sample data for dropdowns
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Physics', 'Chemistry', 'Biology'];
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
  const lessons = ['Lesson 1.1', 'Lesson 1.2', 'Lesson 1.3', 'Lesson 2.1', 'Lesson 2.2'];

  const assignmentTypes = [
    { value: 'worksheet', label: 'Worksheet' },
    { value: 'homework', label: 'Homework Assignment' },
    { value: 'practice-set', label: 'Practice Set' },
    { value: 'review-sheet', label: 'Review Sheet' },
    { value: 'project', label: 'Project Assignment' },
    { value: 'research', label: 'Research Assignment' }
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700' }
  ];

  const questionTypeOptions = [
    'multiple-choice',
    'true-false',
    'fill-in-blanks',
    'short-answer',
    'long-answer',
    'matching',
    'diagram-labeling',
    'calculation-problems',
    'word-problems',
    'essay-questions'
  ];

  const learningObjectiveOptions = [
    'understand-concepts',
    'apply-knowledge',
    'analyze-information',
    'synthesize-ideas',
    'evaluate-solutions',
    'remember-facts',
    'develop-skills',
    'critical-thinking'
  ];

  const skillsFocusOptions = [
    'problem-solving',
    'analytical-thinking',
    'creative-writing',
    'mathematical-reasoning',
    'scientific-inquiry',
    'reading-comprehension',
    'communication-skills',
    'research-skills',
    'time-management',
    'collaboration'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkData.subject.trim() || !homeworkData.chapter.trim()) return;
    
    setIsLoading(true);
    try {
      // Generate sample homework content
      const homeworkContent = {
        ...homeworkData,
        generatedAssignment: {
          id: `assignment_${Date.now()}`,
          title: `${homeworkData.subject} - ${homeworkData.chapter} ${homeworkData.assignmentType.charAt(0).toUpperCase() + homeworkData.assignmentType.slice(1)}`,
          description: `${homeworkData.assignmentType.charAt(0).toUpperCase() + homeworkData.assignmentType.slice(1)} covering ${homeworkData.chapter}${homeworkData.topic ? ` - ${homeworkData.topic}` : ''}`,
          instructions: homeworkData.includeInstructions ? [
            'Read all questions carefully before answering',
            'Show your work for calculation problems',
            'Write answers clearly and legibly',
            'Complete all sections of the assignment',
            `Estimated completion time: ${homeworkData.estimatedTime} minutes`
          ] : [],
          questions: Array.from({ length: homeworkData.totalQuestions }, (_, index) => {
            const questionType = homeworkData.questionTypes[Math.floor(Math.random() * homeworkData.questionTypes.length)];
            
            return {
              id: `q_${index + 1}`,
              type: questionType,
              difficulty: homeworkData.difficulty,
              question: `Sample ${homeworkData.difficulty} ${questionType.replace('-', ' ')} question ${index + 1} for ${homeworkData.chapter}`,
              options: questionType === 'multiple-choice' ? [
                'Option A',
                'Option B',
                'Option C',
                'Option D'
              ] : questionType === 'true-false' ? ['True', 'False'] : [],
              correctAnswer: questionType === 'multiple-choice' ? 'Option A' : questionType === 'true-false' ? 'True' : 'Sample correct answer',
              explanation: 'Detailed explanation for this question',
              points: homeworkData.difficulty === 'easy' ? 2 : homeworkData.difficulty === 'medium' ? 3 : 5,
              learningObjective: homeworkData.learningObjectives[Math.floor(Math.random() * homeworkData.learningObjectives.length)]
            };
          }),
          answerKey: homeworkData.includeAnswerKey ? {
            included: true,
            format: 'separate-sheet',
            showExplanations: true
          } : { included: false },
          rubric: homeworkData.includeRubric ? {
            criteria: [
              { aspect: 'Accuracy', points: 40, description: 'Correctness of answers' },
              { aspect: 'Completeness', points: 30, description: 'All questions attempted' },
              { aspect: 'Work Shown', points: 20, description: 'Clear working/reasoning' },
              { aspect: 'Presentation', points: 10, description: 'Neat and organized' }
            ],
            totalPoints: 100
          } : null,
          dueDate: homeworkData.includeDueDate ? homeworkData.dueDate : null,
          learningObjectives: homeworkData.learningObjectives,
          skillsFocus: homeworkData.skillsFocus,
          estimatedTime: homeworkData.estimatedTime
        },
        analytics: {
          totalPoints: homeworkData.totalQuestions * (homeworkData.difficulty === 'easy' ? 2 : homeworkData.difficulty === 'medium' ? 3 : 5),
          questionBreakdown: homeworkData.questionTypes.reduce((acc, type) => {
            acc[type] = Math.floor(homeworkData.totalQuestions / homeworkData.questionTypes.length);
            return acc;
          }, {} as Record<string, number>),
          difficultyLevel: homeworkData.difficulty,
          estimatedCompletionTime: `${homeworkData.estimatedTime} minutes`
        },
        generatedAt: new Date().toISOString(),
        exportFormats: ['PDF', 'Word', 'Google Docs', 'Print-Ready']
      };
      
      // Store homework data in localStorage
      localStorage.setItem('generatedHomework', JSON.stringify(homeworkContent));
      
      // Redirect to results page
      router.push('/sense-ai/homework-results');
    } catch (error) {
      console.error('Error generating homework:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = (category: keyof HomeworkData, item: string) => {
    const currentItems = homeworkData[category] as string[];
    if (!currentItems.includes(item)) {
      setHomeworkData(prev => ({
        ...prev,
        [category]: [...currentItems, item]
      }));
    }
  };

  const removeItem = (category: keyof HomeworkData, item: string) => {
    const currentItems = homeworkData[category] as string[];
    if (currentItems.length > 1) {
      setHomeworkData(prev => ({
        ...prev,
        [category]: currentItems.filter(i => i !== item)
      }));
    }
  };

  const renderTagSection = (title: string, category: keyof HomeworkData, options: string[], colorClass: string) => {
    const items = homeworkData[category] as string[];
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
    <div className="min-h-screen relative overflow-hidden text-gray-900 bg-white">
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
              <h1 className="text-3xl font-bold text-gray-900">Worksheet & Homework Creator</h1>
              <p className="text-gray-600 mt-1">Generate custom worksheets and homework assignments</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/sense-ai/homework-preview')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Sample</span>
            </button>
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
              <FileText className="w-8 h-8 text-white" />
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
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Assignment Configuration</h2>
                <p className="text-gray-600 text-sm">Create custom worksheets and homework assignments for your students</p>
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
                    value={homeworkData.class}
                    onChange={(e) => setHomeworkData(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-lg"
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
                    value={homeworkData.subject}
                    onChange={(e) => setHomeworkData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-cyan-50 border border-cyan-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 hover:shadow-lg"
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
                    value={homeworkData.chapter}
                    onChange={(e) => setHomeworkData(prev => ({ ...prev, chapter: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-indigo-50 border border-indigo-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:shadow-lg"
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
                    Assignment Type
                  </label>
                  <select
                    value={homeworkData.assignmentType}
                    onChange={(e) => setHomeworkData(prev => ({ ...prev, assignmentType: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-purple-50 border border-purple-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:shadow-lg"
                  >
                    {assignmentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Specific Topic/Concept
                </label>
                <input
                  type="text"
                  value={homeworkData.topic}
                  onChange={(e) => setHomeworkData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Quadratic Equations, Photosynthesis, Essay Writing"
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-sky-50 border border-sky-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 hover:shadow-lg"
                />
              </div>

              {/* Difficulty and Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <div className="flex space-x-2">
                    {difficultyLevels.map(level => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setHomeworkData(prev => ({ ...prev, difficulty: level.value }))}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          homeworkData.difficulty === level.value
                            ? level.color + ' ring-2 ring-offset-1 ring-current'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Questions: {homeworkData.totalQuestions}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={homeworkData.totalQuestions}
                    onChange={(e) => setHomeworkData(prev => ({ ...prev, totalQuestions: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5</span>
                    <span>30</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Time: {homeworkData.estimatedTime} min
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    value={homeworkData.estimatedTime}
                    onChange={(e) => setHomeworkData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>15 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>

              {/* Question Types */}
              {renderTagSection('Question Types', 'questionTypes', questionTypeOptions, 'bg-blue-100 text-blue-700')}

              {/* Learning Objectives */}
              {renderTagSection('Learning Objectives', 'learningObjectives', learningObjectiveOptions, 'bg-purple-100 text-purple-700')}

              {/* Skills Focus */}
              {renderTagSection('Skills Focus', 'skillsFocus', skillsFocusOptions, 'bg-indigo-100 text-indigo-700')}

              {/* Assignment Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Include Features
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="instructions"
                      checked={homeworkData.includeInstructions}
                      onChange={(e) => setHomeworkData(prev => ({ ...prev, includeInstructions: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <label htmlFor="instructions" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <BookMarked className="w-4 h-4" />
                      <span>Instructions</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="answerKey"
                      checked={homeworkData.includeAnswerKey}
                      onChange={(e) => setHomeworkData(prev => ({ ...prev, includeAnswerKey: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <label htmlFor="answerKey" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>Answer Key</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="rubric"
                      checked={homeworkData.includeRubric}
                      onChange={(e) => setHomeworkData(prev => ({ ...prev, includeRubric: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <label htmlFor="rubric" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <BarChart3 className="w-4 h-4" />
                      <span>Grading Rubric</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="dueDate"
                      checked={homeworkData.includeDueDate}
                      onChange={(e) => setHomeworkData(prev => ({ ...prev, includeDueDate: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <label htmlFor="dueDate" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>Due Date</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Due Date */}
              {homeworkData.includeDueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={homeworkData.dueDate}
                    onChange={(e) => setHomeworkData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Custom Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={homeworkData.customInstructions}
                  onChange={(e) => setHomeworkData(prev => ({ ...prev, customInstructions: e.target.value }))}
                  placeholder="Enter any specific instructions or requirements for the assignment..."
                  className="w-full h-24 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-lg resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !homeworkData.subject.trim() || !homeworkData.chapter.trim()}
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
                    <span>Creating Assignment...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Generate {homeworkData.assignmentType.charAt(0).toUpperCase() + homeworkData.assignmentType.slice(1)}</span>
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

export default WorksheetHomeworkCreator;