'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebaseClient';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { InlineMath } from 'react-katex';

import 'katex/dist/katex.min.css';
import { ArrowLeft, Printer, Download, Share2, Eye, BarChart3, Target, Brain, TrendingUp, AlertCircle, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface StudentAnswer {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer?: string;
  explanation?: string;
  isCorrect: boolean;
  questionType: string;
  subject?: string;
  answeredAt: Date;
}

interface QuestionDetails {
  id: string;
  questionText: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bloomTaxonomy: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  prerequisites: string[];
  explanation: string;
  solution: string;
  subject: string;
  topic: string;
  timeEstimate: number; // in minutes
  marks: number;
  learnObj: string;
}

interface PerformanceAnalysis {
  difficultyBreakdown: {
    easy: { correct: number; total: number; percentage: number };
    medium: { correct: number; total: number; percentage: number };
    hard: { correct: number; total: number; percentage: number };
  };
  bloomTaxonomyBreakdown: {
    remember: { correct: number; total: number; percentage: number };
    understand: { correct: number; total: number; percentage: number };
    apply: { correct: number; total: number; percentage: number };
    analyze: { correct: number; total: number; percentage: number };
    evaluate: { correct: number; total: number; percentage: number };
    create: { correct: number; total: number; percentage: number };
  };
  topicPerformance: { [topic: string]: { correct: number; total: number; percentage: number } };
  timeAnalysis: {
    averageTimePerQuestion: number;
    timeSpentOnCorrect: number;
    timeSpentOnIncorrect: number;
  };
  prerequisitesAnalysis: {
    mastered: string[];
    needsReview: string[];
    missing: string[];
  };
  learningObjectivesAnalysis: {
    mastered: string[];
    needsReview: string[];
    all: string[];
  };
}

interface TestResult {
  id: string;
  testId: string;
  testName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  subjectName?: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  percentageScore: number;
  grade: string;
  startTime: any;
  endTime: any;
  duration: number;
  status: 'completed' | 'abandoned';
  studentAnswers: StudentAnswer[];
  createdAt: any;
}

// Local helpers for consistent date/time rendering
function formatDate(value: any): string {
  if (!value) return '-';
  try {
    let d: Date;
    if (typeof value?.toDate === 'function') {
      d = value.toDate();
    } else if (value instanceof Date) {
      d = value;
    } else if (typeof value === 'number') {
      // Heuristic: treat > 1e12 as ms, otherwise seconds
      d = new Date(value > 1e12 ? value : value * 1000);
    } else if (typeof value === 'string') {
      d = new Date(value);
    } else {
      return '-';
    }
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  } catch {
    return 'Invalid date';
  }
}

function formatDuration(total: any): string {
  if (total == null) return '-';
  let n = Number(total);
  if (!isFinite(n)) return '-';
  // If likely milliseconds, convert to seconds
  if (n > 1_000_000) n = Math.round(n / 1000);
  const hours = Math.floor(n / 3600);
  const minutes = Math.floor((n % 3600) / 60);
  const seconds = Math.floor(n % 60);
  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes || hours) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

const TestResultDetailPage = () => {
  const params = useParams();
  const testResultId = params.testResultId as string;
  const { user, userRole } = useAuth();
  
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [questionDetails, setQuestionDetails] = useState<{ [key: string]: QuestionDetails }>({});
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'analysis' | 'recommendations'>('overview');

  // Calculate grade based on percentage
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  // Fetch detailed question information from question collection
  const fetchQuestionDetails = async (studentAnswers: StudentAnswer[]): Promise<{ [key: string]: QuestionDetails }> => {
    const details: { [key: string]: QuestionDetails } = {};
    
    console.log('Fetching question details for', studentAnswers.length, 'questions');
    console.log('Student answers:', studentAnswers.map(a => ({ id: a.questionId, text: a.questionText.substring(0, 50) + '...' })));
    
    for (const answer of studentAnswers) {
      try {
        console.log(`Attempting to fetch question with ID: ${answer.questionId}`);
        
        // Try to fetch from questionCollection first
        const questionDoc = await getDoc(doc(db, 'questionCollection', answer.questionId));
        
        if (questionDoc.exists()) {
          const questionData = questionDoc.data();
          
          // Debug: Log all available fields in the question data
          console.log('✅ Found question data for', answer.questionId, ':', {
            allFields: Object.keys(questionData),
            difficulty: questionData.difficulty,
            bloom: questionData.bloom,
            concept: questionData.concept,
            topic: questionData.topic,
            subject: questionData.subject,
            preReq: questionData.preReq,
            learnObj: questionData.learnObj,
            explanation: questionData.explanation ? 'exists' : 'missing',
            solution: questionData.solution ? 'exists' : 'missing'
          });
          
          // Map difficulty - try multiple possible field names
          let difficulty = 'medium';
          const difficultyField = questionData.difficulty || questionData.Difficulty || questionData.difficultyLevel;
          if (difficultyField) {
            difficulty = difficultyField.toLowerCase();
            console.log(`✅ Using difficulty: ${difficultyField} → ${difficulty}`);
          } else {
            console.log(`❌ No difficulty field found for question ${answer.questionId}. Available fields:`, Object.keys(questionData));
          }
          
          // Map Bloom's taxonomy - try multiple possible field names
          let bloomTaxonomy = 'understand';
          const bloomField = questionData.bloom || questionData.Bloom || questionData.bloomTaxonomy || questionData.taxonomy;
          if (bloomField) {
            bloomTaxonomy = bloomField.toLowerCase();
            console.log(`✅ Using bloom: ${bloomField} → ${bloomTaxonomy}`);
          } else {
            console.log(`❌ No bloom field found for question ${answer.questionId}. Available fields:`, Object.keys(questionData));
          }
          
          // Normalize Bloom's taxonomy values based on actual data
          const bloomMapping: { [key: string]: string } = {
            'remembering': 'remember',
            'understanding': 'understand',
            'applying': 'apply',
            'analyzing': 'analyze',
            'evaluating': 'evaluate',
            'creating': 'create'
          };
          
          if (bloomMapping[bloomTaxonomy]) {
            bloomTaxonomy = bloomMapping[bloomTaxonomy];
            console.log(`✅ Normalized bloom: ${bloomTaxonomy}`);
          }
          
          details[answer.questionId] = {
            id: answer.questionId,
            questionText: questionData.questionText || answer.questionText,
            difficulty: difficulty as 'easy' | 'medium' | 'hard',
            bloomTaxonomy: bloomTaxonomy as 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create',
            prerequisites: questionData.preReq ? [questionData.preReq] : (questionData.prerequisites || []),
            explanation: questionData.explanation || answer.explanation || '',
            solution: questionData.solution || '',
            subject: questionData.concept || questionData.subject || questionData.topic || answer.subject || 'Unknown',
            topic: questionData.concept || questionData.topic || questionData.subject || 'General',
            timeEstimate: questionData.timeEstimate || 2,
            marks: questionData.marks || 1,
            learnObj: questionData.learnObj || ''
          };
          
          console.log(`✅ Processed question ${answer.questionId}:`, {
            difficulty: details[answer.questionId].difficulty,
            bloomTaxonomy: details[answer.questionId].bloomTaxonomy,
            subject: details[answer.questionId].subject,
            topic: details[answer.questionId].topic
          });
        } else {
          console.log(`❌ Question document not found for ID: ${answer.questionId} in questionCollection`);
          
          // Try to fetch from questions collection as fallback
          try {
            const fallbackQuestionDoc = await getDoc(doc(db, 'questions', answer.questionId));
            if (fallbackQuestionDoc.exists()) {
              const fallbackQuestionData = fallbackQuestionDoc.data();
              console.log('✅ Found question in questions collection:', {
                allFields: Object.keys(fallbackQuestionData),
                difficulty: fallbackQuestionData.difficulty,
                bloom: fallbackQuestionData.bloom,
                concept: fallbackQuestionData.concept,
                topic: fallbackQuestionData.topic,
                subject: fallbackQuestionData.subject
              });
              
              // Map difficulty - try multiple possible field names
              let difficulty = 'medium';
              const difficultyField = fallbackQuestionData.difficulty || fallbackQuestionData.Difficulty || fallbackQuestionData.difficultyLevel;
              if (difficultyField) {
                difficulty = difficultyField.toLowerCase();
                console.log(`✅ Using difficulty from questions collection: ${difficultyField} → ${difficulty}`);
              }
              
              // Map Bloom's taxonomy - try multiple possible field names
              let bloomTaxonomy = 'understand';
              const bloomField = fallbackQuestionData.bloom || fallbackQuestionData.Bloom || fallbackQuestionData.bloomTaxonomy || fallbackQuestionData.taxonomy;
              if (bloomField) {
                bloomTaxonomy = bloomField.toLowerCase();
                console.log(`✅ Using bloom from questions collection: ${bloomField} → ${bloomTaxonomy}`);
              }
              
              // Normalize Bloom's taxonomy values
              const bloomMapping: { [key: string]: string } = {
                'remembering': 'remember',
                'understanding': 'understand',
                'applying': 'apply',
                'analyzing': 'analyze',
                'evaluating': 'evaluate',
                'creating': 'create'
              };
              
              if (bloomMapping[bloomTaxonomy]) {
                bloomTaxonomy = bloomMapping[bloomTaxonomy];
                console.log(`✅ Normalized bloom from questions collection: ${bloomTaxonomy}`);
              }
              
              details[answer.questionId] = {
                id: answer.questionId,
                questionText: fallbackQuestionData.questionText || fallbackQuestionData.question || answer.questionText,
                difficulty: difficulty as 'easy' | 'medium' | 'hard',
                bloomTaxonomy: bloomTaxonomy as 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create',
                prerequisites: fallbackQuestionData.preReq ? [fallbackQuestionData.preReq] : (fallbackQuestionData.prerequisites || []),
                explanation: fallbackQuestionData.explanation || answer.explanation || '',
                solution: fallbackQuestionData.solution || '',
                subject: fallbackQuestionData.concept || fallbackQuestionData.subject || fallbackQuestionData.topic || answer.subject || 'Unknown',
                topic: fallbackQuestionData.concept || fallbackQuestionData.topic || fallbackQuestionData.subject || 'General',
                timeEstimate: fallbackQuestionData.timeEstimate || 2,
                marks: fallbackQuestionData.marks || 1,
                learnObj: fallbackQuestionData.learnObj || ''
              };
              
              console.log(`✅ Processed question ${answer.questionId} from questions collection:`, {
                difficulty: details[answer.questionId].difficulty,
                bloomTaxonomy: details[answer.questionId].bloomTaxonomy,
                subject: details[answer.questionId].subject,
                topic: details[answer.questionId].topic
              });
            } else {
              console.log(`❌ Question document not found in questions collection either for ID: ${answer.questionId}`);
              console.log('Available fields in student answer:', Object.keys(answer));
              console.log('Student answer data:', answer);
              
              // Fallback to student answer data
              details[answer.questionId] = {
                id: answer.questionId,
                questionText: answer.questionText,
                difficulty: 'medium',
                bloomTaxonomy: 'understand',
                prerequisites: [],
                explanation: answer.explanation || '',
                solution: '',
                subject: answer.subject || 'Unknown',
                topic: 'General',
                timeEstimate: 2,
                marks: 1,
                learnObj: ''
              };
            }
          } catch (fallbackError) {
            console.error(`❌ Error fetching from questions collection for ${answer.questionId}:`, fallbackError);
            // Fallback to student answer data
            details[answer.questionId] = {
              id: answer.questionId,
              questionText: answer.questionText,
              difficulty: 'medium',
              bloomTaxonomy: 'understand',
              prerequisites: [],
              explanation: answer.explanation || '',
              solution: '',
              subject: answer.subject || 'Unknown',
              topic: 'General',
              timeEstimate: 2,
              marks: 1,
              learnObj: ''
            };
          }
        }
      } catch (error) {
        console.error(`❌ Error fetching question details for ${answer.questionId}:`, error);
        // Fallback to student answer data
        details[answer.questionId] = {
          id: answer.questionId,
          questionText: answer.questionText,
          difficulty: 'medium',
          bloomTaxonomy: 'understand',
          prerequisites: [],
          explanation: answer.explanation || '',
          solution: '',
          subject: answer.subject || 'Unknown',
          topic: 'General',
          timeEstimate: 2,
          marks: 1,
          learnObj: ''
        };
      }
    }
    
    console.log('Final question details:', details);
    setQuestionDetails(details);
    return details;
  };

  // Generate comprehensive performance analysis
  const generatePerformanceAnalysis = (
    studentAnswers: StudentAnswer[],
    detailsMap: { [key: string]: QuestionDetails }
  ): PerformanceAnalysis => {
    const difficultyBreakdown = { easy: { correct: 0, total: 0, percentage: 0 }, medium: { correct: 0, total: 0, percentage: 0 }, hard: { correct: 0, total: 0, percentage: 0 } };
    const bloomBreakdown = { remember: { correct: 0, total: 0, percentage: 0 }, understand: { correct: 0, total: 0, percentage: 0 }, apply: { correct: 0, total: 0, percentage: 0 }, analyze: { correct: 0, total: 0, percentage: 0 }, evaluate: { correct: 0, total: 0, percentage: 0 }, create: { correct: 0, total: 0, percentage: 0 } };
    const topicPerformance: { [topic: string]: { correct: number; total: number; percentage: number } } = {};
    const prerequisites = new Set<string>();
    const masteredPrereqs = new Set<string>();
    const needsReviewPrereqs = new Set<string>();
    const learningObjectives = new Set<string>();
    const masteredLearningObjs = new Set<string>();
    const needsReviewLearningObjs = new Set<string>();

    // Debug: Log the question details to see what we're working with
    console.log('Question details for analysis:', detailsMap);

    studentAnswers.forEach(answer => {
      const details = detailsMap[answer.questionId];
      if (details) {
        console.log(`Processing question ${answer.questionId}:`, {
          difficulty: details.difficulty,
          bloomTaxonomy: details.bloomTaxonomy,
          isCorrect: answer.isCorrect
        });

        // Difficulty analysis
        const difficulty = details.difficulty as keyof typeof difficultyBreakdown;
        difficultyBreakdown[difficulty].total++;
        if (answer.isCorrect) difficultyBreakdown[difficulty].correct++;

        // Bloom's taxonomy analysis
        const bloom = details.bloomTaxonomy as keyof typeof bloomBreakdown;
        bloomBreakdown[bloom].total++;
        if (answer.isCorrect) bloomBreakdown[bloom].correct++;

        // Topic performance
        const topic = details.topic;
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { correct: 0, total: 0, percentage: 0 };
        }
        topicPerformance[topic].total++;
        if (answer.isCorrect) topicPerformance[topic].correct++;

        // Prerequisites analysis - only use real data
        if (details.prerequisites && details.prerequisites.length > 0) {
          details.prerequisites.forEach(prereq => {
            if (prereq && prereq.trim()) {
              prerequisites.add(prereq.trim());
              if (answer.isCorrect) {
                masteredPrereqs.add(prereq.trim());
              } else {
                needsReviewPrereqs.add(prereq.trim());
              }
            }
          });
        }

        // Learning objectives analysis - only use real data
        if (details.learnObj && details.learnObj.trim()) {
          learningObjectives.add(details.learnObj.trim());
          if (answer.isCorrect) {
            masteredLearningObjs.add(details.learnObj.trim());
          } else {
            needsReviewLearningObjs.add(details.learnObj.trim());
          }
        }
      }
    });

    // Calculate percentages
    Object.keys(difficultyBreakdown).forEach(difficulty => {
      const key = difficulty as keyof typeof difficultyBreakdown;
      if (difficultyBreakdown[key].total > 0) {
        difficultyBreakdown[key].percentage = (difficultyBreakdown[key].correct / difficultyBreakdown[key].total) * 100;
      }
    });

    Object.keys(bloomBreakdown).forEach(bloom => {
      const key = bloom as keyof typeof bloomBreakdown;
      if (bloomBreakdown[key].total > 0) {
        bloomBreakdown[key].percentage = (bloomBreakdown[key].correct / bloomBreakdown[key].total) * 100;
      }
    });

    Object.keys(topicPerformance).forEach(topic => {
      if (topicPerformance[topic].total > 0) {
        topicPerformance[topic].percentage = (topicPerformance[topic].correct / topicPerformance[topic].total) * 100;
      }
    });

    console.log('Final analysis:', {
      difficultyBreakdown,
      bloomBreakdown,
      topicPerformance
    });

    return {
      difficultyBreakdown,
      bloomTaxonomyBreakdown: bloomBreakdown,
      topicPerformance,
      timeAnalysis: {
        averageTimePerQuestion: testResult?.duration ? testResult.duration / studentAnswers.length : 0,
        timeSpentOnCorrect: 0, // Would need actual time tracking
        timeSpentOnIncorrect: 0 // Would need actual time tracking
      },
      prerequisitesAnalysis: {
        mastered: Array.from(masteredPrereqs),
        needsReview: Array.from(needsReviewPrereqs),
        missing: Array.from(prerequisites).filter(prereq => !masteredPrereqs.has(prereq) && !needsReviewPrereqs.has(prereq))
      },
      learningObjectivesAnalysis: {
        mastered: Array.from(masteredLearningObjs),
        needsReview: Array.from(needsReviewLearningObjs),
        all: Array.from(learningObjectives)
      }
    };
  };

  useEffect(() => {
    const fetchTestResult = async () => {
      if (!testResultId || !user) {
        setError('Missing test result ID or user');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const testResultDoc = await getDoc(doc(db, 'testResults', testResultId));
        
        if (!testResultDoc.exists()) {
          setError('Test result not found');
          setLoading(false);
          return;
        }

        const data = testResultDoc.data() as TestResult;

        // Authorization: admins/teachers can view any; otherwise only the owner
        const isPrivileged = userRole === 'admin' || userRole === 'teacher';
        if (!isPrivileged && user?.uid && data.studentId !== user.uid) {
          setError('You are not authorized to view this test result');
          setLoading(false);
          return;
        }

        const testResultData = {
          ...data,
          id: testResultDoc.id
        };
        // Set the fetched result
        setTestResult(testResultData);

        // Fetch question details and generate analysis
        const answers = Array.isArray(testResultData.studentAnswers) ? testResultData.studentAnswers : [];
        let detailsForAnalysis: { [key: string]: QuestionDetails } = {};
        try {
          detailsForAnalysis = await fetchQuestionDetails(answers);
        } catch (e) {
          console.error('Error fetching question details:', e);
        }
        try {
          const analysis = generatePerformanceAnalysis(answers, detailsForAnalysis);
          setPerformanceAnalysis(analysis);
        } catch (e) {
          console.error('Error generating performance analysis:', e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTestResult();
  }, [testResultId, user, userRole]);

  // ...

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/assessment-dashboard">
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Test Result Not Found</h2>
          <p className="text-yellow-600 mb-4">The test result you're looking for doesn't exist.</p>
          <Link href="/assessment-dashboard">
            <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/assessment-dashboard">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Dashboard</span>
                </button>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.print()}
                className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{testResult.testName}</h1>
            <p className="text-gray-600 mb-6">{testResult.subjectName || 'Unknown Subject'}</p>
            
            {/* Score Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {testResult.percentageScore}%
              </div>
              <div className="text-xl text-gray-600 mb-2">
                Grade: {testResult.grade}
              </div>
              <div className="text-sm text-gray-500">
                Completed on {formatDate(testResult.createdAt)}
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{testResult.correctAnswers}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{testResult.incorrectAnswers}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{testResult.skippedQuestions}</div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{formatDuration(testResult.duration)}</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
            </div>

            {/* Test Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Started:</strong> {formatDate(testResult.startTime)}
              </div>
              <div>
                <strong>Completed:</strong> {formatDate(testResult.endTime)}
              </div>
              <div>
                <strong>Total Questions:</strong> {testResult.totalQuestions}
              </div>
              <div>
                <strong>Answered:</strong> {testResult.answeredQuestions}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'questions', label: 'Questions', icon: Eye },
              { id: 'analysis', label: 'Analysis', icon: BarChart3 },
              { id: 'recommendations', label: 'Recommendations', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab testResult={testResult} performanceAnalysis={performanceAnalysis} />
        )}

        {activeTab === 'questions' && (
          <QuestionsTab 
            testResult={testResult} 
            questionDetails={questionDetails}
            showExplanation={showExplanation}
            setShowExplanation={setShowExplanation}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisTab performanceAnalysis={performanceAnalysis} />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsTab performanceAnalysis={performanceAnalysis} />
        )}
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ testResult, performanceAnalysis }: { testResult: TestResult; performanceAnalysis: PerformanceAnalysis | null }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Performance */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90 mb-1">Overall Score</h3>
              <div className="text-3xl font-bold">{testResult.percentageScore}%</div>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90 mb-1">Accuracy</h3>
              <div className="text-3xl font-bold">
                {testResult.answeredQuestions > 0 ? Math.round((testResult.correctAnswers / testResult.answeredQuestions) * 100) : 0}%
              </div>
            </div>
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90 mb-1">Completion</h3>
              <div className="text-3xl font-bold">
                {testResult.totalQuestions > 0 ? Math.round((testResult.answeredQuestions / testResult.totalQuestions) * 100) : 0}%
              </div>
            </div>
            <Target className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>
    </div>

    {performanceAnalysis && (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Difficulty Performance - Only show involved levels */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Difficulty Performance</h3>
            {Object.entries(performanceAnalysis.difficultyBreakdown).filter(([_, stats]) => stats.total > 0).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(performanceAnalysis.difficultyBreakdown)
                  .filter(([_, stats]) => stats.total > 0)
                  .map(([difficulty, stats]) => (
                    <div key={difficulty} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="capitalize font-medium">{difficulty}</span>
                      <div className="text-right">
                        <div className="font-bold">{stats.percentage.toFixed(1)}%</div>
                        <div className="text-sm text-gray-500">{stats.correct}/{stats.total}</div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                <p>No difficulty data available for this test.</p>
              </div>
            )}
          </div>

          {/* Bloom's Taxonomy - Only show involved levels */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Cognitive Skills</h3>
            {Object.entries(performanceAnalysis.bloomTaxonomyBreakdown).filter(([_, stats]) => stats.total > 0).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(performanceAnalysis.bloomTaxonomyBreakdown)
                  .filter(([_, stats]) => stats.total > 0)
                  .map(([bloom, stats]) => (
                    <div key={bloom} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="capitalize font-medium">{bloom}</span>
                      <div className="text-right">
                        <div className="font-bold">{stats.percentage.toFixed(1)}%</div>
                        <div className="text-sm text-gray-500">{stats.correct}/{stats.total}</div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                <p>No cognitive skills data available for this test.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

const QuestionsTab = ({ 
  testResult, 
  questionDetails, 
  showExplanation, 
  setShowExplanation 
}: { 
  testResult: TestResult; 
  questionDetails: { [key: string]: QuestionDetails }; 
  showExplanation: { [key: string]: boolean }; 
  setShowExplanation: (value: { [key: string]: boolean }) => void;
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Question Analysis</h2>
      
      <div className="space-y-6">
        {testResult.studentAnswers.map((answer, index) => {
          const details = questionDetails[answer.questionId];
          return (
            <div key={answer.questionId} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Question {index + 1}
                  </h3>
                  {details && (
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        details.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        details.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {details.difficulty}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {details.bloomTaxonomy}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {answer.isCorrect ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Correct
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      ✗ Incorrect
                    </span>
                  )}
                </div>
              </div>

              {/* Question */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Question:</h4>
                <div className="text-gray-800 leading-relaxed">
                  {answer.questionText && answer.questionText.includes('$') ? (
                    <InlineMath math={answer.questionText.replace(/\$/g, '')} />
                  ) : (
                    answer.questionText
                  )}
                </div>
              </div>

              {/* Student Answer */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Your Answer:</h4>
                <div className={`p-3 rounded-lg ${
                  answer.isCorrect 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {answer.studentAnswer && answer.studentAnswer.includes('$') ? (
                    <InlineMath math={answer.studentAnswer.replace(/\$/g, '')} />
                  ) : (
                    answer.studentAnswer
                  )}
                </div>
              </div>

              {/* Correct Answer */}
              {!answer.isCorrect && answer.correctAnswer && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Correct Answer:</h4>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    {answer.correctAnswer && answer.correctAnswer.includes('$') ? (
                      <InlineMath math={answer.correctAnswer.replace(/\$/g, '')} />
                    ) : (
                      answer.correctAnswer
                    )}
                  </div>
                </div>
              )}

              {/* View Explanation Button */}
              <div className="mb-4">
                <button
                  onClick={() => setShowExplanation({ ...showExplanation, [answer.questionId]: !showExplanation[answer.questionId] })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Explanation & Solution</span>
                </button>
              </div>

              {/* Explanation (Collapsible) */}
              {showExplanation[answer.questionId] && (
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  {details?.explanation && details.explanation.trim() && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Explanation:</h4>
                      <div className="text-gray-700">
                        {details.explanation.includes('$') ? (
                          <InlineMath math={details.explanation.replace(/\$/g, '')} />
                        ) : (
                          details.explanation
                        )}
                      </div>
                    </div>
                  )}
                  
                  {details?.solution && details.solution.trim() && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Solution:</h4>
                      <div className="text-gray-700">
                        {details.solution.includes('$') ? (
                          <InlineMath math={details.solution.replace(/\$/g, '')} />
                        ) : (
                          details.solution
                        )}
                      </div>
                    </div>
                  )}

                  {details?.prerequisites && details.prerequisites.length > 0 && details.prerequisites.some(p => p && p.trim()) && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Prerequisites:</h4>
                      <div className="flex flex-wrap gap-2">
                        {details.prerequisites.filter(p => p && p.trim()).map((prereq, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {details?.learnObj && details.learnObj.trim() && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Learning Objective:</h4>
                      <div className="text-gray-700">
                        {details.learnObj}
                      </div>
                    </div>
                  )}

                  {(!details?.explanation || !details.explanation.trim()) && 
                   (!details?.solution || !details.solution.trim()) && 
                   (!details?.prerequisites || details.prerequisites.length === 0) && 
                   (!details?.learnObj || !details.learnObj.trim()) && (
                    <div className="text-gray-500 text-center py-4">
                      <p>No additional details available for this question.</p>
                      <p className="text-sm mt-1">The explanation and solution data may not be available in the question collection.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Question Details */}
              {details && (
                <div className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <strong>Topic:</strong> {details.topic}
                    </div>
                    <div>
                      <strong>Time Estimate:</strong> {details.timeEstimate} min
                    </div>
                    <div>
                      <strong>Marks:</strong> {details.marks}
                    </div>
                    <div>
                      <strong>Subject:</strong> {details.subject}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const AnalysisTab = ({ performanceAnalysis }: { performanceAnalysis: PerformanceAnalysis | null }) => {
  if (!performanceAnalysis) return <div>Loading analysis...</div>;

  // Only include levels that have questions
  const difficultyData = Object.entries(performanceAnalysis.difficultyBreakdown)
    .filter(([_, stats]) => stats.total > 0)
    .map(([difficulty, stats]) => ({
      name: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      percentage: stats.percentage,
      correct: stats.correct,
      total: stats.total
    }));

  const bloomData = Object.entries(performanceAnalysis.bloomTaxonomyBreakdown)
    .filter(([_, stats]) => stats.total > 0)
    .map(([bloom, stats]) => ({
      name: bloom.charAt(0).toUpperCase() + bloom.slice(1),
      percentage: stats.percentage,
      correct: stats.correct,
      total: stats.total
    }));

  const topicData = Object.entries(performanceAnalysis.topicPerformance)
    .filter(([_, stats]) => stats.total > 0)
    .map(([topic, stats]) => ({
      name: topic,
      percentage: stats.percentage,
      correct: stats.correct,
      total: stats.total
    }));

  return (
    <div className="space-y-6">
      {/* Difficulty Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Difficulty Analysis</h2>
        {difficultyData.length > 0 ? (
          <div className="space-y-6">
            {/* Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#374151' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any, name: any) => [`${value}%`, 'Performance']}
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Detailed breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficultyData.map((item, index) => {
                const getColor = (name: string) => {
                  switch (name.toLowerCase()) {
                    case 'easy': return 'text-green-600 bg-green-100';
                    case 'medium': return 'text-yellow-600 bg-yellow-100';
                    case 'hard': return 'text-red-600 bg-red-100';
                    default: return 'text-gray-600 bg-gray-100';
                  }
                };
                
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold capitalize px-2 py-1 rounded ${getColor(item.name)}`}>
                        {item.name}
                      </h3>
                      <span className="text-2xl font-bold text-gray-800">{item.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.correct} correct out of {item.total} questions
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No difficulty data available for this test.</p>
            </div>
          </div>
        )}
      </div>

      {/* Bloom's Taxonomy Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Cognitive Skills Analysis</h2>
        {bloomData.length > 0 ? (
          <div className="space-y-6">
            {/* Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={bloomData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#374151' }}
                  />
                  <PolarRadiusAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                  />
                  <Radar 
                    dataKey="percentage" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any, name: any) => [`${value}%`, 'Performance']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Detailed breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {bloomData.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 capitalize">{item.name}</h3>
                    <span className="text-2xl font-bold text-blue-600">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.correct} correct out of {item.total} questions
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No cognitive skills data available for this test.</p>
            </div>
          </div>
        )}
      </div>

      {/* Topic Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Topic Performance</h2>
        {topicData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No topic data available for this test.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RecommendationsTab = ({ performanceAnalysis }: { performanceAnalysis: PerformanceAnalysis | null }) => {
  if (!performanceAnalysis) return <div>Loading recommendations...</div>;

  const hasRealPrerequisites = performanceAnalysis.prerequisitesAnalysis.mastered.length > 0 || 
                              performanceAnalysis.prerequisitesAnalysis.needsReview.length > 0 || 
                              performanceAnalysis.prerequisitesAnalysis.missing.length > 0;

  const hasRealLearningObjs = performanceAnalysis.learningObjectivesAnalysis.mastered.length > 0 || 
                              performanceAnalysis.learningObjectivesAnalysis.needsReview.length > 0;

  return (
    <div className="space-y-6">
      {/* Prerequisites Analysis - Only show if real data exists */}
      {hasRealPrerequisites && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Prerequisites Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Mastered</h3>
              </div>
              <div className="space-y-2">
                {performanceAnalysis.prerequisitesAnalysis.mastered.length > 0 ? (
                  performanceAnalysis.prerequisitesAnalysis.mastered.map((prereq, idx) => (
                    <div key={idx} className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded">
                      {prereq}
                    </div>
                  ))
                ) : (
                  <p className="text-green-600 text-sm">No prerequisites mastered yet</p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800">Needs Review</h3>
              </div>
              <div className="space-y-2">
                {performanceAnalysis.prerequisitesAnalysis.needsReview.length > 0 ? (
                  performanceAnalysis.prerequisitesAnalysis.needsReview.map((prereq, idx) => (
                    <div key={idx} className="text-sm text-yellow-700 bg-yellow-100 px-3 py-2 rounded">
                      {prereq}
                    </div>
                  ))
                ) : (
                  <p className="text-yellow-600 text-sm">All prerequisites are well understood</p>
                )}
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Missing</h3>
              </div>
              <div className="space-y-2">
                {performanceAnalysis.prerequisitesAnalysis.missing.length > 0 ? (
                  performanceAnalysis.prerequisitesAnalysis.missing.map((prereq, idx) => (
                    <div key={idx} className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded">
                      {prereq}
                    </div>
                  ))
                ) : (
                  <p className="text-red-600 text-sm">All prerequisites are covered</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Objectives Analysis - Only show if real data exists */}
      {hasRealLearningObjs && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Learning Objectives Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Mastered Objectives</h3>
              </div>
              <div className="space-y-2">
                {performanceAnalysis.learningObjectivesAnalysis.mastered.length > 0 ? (
                  performanceAnalysis.learningObjectivesAnalysis.mastered.map((obj, idx) => (
                    <div key={idx} className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded">
                      {obj}
                    </div>
                  ))
                ) : (
                  <p className="text-green-600 text-sm">No learning objectives mastered yet</p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800">Needs Review</h3>
              </div>
              <div className="space-y-2">
                {performanceAnalysis.learningObjectivesAnalysis.needsReview.length > 0 ? (
                  performanceAnalysis.learningObjectivesAnalysis.needsReview.map((obj, idx) => (
                    <div key={idx} className="text-sm text-yellow-700 bg-yellow-100 px-3 py-2 rounded">
                      {obj}
                    </div>
                  ))
                ) : (
                  <p className="text-yellow-600 text-sm">All learning objectives are well understood</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Study Recommendations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Study Recommendations</h2>
        
        <div className="space-y-4">
          {performanceAnalysis.difficultyBreakdown.hard.total > 0 && performanceAnalysis.difficultyBreakdown.hard.percentage < 70 && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <h3 className="font-semibold text-red-800">Focus on Difficult Questions</h3>
                <p className="text-red-700 text-sm">Your performance on hard questions is {performanceAnalysis.difficultyBreakdown.hard.percentage.toFixed(1)}%. Consider practicing more challenging problems.</p>
              </div>
            </div>
          )}

          {performanceAnalysis.bloomTaxonomyBreakdown.analyze.total > 0 && performanceAnalysis.bloomTaxonomyBreakdown.analyze.percentage < 70 && (
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Brain className="w-5 h-5 text-yellow-600 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-800">Improve Analytical Skills</h3>
                <p className="text-yellow-700 text-sm">Your analytical skills need improvement. Focus on questions that require analysis and evaluation.</p>
              </div>
            </div>
          )}

          {performanceAnalysis.prerequisitesAnalysis.needsReview.length > 0 && (
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-800">Review Prerequisites</h3>
                <p className="text-blue-700 text-sm">Review these concepts: {performanceAnalysis.prerequisitesAnalysis.needsReview.join(', ')}</p>
              </div>
            </div>
          )}

          {performanceAnalysis.learningObjectivesAnalysis.needsReview.length > 0 && (
            <div className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold text-purple-800">Focus on Learning Objectives</h3>
                <p className="text-purple-700 text-sm">Work on these learning objectives: {performanceAnalysis.learningObjectivesAnalysis.needsReview.join(', ')}</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-green-800">Next Steps</h3>
              <p className="text-green-700 text-sm">Continue practicing with similar questions and focus on your weaker areas for improvement.</p>
            </div>
          </div>
        </div>
      </div>

      {/* No Data Message */}
      {!hasRealPrerequisites && !hasRealLearningObjs && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center py-8">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Detailed Recommendations Available</h3>
            <p className="text-gray-500 text-sm">
              The questions in this test don't have detailed prerequisites or learning objectives data. 
              Recommendations are based on general performance metrics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultDetailPage; 