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
  Tag,
  FileText,
  Settings,
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuestionAnalysisData {
  question: string;
  class: string;
  subject: string;
  chapter: string;
  lesson: string;
  questionType: string;
}

interface QuestionGenerationData {
  class: string;
  subject: string;
  chapter: string;
  lesson: string;
  topic: string;
  easyQuestions: number;
  easyRemember: number;
  easyUnderstand: number;
  mediumQuestions: number;
  mediumApply: number;
  mediumAnalyze: number;
  hardQuestions: number;
  hardEvaluate: number;
  hardCreate: number;
  questionTypes: string[];
}

const QuestionBankTagger: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate'>('analyze');
  const [isLoading, setIsLoading] = useState(false);
  
  // Question Analysis Form State
  const [analysisData, setAnalysisData] = useState<QuestionAnalysisData>({
    question: '',
    class: '',
    subject: '',
    chapter: '',
    lesson: '',
    questionType: 'multiple-choice'
  });
  
  // Question Generation Form State
  const [generationData, setGenerationData] = useState<QuestionGenerationData>({
    class: '',
    subject: '',
    chapter: '',
    lesson: '',
    topic: '',
    easyQuestions: 0,
    easyRemember: 0,
    easyUnderstand: 0,
    mediumQuestions: 0,
    mediumApply: 0,
    mediumAnalyze: 0,
    hardQuestions: 0,
    hardEvaluate: 0,
    hardCreate: 0,
    questionTypes: ['multiple-choice']
  });

  // Sample data for dropdowns
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Physics', 'Chemistry', 'Biology'];
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
  const lessons = ['Lesson 1.1', 'Lesson 1.2', 'Lesson 1.3', 'Lesson 2.1', 'Lesson 2.2'];

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'hard', label: 'Hard', color: 'text-red-400' }
  ];

  const bloomLevels = [
    { value: 'remember', label: 'Remember', description: 'Recall facts and basic concepts' },
    { value: 'understand', label: 'Understand', description: 'Explain ideas or concepts' },
    { value: 'apply', label: 'Apply', description: 'Use information in new situations' },
    { value: 'analyze', label: 'Analyze', description: 'Draw connections among ideas' },
    { value: 'evaluate', label: 'Evaluate', description: 'Justify a stand or decision' },
    { value: 'create', label: 'Create', description: 'Produce new or original work' }
  ];

  const questionTypes = [
    'multiple-choice',
    'true-false',
    'short-answer',
    'essay',
    'fill-in-the-blank',
    'matching'
  ];

  const handleAnalysisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisData.question.trim()) return;
    
    setIsLoading(true);
    try {
      // Store analysis data in localStorage
      const analysisResult = {
        ...analysisData,
        generatedTags: ['concept-based', 'analytical', 'medium-difficulty'],
        difficulty: 'medium',
        bloomsLevel: 'analyze',
        estimatedTime: '3-5 minutes',
        timestamp: new Date().toISOString(),
        type: 'analysis'
      };
      localStorage.setItem('questionAnalysis', JSON.stringify(analysisResult));
      
      // Redirect to results page
      router.push('/senseai/question-bank-results?mode=analysis');
    } catch (error) {
      console.error('Error analyzing question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generationData.subject.trim() || !generationData.chapter.trim()) return;
    
    const totalQuestions = generationData.easyQuestions + generationData.mediumQuestions + generationData.hardQuestions;
    if (totalQuestions === 0) return;
    
    setIsLoading(true);
    try {
      // Generate sample questions based on the configuration
      const generatedQuestions = Array.from({ length: totalQuestions }, (_, i) => {
        let difficulty = 'easy';
        let bloomsLevel = 'remember';
        
        if (i < generationData.easyQuestions) {
          difficulty = 'easy';
          bloomsLevel = i < generationData.easyRemember ? 'remember' : 'understand';
        } else if (i < generationData.easyQuestions + generationData.mediumQuestions) {
          difficulty = 'medium';
          bloomsLevel = (i - generationData.easyQuestions) < generationData.mediumApply ? 'apply' : 'analyze';
        } else {
          difficulty = 'hard';
          bloomsLevel = (i - generationData.easyQuestions - generationData.mediumQuestions) < generationData.hardEvaluate ? 'evaluate' : 'create';
        }
        
        return {
          id: i + 1,
          question: `Sample ${difficulty} question ${i + 1} about ${generationData.topic} (${bloomsLevel} level)`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          explanation: `This question tests ${bloomsLevel} level understanding of ${generationData.topic}.`,
          tags: ['auto-generated', difficulty, bloomsLevel],
          difficulty,
          bloomsLevel,
          estimatedTime: difficulty === 'easy' ? '2-3 minutes' : difficulty === 'medium' ? '3-5 minutes' : '5-8 minutes'
        };
      });
      
      // Store generation data in localStorage
      const generationResult = {
        ...generationData,
        totalQuestions,
        generatedQuestions,
        timestamp: new Date().toISOString(),
        type: 'generation'
      };
      localStorage.setItem('questionGeneration', JSON.stringify(generationResult));
      
      // Redirect to results page
      router.push('/senseai/question-bank-results?mode=generation');
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update totals when individual counts change
  React.useEffect(() => {
    setGenerationData(prev => ({
      ...prev,
      easyQuestions: prev.easyRemember + prev.easyUnderstand
    }));
  }, [generationData.easyRemember, generationData.easyUnderstand]);

  React.useEffect(() => {
    setGenerationData(prev => ({
      ...prev,
      mediumQuestions: prev.mediumApply + prev.mediumAnalyze
    }));
  }, [generationData.mediumApply, generationData.mediumAnalyze]);

  React.useEffect(() => {
    setGenerationData(prev => ({
      ...prev,
      hardQuestions: prev.hardEvaluate + prev.hardCreate
    }));
  }, [generationData.hardEvaluate, generationData.hardCreate]);

  const addQuestionType = (type: string) => {
    if (!generationData.questionTypes.includes(type)) {
      setGenerationData(prev => ({
        ...prev,
        questionTypes: [...prev.questionTypes, type]
      }));
    }
  };

  const removeQuestionType = (type: string) => {
    setGenerationData(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.filter(t => t !== type)
    }));
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-indigo-300/15 to-pink-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-80 h-80 bg-gradient-to-r from-cyan-300/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-gradient-to-r from-purple-300/15 to-indigo-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-200/10 to-indigo-200/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
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
              onClick={() => router.push('/senseai')}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm"
            >
              <ArrowRight className="w-5 h-5 rotate-180 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Question Bank Tagger</h1>
              <p className="text-gray-600 mt-1">Analyze questions or generate tagged question sets</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
            <Target className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex space-x-1 p-1 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 mb-8 max-w-md shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'analyze'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Analyze Question</span>
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'generate'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Generate Questions</span>
          </button>
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'analyze' ? (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-8 shadow-lg ring-2 ring-blue-500/30 shadow-blue-500/20"
                style={{
                  boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.25), 0 10px 20px -5px rgba(59, 130, 246, 0.15), 0 0 0 2px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Tag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Question Analysis</h2>
                  <p className="text-gray-600 text-sm">Enter a question to generate tags and metadata</p>
                </div>
              </div>

              <form onSubmit={handleAnalysisSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={analysisData.question}
                    onChange={(e) => setAnalysisData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter the question you want to analyze..."
                    className="w-full h-32 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Class
                     </label>
                     <select
                       value={analysisData.class}
                       onChange={(e) => setAnalysisData(prev => ({ ...prev, class: e.target.value }))}
                       className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     >
                       <option value="">Select Class</option>
                       {classes.map(cls => (
                         <option key={cls} value={cls}>{cls}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Subject
                     </label>
                     <select
                       value={analysisData.subject}
                       onChange={(e) => setAnalysisData(prev => ({ ...prev, subject: e.target.value }))}
                       className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     >
                       <option value="">Select Subject</option>
                       {subjects.map(subject => (
                         <option key={subject} value={subject}>{subject}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Chapter
                     </label>
                     <select
                       value={analysisData.chapter}
                       onChange={(e) => setAnalysisData(prev => ({ ...prev, chapter: e.target.value }))}
                       className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                       value={analysisData.lesson}
                       onChange={(e) => setAnalysisData(prev => ({ ...prev, lesson: e.target.value }))}
                       className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     >
                       <option value="">Select Lesson</option>
                       {lessons.map(lesson => (
                         <option key={lesson} value={lesson}>{lesson}</option>
                       ))}
                     </select>
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Question Type
                   </label>
                   <select
                     value={analysisData.questionType}
                     onChange={(e) => setAnalysisData(prev => ({ ...prev, questionType: e.target.value }))}
                     className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     {questionTypes.map(type => (
                       <option key={type} value={type}>
                         {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                       </option>
                     ))}
                   </select>
                 </div>

                <button
                  type="submit"
                  disabled={isLoading || !analysisData.question.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing Question...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Analyze Question</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="generate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-8 shadow-lg ring-2 ring-blue-500/30 shadow-blue-500/20"
                style={{
                  boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.25), 0 10px 20px -5px rgba(59, 130, 246, 0.15), 0 0 0 2px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Question Generation</h2>
                  <p className="text-gray-600 text-sm">Generate tagged questions based on topic and requirements</p>
                </div>
              </div>

              <form onSubmit={handleGenerationSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class *
                    </label>
                    <select
                      value={generationData.class}
                      onChange={(e) => setGenerationData(prev => ({ ...prev, class: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={generationData.subject}
                      onChange={(e) => setGenerationData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={generationData.chapter}
                      onChange={(e) => setGenerationData(prev => ({ ...prev, chapter: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={generationData.lesson}
                      onChange={(e) => setGenerationData(prev => ({ ...prev, lesson: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Lesson</option>
                      {lessons.map(lesson => (
                        <option key={lesson} value={lesson}>{lesson}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic/Concept
                  </label>
                  <input
                    type="text"
                    value={generationData.topic}
                    onChange={(e) => setGenerationData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Solving linear equations in one variable"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Difficulty and Bloom's Taxonomy Configuration */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Configuration</h3>
                  
                  {/* Easy Questions */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 className="text-green-600 font-medium mb-3">Easy Questions (Total: {generationData.easyQuestions})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remember Level
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={generationData.easyRemember}
                          onChange={(e) => setGenerationData(prev => ({ ...prev, easyRemember: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Understand Level
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={generationData.easyUnderstand}
                          onChange={(e) => setGenerationData(prev => ({ ...prev, easyUnderstand: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medium Questions */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="text-yellow-600 font-medium mb-3">Medium Questions (Total: {generationData.mediumQuestions})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apply Level
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={generationData.mediumApply}
                          onChange={(e) => setGenerationData(prev => ({ ...prev, mediumApply: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Analyze Level
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={generationData.mediumAnalyze}
                          onChange={(e) => setGenerationData(prev => ({ ...prev, mediumAnalyze: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hard Questions */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h4 className="text-red-600 font-medium mb-3">Hard Questions (Total: {generationData.hardQuestions})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Evaluate Level
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={generationData.hardEvaluate}
                          onChange={(e) => setGenerationData(prev => ({ ...prev, hardEvaluate: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Create Level
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={generationData.hardCreate}
                          onChange={(e) => setGenerationData(prev => ({ ...prev, hardCreate: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-center">
                      <span className="text-blue-600 font-medium text-lg">
                        Total Questions: {generationData.easyQuestions + generationData.mediumQuestions + generationData.hardQuestions}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Types
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {generationData.questionTypes.map(type => (
                      <span
                        key={type}
                        className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                      >
                        <span>{type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                        <button
                          type="button"
                          onClick={() => removeQuestionType(type)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
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
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Add question type...</option>
                    {questionTypes.filter(type => !generationData.questionTypes.includes(type)).map(type => (
                      <option key={type} value={type}>
                        {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !generationData.subject.trim() || !generationData.chapter.trim() || (generationData.easyQuestions + generationData.mediumQuestions + generationData.hardQuestions) === 0}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Questions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Questions</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBankTagger;