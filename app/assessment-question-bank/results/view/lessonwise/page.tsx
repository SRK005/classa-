'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, BookOpen, Award, ArrowLeft, Target, Download, FileSpreadsheet, BarChart3, Users, Clock, Brain, CheckCircle, XCircle, Filter, Search, Book, FileText, Layers, PlayCircle, PauseCircle, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LessonData {
  lessonId: string;
  lessonName: string;
  chapterName: string;
  subject: string;
  duration: number; // in minutes
  totalQuestions: number;
  questionsAttempted: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  completionRate: number;
  averageTimeSpent: number; // in minutes
  engagementScore: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  learningObjectives: string[];
  bloomsDistribution: {
    remember: number;
    understand: number;
    apply: number;
    analyze: number;
    evaluate: number;
    create: number;
  };
  studentPerformance: Array<{
    studentId: string;
    studentName: string;
    score: number;
    timeSpent: number;
    questionsAttempted: number;
    engagementLevel: 'high' | 'medium' | 'low';
    status: 'mastered' | 'proficient' | 'developing' | 'beginning';
  }>;
  performanceTrend: Array<{
    date: string;
    averageScore: number;
    participationRate: number;
    engagementScore: number;
  }>;
  conceptMastery: Array<{
    concept: string;
    masteryLevel: number;
    studentsStruggling: number;
    timeToMaster: number; // average time in minutes
  }>;
  commonErrors: Array<{
    error: string;
    frequency: number;
    impact: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<{
    type: 'content' | 'pedagogy' | 'assessment' | 'remediation';
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  prerequisites: string[];
  nextLessons: string[];
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function KPICard({ title, value, icon, color, subtitle, trend }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/40',
    green: 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/40',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/40',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/40',
    red: 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/40',
    indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/40',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-yellow-500/40'
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl`}>
      <div className="absolute top-4 right-4 opacity-20">
        <div className="w-16 h-16 rounded-full bg-white/20"></div>
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="text-white/80 text-sm font-medium">{title}</div>
          <div className="text-white/60">{icon}</div>
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {subtitle && <div className="text-white/70 text-sm">{subtitle}</div>}
        {trend && (
          <div className={`flex items-center gap-1 text-sm mt-2 ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}% vs last lesson</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading lesson analysis...</p>
      </div>
    </div>
  );
}

function EmptyState() {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm max-w-md">
        <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lesson Data Available</h3>
        <p className="text-gray-600 mb-6">There are no lesson performance records to analyze at this time.</p>
        <button
          onClick={() => router.back()}
          className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default function LessonwiseReportPage() {
  const [lessonsData, setLessonsData] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'engagement' | 'difficulty'>('score');
  const router = useRouter();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
  const DIFFICULTY_COLORS = {
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#EF4444'
  };
  const STATUS_COLORS = {
    mastered: '#10B981',
    proficient: '#3B82F6',
    developing: '#F59E0B',
    beginning: '#EF4444'
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockLessonsData: LessonData[] = [
      {
        lessonId: 'L001',
        lessonName: 'Introduction to Linear Equations',
        chapterName: 'Algebra Fundamentals',
        subject: 'Mathematics',
        duration: 45,
        totalQuestions: 20,
        questionsAttempted: 18,
        averageScore: 82.5,
        highestScore: 95,
        lowestScore: 58,
        passRate: 85.7,
        completionRate: 90.0,
        averageTimeSpent: 38,
        engagementScore: 87.3,
        difficultyLevel: 'medium',
        learningObjectives: [
          'Understand the concept of linear equations',
          'Solve simple linear equations',
          'Apply linear equations to real-world problems'
        ],
        bloomsDistribution: {
          remember: 4,
          understand: 6,
          apply: 7,
          analyze: 2,
          evaluate: 1,
          create: 0
        },
        studentPerformance: [
          { studentId: 'STU001', studentName: 'Alice Johnson', score: 92, timeSpent: 35, questionsAttempted: 20, engagementLevel: 'high', status: 'mastered' },
          { studentId: 'STU002', studentName: 'Bob Smith', score: 68, timeSpent: 42, questionsAttempted: 16, engagementLevel: 'medium', status: 'developing' },
          { studentId: 'STU003', studentName: 'Carol Davis', score: 88, timeSpent: 36, questionsAttempted: 19, engagementLevel: 'high', status: 'proficient' }
        ],
        performanceTrend: [
          { date: '2024-01-15', averageScore: 78.2, participationRate: 87.5, engagementScore: 82.1 },
          { date: '2024-01-22', averageScore: 80.8, participationRate: 89.2, engagementScore: 84.7 },
          { date: '2024-01-29', averageScore: 82.5, participationRate: 90.0, engagementScore: 87.3 }
        ],
        conceptMastery: [
          { concept: 'Equation Setup', masteryLevel: 88.5, studentsStruggling: 2, timeToMaster: 15 },
          { concept: 'Solving Techniques', masteryLevel: 76.2, studentsStruggling: 5, timeToMaster: 22 },
          { concept: 'Real-world Applications', masteryLevel: 82.8, studentsStruggling: 3, timeToMaster: 18 }
        ],
        commonErrors: [
          { error: 'Incorrect sign handling', frequency: 12, impact: 'high' },
          { error: 'Order of operations mistakes', frequency: 8, impact: 'medium' },
          { error: 'Variable isolation errors', frequency: 6, impact: 'high' }
        ],
        recommendations: [
          { type: 'content', recommendation: 'Add more visual representations of equations', priority: 'high' },
          { type: 'pedagogy', recommendation: 'Use interactive equation balancing tools', priority: 'medium' },
          { type: 'assessment', recommendation: 'Include more step-by-step problem solving', priority: 'high' }
        ],
        prerequisites: ['Basic Arithmetic', 'Order of Operations'],
        nextLessons: ['Solving Complex Linear Equations', 'Systems of Linear Equations']
      },
      {
        lessonId: 'L002',
        lessonName: 'Newton\'s First Law of Motion',
        chapterName: 'Mechanics - Motion',
        subject: 'Physics',
        duration: 50,
        totalQuestions: 15,
        questionsAttempted: 14,
        averageScore: 74.8,
        highestScore: 89,
        lowestScore: 45,
        passRate: 78.6,
        completionRate: 93.3,
        averageTimeSpent: 42,
        engagementScore: 81.2,
        difficultyLevel: 'medium',
        learningObjectives: [
          'Understand Newton\'s First Law of Motion',
          'Identify examples of inertia in daily life',
          'Apply the concept to solve problems'
        ],
        bloomsDistribution: {
          remember: 3,
          understand: 5,
          apply: 4,
          analyze: 2,
          evaluate: 1,
          create: 0
        },
        studentPerformance: [
          { studentId: 'STU001', studentName: 'Alice Johnson', score: 85, timeSpent: 38, questionsAttempted: 15, engagementLevel: 'high', status: 'proficient' },
          { studentId: 'STU002', studentName: 'Bob Smith', score: 62, timeSpent: 48, questionsAttempted: 12, engagementLevel: 'low', status: 'developing' },
          { studentId: 'STU003', studentName: 'Carol Davis', score: 79, timeSpent: 40, questionsAttempted: 14, engagementLevel: 'medium', status: 'proficient' }
        ],
        performanceTrend: [
          { date: '2024-01-15', averageScore: 71.5, participationRate: 89.3, engagementScore: 78.5 },
          { date: '2024-01-22', averageScore: 73.1, participationRate: 91.1, engagementScore: 79.8 },
          { date: '2024-01-29', averageScore: 74.8, participationRate: 93.3, engagementScore: 81.2 }
        ],
        conceptMastery: [
          { concept: 'Inertia Concept', masteryLevel: 82.1, studentsStruggling: 4, timeToMaster: 20 },
          { concept: 'Force and Motion Relationship', masteryLevel: 68.5, studentsStruggling: 7, timeToMaster: 28 },
          { concept: 'Real-world Examples', masteryLevel: 76.8, studentsStruggling: 5, timeToMaster: 22 }
        ],
        commonErrors: [
          { error: 'Confusing force with motion', frequency: 10, impact: 'high' },
          { error: 'Misunderstanding inertia', frequency: 7, impact: 'medium' },
          { error: 'Incorrect problem setup', frequency: 5, impact: 'high' }
        ],
        recommendations: [
          { type: 'content', recommendation: 'Add more real-world demonstrations', priority: 'high' },
          { type: 'pedagogy', recommendation: 'Use simulation software for motion concepts', priority: 'medium' },
          { type: 'remediation', recommendation: 'Provide additional practice problems', priority: 'high' }
        ],
        prerequisites: ['Basic Motion Concepts', 'Force Introduction'],
        nextLessons: ['Newton\'s Second Law', 'Newton\'s Third Law']
      },
      {
        lessonId: 'L003',
        lessonName: 'Functional Groups in Organic Chemistry',
        chapterName: 'Organic Chemistry Basics',
        subject: 'Chemistry',
        duration: 55,
        totalQuestions: 25,
        questionsAttempted: 22,
        averageScore: 71.2,
        highestScore: 92,
        lowestScore: 42,
        passRate: 72.7,
        completionRate: 88.0,
        averageTimeSpent: 48,
        engagementScore: 79.5,
        difficultyLevel: 'hard',
        learningObjectives: [
          'Identify common functional groups',
          'Understand functional group properties',
          'Predict molecular behavior based on functional groups'
        ],
        bloomsDistribution: {
          remember: 6,
          understand: 8,
          apply: 7,
          analyze: 3,
          evaluate: 1,
          create: 0
        },
        studentPerformance: [
          { studentId: 'STU001', studentName: 'Alice Johnson', score: 88, timeSpent: 45, questionsAttempted: 24, engagementLevel: 'high', status: 'proficient' },
          { studentId: 'STU002', studentName: 'Bob Smith', score: 54, timeSpent: 52, questionsAttempted: 19, engagementLevel: 'low', status: 'beginning' },
          { studentId: 'STU003', studentName: 'Carol Davis', score: 76, timeSpent: 47, questionsAttempted: 23, engagementLevel: 'medium', status: 'developing' }
        ],
        performanceTrend: [
          { date: '2024-01-15', averageScore: 68.3, participationRate: 84.2, engagementScore: 76.8 },
          { date: '2024-01-22', averageScore: 69.7, participationRate: 86.1, engagementScore: 78.1 },
          { date: '2024-01-29', averageScore: 71.2, participationRate: 88.0, engagementScore: 79.5 }
        ],
        conceptMastery: [
          { concept: 'Functional Group Identification', masteryLevel: 75.8, studentsStruggling: 6, timeToMaster: 25 },
          { concept: 'Properties and Reactions', masteryLevel: 66.2, studentsStruggling: 9, timeToMaster: 32 },
          { concept: 'Structure-Function Relationships', masteryLevel: 71.5, studentsStruggling: 7, timeToMaster: 28 }
        ],
        commonErrors: [
          { error: 'Incorrect functional group naming', frequency: 15, impact: 'high' },
          { error: 'Confusion between similar groups', frequency: 11, impact: 'medium' },
          { error: 'Property prediction errors', frequency: 8, impact: 'high' }
        ],
        recommendations: [
          { type: 'content', recommendation: 'Create functional group comparison charts', priority: 'high' },
          { type: 'pedagogy', recommendation: 'Use molecular modeling software', priority: 'medium' },
          { type: 'assessment', recommendation: 'Add more visual identification questions', priority: 'high' }
        ],
        prerequisites: ['Basic Organic Structure', 'Chemical Bonding'],
        nextLessons: ['Nomenclature Rules', 'Reaction Mechanisms']
      },
      {
        lessonId: 'L004',
        lessonName: 'Cell Membrane Structure and Function',
        chapterName: 'Cell Biology',
        subject: 'Biology',
        duration: 40,
        totalQuestions: 18,
        questionsAttempted: 17,
        averageScore: 85.3,
        highestScore: 96,
        lowestScore: 68,
        passRate: 88.9,
        completionRate: 94.4,
        averageTimeSpent: 35,
        engagementScore: 89.7,
        difficultyLevel: 'medium',
        learningObjectives: [
          'Describe cell membrane structure',
          'Explain membrane transport mechanisms',
          'Analyze factors affecting membrane permeability'
        ],
        bloomsDistribution: {
          remember: 4,
          understand: 6,
          apply: 5,
          analyze: 2,
          evaluate: 1,
          create: 0
        },
        studentPerformance: [
          { studentId: 'STU001', studentName: 'Alice Johnson', score: 94, timeSpent: 32, questionsAttempted: 18, engagementLevel: 'high', status: 'mastered' },
          { studentId: 'STU002', studentName: 'Bob Smith', score: 76, timeSpent: 38, questionsAttempted: 16, engagementLevel: 'medium', status: 'proficient' },
          { studentId: 'STU003', studentName: 'Carol Davis', score: 89, timeSpent: 34, questionsAttempted: 17, engagementLevel: 'high', status: 'proficient' }
        ],
        performanceTrend: [
          { date: '2024-01-15', averageScore: 82.1, participationRate: 91.7, engagementScore: 86.3 },
          { date: '2024-01-22', averageScore: 83.7, participationRate: 93.1, engagementScore: 88.0 },
          { date: '2024-01-29', averageScore: 85.3, participationRate: 94.4, engagementScore: 89.7 }
        ],
        conceptMastery: [
          { concept: 'Membrane Structure', masteryLevel: 91.2, studentsStruggling: 2, timeToMaster: 18 },
          { concept: 'Transport Mechanisms', masteryLevel: 82.5, studentsStruggling: 4, timeToMaster: 22 },
          { concept: 'Permeability Factors', masteryLevel: 86.8, studentsStruggling: 3, timeToMaster: 20 }
        ],
        commonErrors: [
          { error: 'Confusion between active and passive transport', frequency: 6, impact: 'medium' },
          { error: 'Incorrect membrane component identification', frequency: 4, impact: 'low' },
          { error: 'Misunderstanding concentration gradients', frequency: 5, impact: 'high' }
        ],
        recommendations: [
          { type: 'content', recommendation: 'Add interactive membrane diagrams', priority: 'medium' },
          { type: 'pedagogy', recommendation: 'Use animation for transport processes', priority: 'high' },
          { type: 'assessment', recommendation: 'Include more application scenarios', priority: 'medium' }
        ],
        prerequisites: ['Basic Cell Structure', 'Chemical Gradients'],
        nextLessons: ['Cellular Transport', 'Membrane Proteins']
      },
      {
        lessonId: 'L005',
        lessonName: 'Quadratic Functions Introduction',
        chapterName: 'Algebra Fundamentals',
        subject: 'Mathematics',
        duration: 50,
        totalQuestions: 22,
        questionsAttempted: 19,
        averageScore: 68.7,
        highestScore: 87,
        lowestScore: 38,
        passRate: 68.4,
        completionRate: 86.4,
        averageTimeSpent: 45,
        engagementScore: 75.2,
        difficultyLevel: 'hard',
        learningObjectives: [
          'Understand quadratic function properties',
          'Graph quadratic functions',
          'Solve quadratic equations using various methods'
        ],
        bloomsDistribution: {
          remember: 3,
          understand: 7,
          apply: 8,
          analyze: 3,
          evaluate: 1,
          create: 0
        },
        studentPerformance: [
          { studentId: 'STU001', studentName: 'Alice Johnson', score: 84, timeSpent: 42, questionsAttempted: 21, engagementLevel: 'high', status: 'proficient' },
          { studentId: 'STU002', studentName: 'Bob Smith', score: 52, timeSpent: 50, questionsAttempted: 17, engagementLevel: 'low', status: 'beginning' },
          { studentId: 'STU003', studentName: 'Carol Davis', score: 71, timeSpent: 44, questionsAttempted: 20, engagementLevel: 'medium', status: 'developing' }
        ],
        performanceTrend: [
          { date: '2024-01-15', averageScore: 65.2, participationRate: 82.6, engagementScore: 72.1 },
          { date: '2024-01-22', averageScore: 66.9, participationRate: 84.5, engagementScore: 73.6 },
          { date: '2024-01-29', averageScore: 68.7, participationRate: 86.4, engagementScore: 75.2 }
        ],
        conceptMastery: [
          { concept: 'Quadratic Form Recognition', masteryLevel: 72.8, studentsStruggling: 7, timeToMaster: 28 },
          { concept: 'Graphing Techniques', masteryLevel: 64.5, studentsStruggling: 10, timeToMaster: 35 },
          { concept: 'Solving Methods', masteryLevel: 68.9, studentsStruggling: 8, timeToMaster: 32 }
        ],
        commonErrors: [
          { error: 'Incorrect vertex identification', frequency: 13, impact: 'high' },
          { error: 'Sign errors in factoring', frequency: 9, impact: 'medium' },
          { error: 'Graphing scale mistakes', frequency: 7, impact: 'low' }
        ],
        recommendations: [
          { type: 'content', recommendation: 'Add more graphing practice problems', priority: 'high' },
          { type: 'pedagogy', recommendation: 'Use graphing calculator demonstrations', priority: 'medium' },
          { type: 'remediation', recommendation: 'Provide step-by-step solving guides', priority: 'high' }
        ],
        prerequisites: ['Linear Functions', 'Factoring Basics'],
        nextLessons: ['Quadratic Formula', 'Complex Quadratic Applications']
      }
    ];

    setTimeout(() => {
      setLessonsData(mockLessonsData);
      setLoading(false);
    }, 1000);
  }, []);

  const subjects = ['all', ...Array.from(new Set(lessonsData.map(lesson => lesson.subject)))];
  const chapters = ['all', ...Array.from(new Set(lessonsData.map(lesson => lesson.chapterName)))];
  
  const filteredLessons = lessonsData.filter(lesson => {
    const matchesSubject = selectedSubject === 'all' || lesson.subject === selectedSubject;
    const matchesChapter = selectedChapter === 'all' || lesson.chapterName === selectedChapter;
    const matchesSearch = lesson.lessonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.chapterName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesChapter && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.averageScore - a.averageScore;
      case 'name':
        return a.lessonName.localeCompare(b.lessonName);
      case 'engagement':
        return b.engagementScore - a.engagementScore;
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel];
      default:
        return 0;
    }
  });

  const overallStats = {
    totalLessons: lessonsData.length,
    averageScore: lessonsData.reduce((sum, lesson) => sum + lesson.averageScore, 0) / lessonsData.length || 0,
    averageEngagement: lessonsData.reduce((sum, lesson) => sum + lesson.engagementScore, 0) / lessonsData.length || 0,
    averageCompletion: lessonsData.reduce((sum, lesson) => sum + lesson.completionRate, 0) / lessonsData.length || 0
  };

  const difficultyDistribution = [
    { name: 'Easy', value: lessonsData.filter(l => l.difficultyLevel === 'easy').length, color: DIFFICULTY_COLORS.easy },
    { name: 'Medium', value: lessonsData.filter(l => l.difficultyLevel === 'medium').length, color: DIFFICULTY_COLORS.medium },
    { name: 'Hard', value: lessonsData.filter(l => l.difficultyLevel === 'hard').length, color: DIFFICULTY_COLORS.hard }
  ];

  const subjectPerformance = subjects.slice(1).map(subject => {
    const subjectLessons = lessonsData.filter(l => l.subject === subject);
    return {
      subject,
      averageScore: subjectLessons.reduce((sum, l) => sum + l.averageScore, 0) / subjectLessons.length || 0,
      engagementScore: subjectLessons.reduce((sum, l) => sum + l.engagementScore, 0) / subjectLessons.length || 0,
      lessonsCount: subjectLessons.length
    };
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (lessonsData.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lesson-wise Performance Report</h1>
                <p className="text-gray-600 mt-1">Detailed analysis of student performance across individual lessons</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Lessons"
              value={overallStats.totalLessons}
              icon={<PlayCircle className="w-6 h-6" />}
              color="blue"
              subtitle="Across all subjects"
            />
            <KPICard
              title="Average Score"
              value={`${overallStats.averageScore.toFixed(1)}%`}
              icon={<Target className="w-6 h-6" />}
              color="green"
              trend={{ value: 2.8, isPositive: true }}
            />
            <KPICard
              title="Engagement Score"
              value={`${overallStats.averageEngagement.toFixed(1)}%`}
              icon={<Brain className="w-6 h-6" />}
              color="purple"
              trend={{ value: 4.2, isPositive: true }}
            />
            <KPICard
              title="Completion Rate"
              value={`${overallStats.averageCompletion.toFixed(1)}%`}
              icon={<CheckCircle className="w-6 h-6" />}
              color="orange"
              trend={{ value: 1.5, isPositive: true }}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Subject Performance Comparison */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Subject Performance & Engagement</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averageScore" fill="#8884d8" name="Average Score (%)" />
                    <Bar dataKey="engagementScore" fill="#82ca9d" name="Engagement Score (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Difficulty Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Lesson Difficulty Distribution</h3>
                <Layers className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {difficultyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-gray-700 py-2">Subject:</span>
                  {subjects.map(subject => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        selectedSubject === subject ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {subject === 'all' ? 'All' : subject}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-gray-700 py-2">Chapter:</span>
                  {chapters.slice(0, 6).map(chapter => (
                    <button
                      key={chapter}
                      onClick={() => setSelectedChapter(chapter)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        selectedChapter === chapter ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {chapter === 'all' ? 'All Chapters' : chapter.length > 20 ? chapter.substring(0, 20) + '...' : chapter}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {filteredLessons.length} of {lessonsData.length} lessons
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search lessons..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'engagement' | 'difficulty')}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="score">Sort by Score</option>
                    <option value="name">Sort by Name</option>
                    <option value="engagement">Sort by Engagement</option>
                    <option value="difficulty">Sort by Difficulty</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Lessons List */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Lesson Performance Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => (
                <div key={lesson.lessonId} 
                     className={`border-2 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer ${
                       lesson.averageScore > 85 ? 'border-green-200 bg-green-50/30' :
                       lesson.averageScore >= 70 ? 'border-blue-200 bg-blue-50/30' :
                       'border-red-200 bg-red-50/30'
                     }`}
                     onClick={() => setSelectedLesson(lesson)}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        lesson.difficultyLevel === 'easy' ? 'bg-green-100' :
                        lesson.difficultyLevel === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <PlayCircle className={`w-5 h-5 ${
                          lesson.difficultyLevel === 'easy' ? 'text-green-600' :
                          lesson.difficultyLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">{lesson.lessonName}</h4>
                        <p className="text-xs text-gray-600">{lesson.subject} • {lesson.chapterName}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lesson.difficultyLevel === 'easy' ? 'bg-green-100 text-green-800' :
                      lesson.difficultyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lesson.difficultyLevel.charAt(0).toUpperCase() + lesson.difficultyLevel.slice(1)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Score:</span>
                      <span className="font-bold text-sm">{lesson.averageScore.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Engagement:</span>
                      <span className="font-medium text-sm">{lesson.engagementScore.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Completion:</span>
                      <span className="font-medium text-sm">{lesson.completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Duration:</span>
                      <span className="font-medium text-sm">{lesson.duration}min</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-xs text-gray-600 font-medium mb-1">Learning Objectives:</div>
                    <div className="text-xs text-gray-700">
                      {lesson.learningObjectives.slice(0, 2).join(', ')}
                      {lesson.learningObjectives.length > 2 && '...'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Detail Modal */}
          {selectedLesson && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedLesson.difficultyLevel === 'easy' ? 'bg-green-100' :
                      selectedLesson.difficultyLevel === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <PlayCircle className={`w-6 h-6 ${
                        selectedLesson.difficultyLevel === 'easy' ? 'text-green-600' :
                        selectedLesson.difficultyLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedLesson.lessonName}</h3>
                      <p className="text-gray-600">{selectedLesson.subject} • {selectedLesson.chapterName} • {selectedLesson.lessonId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Performance Metrics */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <div className="text-sm text-blue-600 font-medium">Average Score</div>
                          <div className="text-2xl font-bold text-blue-900">{selectedLesson.averageScore.toFixed(1)}%</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl">
                          <div className="text-sm text-green-600 font-medium">Pass Rate</div>
                          <div className="text-2xl font-bold text-green-900">{selectedLesson.passRate.toFixed(1)}%</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl">
                          <div className="text-sm text-purple-600 font-medium">Engagement</div>
                          <div className="text-2xl font-bold text-purple-900">{selectedLesson.engagementScore.toFixed(1)}%</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl">
                          <div className="text-sm text-orange-600 font-medium">Completion</div>
                          <div className="text-2xl font-bold text-orange-900">{selectedLesson.completionRate.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives</h4>
                      <div className="space-y-2">
                        {selectedLesson.learningObjectives.map((objective, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Concept Mastery</h4>
                      <div className="space-y-3">
                        {selectedLesson.conceptMastery.map((concept, index) => (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-700 text-sm">{concept.concept}</span>
                              <span className="font-bold text-gray-900 text-sm">{concept.masteryLevel.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  concept.masteryLevel >= 80 ? 'bg-green-500' : concept.masteryLevel >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${concept.masteryLevel}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>{concept.studentsStruggling} students struggling</span>
                              <span>Avg. time to master: {concept.timeToMaster}min</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Insights and Recommendations */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedLesson.performanceTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="averageScore" stroke="#8884d8" name="Average Score" />
                            <Line type="monotone" dataKey="engagementScore" stroke="#82ca9d" name="Engagement Score" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-red-900 mb-3">Common Errors</h4>
                      <div className="space-y-2">
                        {selectedLesson.commonErrors.map((error, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${
                            error.impact === 'high' ? 'border-red-200 bg-red-50' :
                            error.impact === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                            'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{error.error}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Frequency: {error.frequency}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  error.impact === 'high' ? 'bg-red-100 text-red-800' :
                                  error.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {error.impact} impact
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {selectedLesson.recommendations.map((rec, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${
                            rec.priority === 'high' ? 'border-blue-200 bg-blue-50' :
                            rec.priority === 'medium' ? 'border-green-200 bg-green-50' :
                            'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    rec.type === 'content' ? 'bg-purple-100 text-purple-800' :
                                    rec.type === 'pedagogy' ? 'bg-blue-100 text-blue-800' :
                                    rec.type === 'assessment' ? 'bg-green-100 text-green-800' :
                                    'bg-orange-100 text-orange-800'
                                  }`}>
                                    {rec.type}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {rec.priority} priority
                                  </span>
                                </div>
                                <span className="text-sm text-gray-700">{rec.recommendation}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="text-sm text-gray-600 font-medium mb-2">Prerequisites</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedLesson.prerequisites.map((prereq, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs">
                              {prereq}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="text-sm text-gray-600 font-medium mb-2">Next Lessons</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedLesson.nextLessons.map((next, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-200 text-blue-700 rounded-lg text-xs">
                              {next}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}