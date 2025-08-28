'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  ArrowRight, 
  Download, 
  Share2, 
  Tag, 
  Brain, 
  BookOpen, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Star,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface QuestionData {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  difficulty: string;
  bloomLevel: string;
  tags: string[];
  subject: string;
  chapter: string;
  topic?: string;
  cognitiveLevel: string;
  learningObjective: string;
  estimatedTime: string;
}

interface ResultData {
  type: 'analysis' | 'generation';
  timestamp: string;
  subject: string;
  chapter: string;
  topic?: string;
  difficulty?: string;
  bloomLevel?: string;
  questionCount?: number;
  questionTypes?: string[];
  question?: string;
  questionType?: string;
}

const QuestionBankResults: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'analysis';
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Load data from localStorage based on mode
    const storageKey = mode === 'analysis' ? 'questionAnalysis' : 'questionGeneration';
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      const data = JSON.parse(storedData);
      setResultData(data);
      
      // Generate mock questions based on the data
      if (mode === 'analysis') {
        // For analysis, generate tags and metadata for the single question
        const analyzedQuestion: QuestionData = {
          id: '1',
          question: data.question,
          difficulty: 'medium',
          bloomLevel: 'understand',
          tags: data.generatedTags || ['algebra', 'equations', 'problem-solving', 'mathematics'],
          subject: data.subject || 'Mathematics',
          chapter: data.chapter || 'Linear Equations',
          topic: data.lesson || 'Solving equations',
          cognitiveLevel: data.cognitiveLevel || 'Application',
          learningObjective: data.learningObjective || 'Students will be able to solve linear equations using algebraic methods',
          estimatedTime: data.estimatedTime || '3-5 minutes'
        };
        setQuestions([analyzedQuestion]);
      } else {
        // For generation, use the generated questions from the data
        const generatedQuestions: QuestionData[] = data.generatedQuestions?.map((q: any) => ({
          id: q.id.toString(),
          question: q.question,
          options: q.options?.length > 0 ? q.options : undefined,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty || 'medium',
          bloomLevel: q.bloomsLevel || 'understand',
          tags: q.tags || generateTags(data.subject, data.chapter, data.topic),
          subject: data.subject,
          chapter: data.chapter,
          topic: data.topic,
          cognitiveLevel: getCognitiveLevel(q.bloomsLevel || 'understand'),
          learningObjective: `Students will be able to ${getObjective(q.bloomsLevel || 'understand', data.topic || data.chapter)}`,
          estimatedTime: q.estimatedTime || getEstimatedTime(q.difficulty || 'medium')
        })) || [];
        setQuestions(generatedQuestions);
      }
    } else {
      router.push('/senseai/question-bank-tagger');
    }
    setIsLoading(false);
  }, [router, mode]);

  const getQuestionText = (index: number, subject: string, chapter: string) => {
    const templates = [
      `What is the main concept in ${chapter}?`,
      `How would you apply ${chapter} principles to solve real-world problems?`,
      `Analyze the relationship between different elements in ${chapter}.`,
      `Compare and contrast the methods used in ${chapter}.`,
      `Evaluate the effectiveness of ${chapter} techniques.`
    ];
    return templates[index % templates.length];
  };

  const generateTags = (subject: string, chapter: string, topic?: string) => {
    const baseTags = [subject.toLowerCase(), chapter.toLowerCase().replace(/\s+/g, '-')];
    if (topic) baseTags.push(topic.toLowerCase().replace(/\s+/g, '-'));
    baseTags.push('ncert', 'curriculum-aligned');
    return baseTags;
  };

  const getCognitiveLevel = (bloomLevel: string) => {
    const mapping: { [key: string]: string } = {
      'remember': 'Knowledge',
      'understand': 'Comprehension',
      'apply': 'Application',
      'analyze': 'Analysis',
      'evaluate': 'Evaluation',
      'create': 'Synthesis'
    };
    return mapping[bloomLevel] || 'Comprehension';
  };

  const getObjective = (bloomLevel: string, topic: string) => {
    const verbs: { [key: string]: string } = {
      'remember': 'recall and identify',
      'understand': 'explain and describe',
      'apply': 'use and implement',
      'analyze': 'examine and compare',
      'evaluate': 'assess and critique',
      'create': 'design and construct'
    };
    return `${verbs[bloomLevel] || 'understand'} concepts related to ${topic}`;
  };

  const getEstimatedTime = (difficulty: string) => {
    const times: { [key: string]: string } = {
      'easy': '2-3 minutes',
      'medium': '3-5 minutes',
      'hard': '5-8 minutes'
    };
    return times[difficulty] || '3-5 minutes';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      'easy': 'text-green-700 bg-green-100',
      'medium': 'text-yellow-700 bg-yellow-100',
      'hard': 'text-red-700 bg-red-100'
    };
    return colors[difficulty] || 'text-yellow-700 bg-yellow-100';
  };

  const getBloomColor = (bloomLevel: string) => {
    const colors: { [key: string]: string } = {
      'remember': 'text-blue-700 bg-blue-100',
      'understand': 'text-cyan-700 bg-cyan-100',
      'apply': 'text-green-700 bg-green-100',
      'analyze': 'text-yellow-700 bg-yellow-100',
      'evaluate': 'text-orange-700 bg-orange-100',
      'create': 'text-purple-700 bg-purple-100'
    };
    return colors[bloomLevel] || 'text-cyan-700 bg-cyan-100';
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadResults = () => {
    const content = questions.map(q => `
Question: ${q.question}
${q.options ? q.options.join('\n') + '\n' : ''}Difficulty: ${q.difficulty}
Bloom's Level: ${q.bloomLevel}
Tags: ${q.tags.join(', ')}
Learning Objective: ${q.learningObjective}
Estimated Time: ${q.estimatedTime}
${'='.repeat(50)}`).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question-bank-${resultData?.type}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
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
              onClick={() => router.push('/senseai/question-bank-tagger')}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white transition-all duration-300 shadow-sm"
            >
              <ArrowRight className="w-5 h-5 rotate-180 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === 'analysis' ? 'Question Analysis Results' : 'Generated Questions'}
              </h1>
              <p className="text-gray-600 mt-1">
                {mode === 'analysis' 
                  ? 'AI-generated tags and metadata for your question'
                  : `${questions.length} questions generated for ${resultData?.subject} - ${resultData?.chapter}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadResults}
              className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white transition-all duration-300 shadow-sm"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700">Download</span>
            </button>
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        {resultData && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-gray-500 text-sm">Subject</p>
                  <p className="text-gray-900 font-medium">{resultData.subject}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-gray-500 text-sm">Chapter</p>
                  <p className="text-gray-900 font-medium">{resultData.chapter}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-gray-500 text-sm">Questions</p>
                  <p className="text-gray-900 font-medium">{questions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-gray-500 text-sm">Generated</p>
                  <p className="text-gray-900 font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Questions List */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Question {question.id}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getBloomColor(question.bloomLevel)}`}>
                        {question.bloomLevel.charAt(0).toUpperCase() + question.bloomLevel.slice(1)}
                      </span>
                      <span className="text-gray-500 text-xs flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{question.estimatedTime}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(question.question, question.id)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                  title="Copy question"
                >
                  {copiedId === question.id ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-900 text-lg mb-3">{question.question}</p>
                {question.options && (
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border ${
                          option === question.correctAnswer
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <span className="text-gray-900">{option}</span>
                        {option === question.correctAnswer && (
                          <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Objective</h4>
                  <p className="text-gray-600 text-sm">{question.learningObjective}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Cognitive Level</h4>
                  <p className="text-gray-600 text-sm">{question.cognitiveLevel}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          className="max-w-6xl mx-auto mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            onClick={() => router.push('/senseai/question-bank-tagger')}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg"
          >
            <Target className="w-5 h-5" />
            <span>Create More Questions</span>
          </button>
          <button
            onClick={() => router.push('/senseai')}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white text-gray-700 font-medium rounded-xl transition-all duration-300 shadow-sm"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            <span>Back to Dashboard</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuestionBankResults;