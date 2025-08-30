'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, BookOpen, Award, ArrowLeft, Target, Download, FileSpreadsheet, BarChart3, Users, Clock, Brain, CheckCircle, XCircle, Filter, Search, Book, FileText, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChapterData {
  chapterId: string;
  chapterName: string;
  subject: string;
  totalQuestions: number;
  questionsAttempted: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  completionRate: number;
  averageTimeSpent: number; // in minutes
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
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
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  }>;
  performanceTrend: Array<{
    testDate: string;
    averageScore: number;
    participationRate: number;
  }>;
  conceptMastery: Array<{
    concept: string;
    masteryLevel: number;
    studentsStruggling: number;
  }>;
  commonMistakes: string[];
  recommendations: string[];
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
            <span>{Math.abs(trend.value)}% vs last assessment</span>
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
        <p className="text-gray-600">Loading chapter analysis...</p>
      </div>
    </div>
  );
}

function EmptyState() {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm max-w-md">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Chapter Data Available</h3>
        <p className="text-gray-600 mb-6">There are no chapter performance records to analyze at this time.</p>
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

export default function ChapterwiseReportPage() {
  const [chaptersData, setChaptersData] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<ChapterData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'completion'>('score');
  const router = useRouter();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
  const DIFFICULTY_COLORS = {
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#EF4444'
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockChaptersData: ChapterData[] = [
      {
        chapterId: 'CH001',
        chapterName: 'Algebra Fundamentals',
        subject: 'Mathematics',
        totalQuestions: 45,
        questionsAttempted: 42,
        averageScore: 78.5,
        highestScore: 96,
        lowestScore: 45,
        passRate: 82.3,
        completionRate: 93.3,
        averageTimeSpent: 35,
        difficultyDistribution: {
          easy: 15,
          medium: 20,
          hard: 10
        },
        bloomsDistribution: {
          remember: 8,
          understand: 12,
          apply: 15,
          analyze: 7,
          evaluate: 2,
          create: 1
        },
        studentPerformance: [
          { studentId: 'STU001', studentName: 'Alice Johnson', score: 92, timeSpent: 28, questionsAttempted: 45, status: 'excellent' },
          { studentId: 'STU002', studentName: 'Bob Smith', score: 65, timeSpent: 42, questionsAttempted: 38, status: 'needs-improvement' },
          { studentId: 'STU003', studentName: 'Carol Davis', score: 88, timeSpent: 31, questionsAttempted: 44, status: 'good' }
        ],
        performanceTrend: [
          { testDate: '2024-01-15', averageScore: 72.5, participationRate: 89.2 },
          { testDate: '2024-01-22', averageScore: 75.8, participationRate: 91.5 },
          { testDate: '2024-01-29', averageScore: 78.5, participationRate: 93.3 }
        ],
        conceptMastery: [
          { concept: 'Linear Equations', masteryLevel: 85.2, studentsStruggling: 3 },
          { concept: 'Quadratic Functions', masteryLevel: 72.8, studentsStruggling: 7 },
          { concept: 'Polynomial Operations', masteryLevel: 79.5, studentsStruggling: 5 }
        ],
        commonMistakes: [
          'Incorrect sign handling in equations',
          'Confusion with order of operations',
          'Difficulty with factoring techniques'
        ],
        recommendations: [
          'Additional practice with sign rules',
          'Interactive algebra manipulatives',
          'Peer tutoring for struggling concepts'
        ]
      },
      {
        chapterId: 'CH002',
        chapterName: 'Mechanics - Motion',
        subject: 'Physics',
        totalQuestions: 38,
        questionsAttempted: 35,
        averageScore: 71.2,
        highestScore: 89,
        lowestScore: 42,
        passRate: 74.5,
        completionRate: 92.1,
        averageTimeSpent: 42,
        difficultyDistribution: {
          easy: 12,
          medium: 18,
          hard: 8
        },
        bloomsDistribution: {
          remember: 6,
          understand: 10,
          apply: 12,
          analyze: 8,
          evaluate: 1,
          create: 1
        },
        studentPerformance: [
          { studentId: 'STU001', studentName: 'Alice Johnson', score: 85, timeSpent: 38, questionsAttempted: 37, status: 'good' },
          { studentId: 'STU002', studentName: 'Bob Smith', score: 58, timeSpent: 48, questionsAttempted: 32, status: 'needs-improvement' },
          { studentId: 'STU003', studentName: 'Carol Davis', score: 79, timeSpent: 40, questionsAttempted: 36, status: 'good' }
        ],
        performanceTrend: [
          { testDate: '2024-01-15', averageScore: 68.3, participationRate: 87.8 },
          { testDate: '2024-01-22', averageScore: 69.7, participationRate: 89.5 },
          { testDate: '2024-01-29', averageScore: 71.2, participationRate: 92.1 }
        ],
        conceptMastery: [
          { concept: 'Velocity and Acceleration', masteryLevel: 76.8, studentsStruggling: 6 },
          { concept: 'Kinematic Equations', masteryLevel: 65.2, studentsStruggling: 9 },
          { concept: 'Projectile Motion', masteryLevel: 71.5, studentsStruggling: 7 }
        ],
        commonMistakes: [
          'Confusion between velocity and acceleration',
          'Incorrect application of kinematic equations',
          'Sign errors in vector calculations'
        ],
        recommendations: [
          'Visual demonstrations of motion concepts',
          'Step-by-step problem solving practice',
          'Real-world application examples'
        ]
      },
      {
        chapterId: 'CH003',
        chapterName: 'Organic Chemistry Basics',
        subject: 'Chemistry',
        totalQuestions: 52,
        questionsAttempted: 48,
        averageScore: 69.8,
        highestScore: 91,
        lowestScore: 38,
        passRate: 71.2,
        completionRate: 92.3,
        averageTimeSpent: 48,
        difficultyDistribution: {
          easy: 16,
          medium: 24,
          hard: 12
        },
        bloomsDistribution: {
          remember: 12,
          understand: 15,
          apply: 16,
          analyze: 6,
          evaluate: 2,
          create: 1
        },
        studentPerformance: [
          { studentId: 'STU001', studentName: 'Alice Johnson', score: 87, timeSpent: 45, questionsAttempted: 50, status: 'good' },
          { studentId: 'STU002', studentName: 'Bob Smith', score: 52, timeSpent: 55, questionsAttempted: 42, status: 'needs-improvement' },
          { studentId: 'STU003', studentName: 'Carol Davis', score: 74, timeSpent: 46, questionsAttempted: 49, status: 'good' }
        ],
        performanceTrend: [
          { testDate: '2024-01-15', averageScore: 65.8, participationRate: 88.5 },
          { testDate: '2024-01-22', averageScore: 67.2, participationRate: 90.2 },
          { testDate: '2024-01-29', averageScore: 69.8, participationRate: 92.3 }
        ],
        conceptMastery: [
          { concept: 'Functional Groups', masteryLevel: 74.5, studentsStruggling: 8 },
          { concept: 'Nomenclature', masteryLevel: 68.2, studentsStruggling: 10 },
          { concept: 'Reaction Mechanisms', masteryLevel: 66.8, studentsStruggling: 12 }
        ],
        commonMistakes: [
          'Incorrect naming of organic compounds',
          'Confusion with functional group properties',
          'Difficulty with reaction mechanism steps'
        ],
        recommendations: [
          'Molecular model building activities',
          'Systematic nomenclature practice',
          'Mechanism visualization tools'
        ]
      },
      {
        chapterId: 'CH004',
        chapterName: 'Cell Biology',
        subject: 'Biology',
        totalQuestions: 41,
        questionsAttempted: 39,
        averageScore: 82.4,
        highestScore: 95,
        lowestScore: 58,
        passRate: 87.8,
        completionRate: 95.1,
        averageTimeSpent: 38,
        difficultyDistribution: {
          easy: 14,
          medium: 19,
          hard: 8
        },
        bloomsDistribution: {
          remember: 10,
          understand: 12,
          apply: 11,
          analyze: 6,
          evaluate: 1,
          create: 1
        },
        studentPerformance: [
          { studentId: 'STU001', studentName: 'Alice Johnson', score: 93, timeSpent: 35, questionsAttempted: 41, status: 'excellent' },
          { studentId: 'STU002', studentName: 'Bob Smith', score: 72, timeSpent: 42, questionsAttempted: 37, status: 'good' },
          { studentId: 'STU003', studentName: 'Carol Davis', score: 86, timeSpent: 37, questionsAttempted: 40, status: 'good' }
        ],
        performanceTrend: [
          { testDate: '2024-01-15', averageScore: 78.9, participationRate: 92.3 },
          { testDate: '2024-01-22', averageScore: 80.5, participationRate: 93.8 },
          { testDate: '2024-01-29', averageScore: 82.4, participationRate: 95.1 }
        ],
        conceptMastery: [
          { concept: 'Cell Structure', masteryLevel: 88.5, studentsStruggling: 3 },
          { concept: 'Cellular Processes', masteryLevel: 79.2, studentsStruggling: 6 },
          { concept: 'Cell Division', masteryLevel: 81.8, studentsStruggling: 5 }
        ],
        commonMistakes: [
          'Confusion between prokaryotic and eukaryotic cells',
          'Difficulty with organelle functions',
          'Mitosis vs meiosis distinctions'
        ],
        recommendations: [
          'Interactive cell diagrams',
          'Microscopy lab sessions',
          'Process animation videos'
        ]
      },
      {
        chapterId: 'CH005',
        chapterName: 'Geometry Proofs',
        subject: 'Mathematics',
        totalQuestions: 32,
        questionsAttempted: 28,
        averageScore: 64.7,
        highestScore: 88,
        lowestScore: 35,
        passRate: 65.6,
        completionRate: 87.5,
        averageTimeSpent: 52,
        difficultyDistribution: {
          easy: 8,
          medium: 16,
          hard: 8
        },
        bloomsDistribution: {
          remember: 4,
          understand: 8,
          apply: 10,
          analyze: 8,
          evaluate: 1,
          create: 1
        },
        studentPerformance: [
          { studentId: 'STU001', studentName: 'Alice Johnson', score: 84, timeSpent: 48, questionsAttempted: 31, status: 'good' },
          { studentId: 'STU002', studentName: 'Bob Smith', score: 45, timeSpent: 58, questionsAttempted: 25, status: 'poor' },
          { studentId: 'STU003', studentName: 'Carol Davis', score: 72, timeSpent: 51, questionsAttempted: 29, status: 'good' }
        ],
        performanceTrend: [
          { testDate: '2024-01-15', averageScore: 61.2, participationRate: 82.5 },
          { testDate: '2024-01-22', averageScore: 62.8, participationRate: 85.0 },
          { testDate: '2024-01-29', averageScore: 64.7, participationRate: 87.5 }
        ],
        conceptMastery: [
          { concept: 'Angle Relationships', masteryLevel: 72.5, studentsStruggling: 8 },
          { concept: 'Triangle Congruence', masteryLevel: 58.8, studentsStruggling: 12 },
          { concept: 'Parallel Lines', masteryLevel: 66.2, studentsStruggling: 10 }
        ],
        commonMistakes: [
          'Incomplete proof statements',
          'Incorrect theorem applications',
          'Logical reasoning gaps'
        ],
        recommendations: [
          'Structured proof templates',
          'Collaborative proof discussions',
          'Visual geometry software'
        ]
      }
    ];

    setTimeout(() => {
      setChaptersData(mockChaptersData);
      setLoading(false);
    }, 1000);
  }, []);

  const subjects = ['all', ...Array.from(new Set(chaptersData.map(chapter => chapter.subject)))];
  
  const filteredChapters = chaptersData.filter(chapter => {
    const matchesSubject = selectedSubject === 'all' || chapter.subject === selectedSubject;
    const matchesSearch = chapter.chapterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chapter.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.averageScore - a.averageScore;
      case 'name':
        return a.chapterName.localeCompare(b.chapterName);
      case 'completion':
        return b.completionRate - a.completionRate;
      default:
        return 0;
    }
  });

  const overallStats = {
    totalChapters: chaptersData.length,
    averageScore: chaptersData.reduce((sum, ch) => sum + ch.averageScore, 0) / chaptersData.length || 0,
    averageCompletion: chaptersData.reduce((sum, ch) => sum + ch.completionRate, 0) / chaptersData.length || 0,
    averagePassRate: chaptersData.reduce((sum, ch) => sum + ch.passRate, 0) / chaptersData.length || 0
  };

  const subjectPerformance = subjects.slice(1).map(subject => {
    const subjectChapters = chaptersData.filter(ch => ch.subject === subject);
    return {
      subject,
      averageScore: subjectChapters.reduce((sum, ch) => sum + ch.averageScore, 0) / subjectChapters.length || 0,
      completionRate: subjectChapters.reduce((sum, ch) => sum + ch.completionRate, 0) / subjectChapters.length || 0,
      chaptersCount: subjectChapters.length
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

  if (chaptersData.length === 0) {
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
                <h1 className="text-3xl font-bold text-gray-900">Chapter-wise Performance Report</h1>
                <p className="text-gray-600 mt-1">Detailed analysis of student performance across different chapters</p>
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
              title="Total Chapters"
              value={overallStats.totalChapters}
              icon={<BookOpen className="w-6 h-6" />}
              color="blue"
              subtitle="Across all subjects"
            />
            <KPICard
              title="Average Score"
              value={`${overallStats.averageScore.toFixed(1)}%`}
              icon={<Target className="w-6 h-6" />}
              color="green"
              trend={{ value: 3.2, isPositive: true }}
            />
            <KPICard
              title="Completion Rate"
              value={`${overallStats.averageCompletion.toFixed(1)}%`}
              icon={<CheckCircle className="w-6 h-6" />}
              color="purple"
              trend={{ value: 2.1, isPositive: true }}
            />
            <KPICard
              title="Pass Rate"
              value={`${overallStats.averagePassRate.toFixed(1)}%`}
              icon={<Award className="w-6 h-6" />}
              color="orange"
              trend={{ value: 1.8, isPositive: true }}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Subject Performance Comparison */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Subject Performance Comparison</h3>
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
                    <Bar dataKey="completionRate" fill="#82ca9d" name="Completion Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chapter Performance Trend */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Performance Distribution</h3>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Excellent (>85%)', value: chaptersData.filter(ch => ch.averageScore > 85).length, fill: '#10B981' },
                        { name: 'Good (70-85%)', value: chaptersData.filter(ch => ch.averageScore >= 70 && ch.averageScore <= 85).length, fill: '#3B82F6' },
                        { name: 'Needs Improvement (<70%)', value: chaptersData.filter(ch => ch.averageScore < 70).length, fill: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent ? (percent * 100).toFixed(0) : '0')}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                      selectedSubject === subject ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {subject === 'all' ? 'All Subjects' : subject} 
                    ({subject === 'all' ? chaptersData.length : chaptersData.filter(ch => ch.subject === subject).length})
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search chapters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'completion')}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="score">Sort by Score</option>
                  <option value="name">Sort by Name</option>
                  <option value="completion">Sort by Completion</option>
                </select>
              </div>
            </div>
          </div>

          {/* Chapters List */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Chapter Performance Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredChapters.map((chapter) => (
                <div key={chapter.chapterId} 
                     className={`border-2 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer ${
                       chapter.averageScore > 85 ? 'border-green-200 bg-green-50/30' :
                       chapter.averageScore >= 70 ? 'border-blue-200 bg-blue-50/30' :
                       'border-red-200 bg-red-50/30'
                     }`}
                     onClick={() => setSelectedChapter(chapter)}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        chapter.averageScore > 85 ? 'bg-green-100' :
                        chapter.averageScore >= 70 ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        <Book className={`w-5 h-5 ${
                          chapter.averageScore > 85 ? 'text-green-600' :
                          chapter.averageScore >= 70 ? 'text-blue-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{chapter.chapterName}</h4>
                        <p className="text-sm text-gray-600">{chapter.subject}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      chapter.averageScore > 85 ? 'bg-green-100 text-green-800' :
                      chapter.averageScore >= 70 ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {chapter.averageScore > 85 ? 'Excellent' :
                       chapter.averageScore >= 70 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Score:</span>
                      <span className="font-bold text-lg">{chapter.averageScore.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion Rate:</span>
                      <span className="font-medium">{chapter.completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pass Rate:</span>
                      <span className="font-medium">{chapter.passRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Time:</span>
                      <span className="font-medium">{chapter.averageTimeSpent} min</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-xs text-gray-600 font-medium mb-1">Questions:</div>
                    <div className="text-xs text-gray-700">
                      {chapter.questionsAttempted}/{chapter.totalQuestions} attempted
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chapter Detail Modal */}
          {selectedChapter && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedChapter.averageScore > 85 ? 'bg-green-100' :
                      selectedChapter.averageScore >= 70 ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      <Book className={`w-6 h-6 ${
                        selectedChapter.averageScore > 85 ? 'text-green-600' :
                        selectedChapter.averageScore >= 70 ? 'text-blue-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedChapter.chapterName}</h3>
                      <p className="text-gray-600">{selectedChapter.subject} • {selectedChapter.chapterId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedChapter(null)}
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
                          <div className="text-2xl font-bold text-blue-900">{selectedChapter.averageScore.toFixed(1)}%</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl">
                          <div className="text-sm text-green-600 font-medium">Pass Rate</div>
                          <div className="text-2xl font-bold text-green-900">{selectedChapter.passRate.toFixed(1)}%</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl">
                          <div className="text-sm text-purple-600 font-medium">Completion</div>
                          <div className="text-2xl font-bold text-purple-900">{selectedChapter.completionRate.toFixed(1)}%</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl">
                          <div className="text-sm text-orange-600 font-medium">Avg. Time</div>
                          <div className="text-2xl font-bold text-orange-900">{selectedChapter.averageTimeSpent}m</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Concept Mastery</h4>
                      <div className="space-y-3">
                        {selectedChapter.conceptMastery.map((concept, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">{concept.concept}:</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-3 bg-gray-200 rounded-full">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-300 ${
                                    concept.masteryLevel >= 80 ? 'bg-green-500' : concept.masteryLevel >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${concept.masteryLevel}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-gray-900 w-12">{concept.masteryLevel.toFixed(0)}%</span>
                              <span className="text-sm text-red-600">({concept.studentsStruggling} struggling)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Distribution</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Easy', value: selectedChapter.difficultyDistribution.easy, fill: DIFFICULTY_COLORS.easy },
                                { name: 'Medium', value: selectedChapter.difficultyDistribution.medium, fill: DIFFICULTY_COLORS.medium },
                                { name: 'Hard', value: selectedChapter.difficultyDistribution.hard, fill: DIFFICULTY_COLORS.hard }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  {/* Insights and Recommendations */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedChapter.performanceTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="testDate" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="averageScore" stroke="#8884d8" name="Average Score" />
                            <Line type="monotone" dataKey="participationRate" stroke="#82ca9d" name="Participation Rate" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-red-900 mb-3">Common Mistakes</h4>
                      <div className="space-y-2">
                        {selectedChapter.commonMistakes.map((mistake, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-red-700">{mistake}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {selectedChapter.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Student Performance Sample</h4>
                      <div className="space-y-3">
                        {selectedChapter.studentPerformance.slice(0, 3).map((student, index) => (
                          <div key={index} className={`p-3 rounded-xl border ${
                            student.status === 'excellent' ? 'border-green-200 bg-green-50' :
                            student.status === 'good' ? 'border-blue-200 bg-blue-50' :
                            student.status === 'needs-improvement' ? 'border-yellow-200 bg-yellow-50' :
                            'border-red-200 bg-red-50'
                          }`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">{student.studentName}</div>
                                <div className="text-sm text-gray-600">{student.studentId}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">{student.score}%</div>
                                <div className="text-sm text-gray-600">{student.timeSpent}min</div>
                              </div>
                            </div>
                          </div>
                        ))}
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