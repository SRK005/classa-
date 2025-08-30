'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, ArrowLeft, Target, User, Download, FileSpreadsheet, BarChart3, AlertTriangle, Star, Trophy, TrendingDown, Clock, Brain, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StudentPerformance {
  studentId: string;
  studentName: string;
  overallScore: number;
  averageScore: number;
  testsCompleted: number;
  totalTests: number;
  completionRate: number;
  consistencyScore: number;
  improvementTrend: number;
  lastTestScore: number;
  subjectScores: {
    Mathematics: number;
    Physics: number;
    Chemistry: number;
    Biology: number;
  };
  performanceHistory: Array<{
    testName: string;
    score: number;
    date: string;
    subject: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  riskFactors: string[];
  recommendations: string[];
  category: 'top-performer' | 'at-risk' | 'average';
  attendanceRate: number;
  timeSpentStudying: number; // hours per week
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
            <span>{Math.abs(trend.value)}% vs last month</span>
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
        <p className="text-gray-600">Loading performance analysis...</p>
      </div>
    </div>
  );
}

function EmptyState() {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm max-w-md">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Performance Data Available</h3>
        <p className="text-gray-600 mb-6">There are no student performance records to analyze at this time.</p>
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

export default function TopPerformersAtRiskPage() {
  const [studentsData, setStudentsData] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformance | null>(null);
  const [activeTab, setActiveTab] = useState<'top-performers' | 'at-risk' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'trend'>('score');
  const router = useRouter();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
  const CATEGORY_COLORS = {
    'top-performer': '#10B981',
    'at-risk': '#EF4444',
    'average': '#6B7280'
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockStudentsData: StudentPerformance[] = [
      {
        studentId: 'STU001',
        studentName: 'Alice Johnson',
        overallScore: 92.5,
        averageScore: 91.2,
        testsCompleted: 15,
        totalTests: 16,
        completionRate: 93.8,
        consistencyScore: 88.5,
        improvementTrend: 8.2,
        lastTestScore: 95,
        subjectScores: {
          Mathematics: 94,
          Physics: 91,
          Chemistry: 89,
          Biology: 93
        },
        performanceHistory: [
          { testName: 'Math Quiz 1', score: 88, date: '2024-01-15', subject: 'Mathematics' },
          { testName: 'Physics Test', score: 92, date: '2024-01-20', subject: 'Physics' },
          { testName: 'Chemistry Lab', score: 89, date: '2024-01-25', subject: 'Chemistry' },
          { testName: 'Biology Exam', score: 95, date: '2024-01-30', subject: 'Biology' }
        ],
        strengths: ['Problem Solving', 'Analytical Thinking', 'Consistent Performance'],
        weaknesses: ['Time Management in Complex Problems'],
        riskFactors: [],
        recommendations: ['Advanced Problem Sets', 'Peer Tutoring Opportunities'],
        category: 'top-performer',
        attendanceRate: 98.5,
        timeSpentStudying: 12
      },
      {
        studentId: 'STU002',
        studentName: 'Bob Smith',
        overallScore: 45.2,
        averageScore: 48.7,
        testsCompleted: 8,
        totalTests: 16,
        completionRate: 50.0,
        consistencyScore: 35.2,
        improvementTrend: -12.5,
        lastTestScore: 42,
        subjectScores: {
          Mathematics: 38,
          Physics: 45,
          Chemistry: 52,
          Biology: 48
        },
        performanceHistory: [
          { testName: 'Math Quiz 1', score: 55, date: '2024-01-15', subject: 'Mathematics' },
          { testName: 'Physics Test', score: 48, date: '2024-01-20', subject: 'Physics' },
          { testName: 'Chemistry Lab', score: 52, date: '2024-01-25', subject: 'Chemistry' },
          { testName: 'Biology Exam', score: 42, date: '2024-01-30', subject: 'Biology' }
        ],
        strengths: ['Chemistry Understanding'],
        weaknesses: ['Mathematical Foundations', 'Study Habits', 'Test Anxiety'],
        riskFactors: ['Low Completion Rate', 'Declining Trend', 'Poor Attendance'],
        recommendations: ['Additional Tutoring', 'Study Skills Workshop', 'Counseling Support'],
        category: 'at-risk',
        attendanceRate: 72.3,
        timeSpentStudying: 3
      },
      {
        studentId: 'STU003',
        studentName: 'Carol Davis',
        overallScore: 88.7,
        averageScore: 87.3,
        testsCompleted: 14,
        totalTests: 16,
        completionRate: 87.5,
        consistencyScore: 85.1,
        improvementTrend: 5.8,
        lastTestScore: 91,
        subjectScores: {
          Mathematics: 85,
          Physics: 89,
          Chemistry: 88,
          Biology: 90
        },
        performanceHistory: [
          { testName: 'Math Quiz 1', score: 82, date: '2024-01-15', subject: 'Mathematics' },
          { testName: 'Physics Test', score: 89, date: '2024-01-20', subject: 'Physics' },
          { testName: 'Chemistry Lab', score: 88, date: '2024-01-25', subject: 'Chemistry' },
          { testName: 'Biology Exam', score: 91, date: '2024-01-30', subject: 'Biology' }
        ],
        strengths: ['Consistent Performance', 'Well-Rounded Knowledge'],
        weaknesses: ['Mathematical Speed'],
        riskFactors: [],
        recommendations: ['Advanced Placement Courses', 'Leadership Opportunities'],
        category: 'top-performer',
        attendanceRate: 95.2,
        timeSpentStudying: 10
      },
      {
        studentId: 'STU004',
        studentName: 'David Wilson',
        overallScore: 52.8,
        averageScore: 54.2,
        testsCompleted: 9,
        totalTests: 16,
        completionRate: 56.3,
        consistencyScore: 42.7,
        improvementTrend: -8.3,
        lastTestScore: 48,
        subjectScores: {
          Mathematics: 45,
          Physics: 58,
          Chemistry: 55,
          Biology: 53
        },
        performanceHistory: [
          { testName: 'Math Quiz 1', score: 62, date: '2024-01-15', subject: 'Mathematics' },
          { testName: 'Physics Test', score: 58, date: '2024-01-20', subject: 'Physics' },
          { testName: 'Chemistry Lab', score: 55, date: '2024-01-25', subject: 'Chemistry' },
          { testName: 'Biology Exam', score: 48, date: '2024-01-30', subject: 'Biology' }
        ],
        strengths: ['Physics Concepts'],
        weaknesses: ['Mathematical Skills', 'Study Consistency'],
        riskFactors: ['Declining Performance', 'Low Completion Rate'],
        recommendations: ['Math Remediation', 'Study Schedule Planning'],
        category: 'at-risk',
        attendanceRate: 78.9,
        timeSpentStudying: 4
      },
      {
        studentId: 'STU005',
        studentName: 'Emma Brown',
        overallScore: 94.3,
        averageScore: 93.8,
        testsCompleted: 16,
        totalTests: 16,
        completionRate: 100.0,
        consistencyScore: 92.4,
        improvementTrend: 12.1,
        lastTestScore: 98,
        subjectScores: {
          Mathematics: 96,
          Physics: 93,
          Chemistry: 92,
          Biology: 95
        },
        performanceHistory: [
          { testName: 'Math Quiz 1', score: 94, date: '2024-01-15', subject: 'Mathematics' },
          { testName: 'Physics Test', score: 93, date: '2024-01-20', subject: 'Physics' },
          { testName: 'Chemistry Lab', score: 92, date: '2024-01-25', subject: 'Chemistry' },
          { testName: 'Biology Exam', score: 98, date: '2024-01-30', subject: 'Biology' }
        ],
        strengths: ['Exceptional Performance', 'Perfect Attendance', 'Strong Work Ethic'],
        weaknesses: [],
        riskFactors: [],
        recommendations: ['Academic Competitions', 'Research Projects', 'Mentoring Others'],
        category: 'top-performer',
        attendanceRate: 100.0,
        timeSpentStudying: 15
      },
      {
        studentId: 'STU006',
        studentName: 'Frank Miller',
        overallScore: 38.9,
        averageScore: 41.2,
        testsCompleted: 6,
        totalTests: 16,
        completionRate: 37.5,
        consistencyScore: 28.3,
        improvementTrend: -15.7,
        lastTestScore: 35,
        subjectScores: {
          Mathematics: 32,
          Physics: 41,
          Chemistry: 45,
          Biology: 38
        },
        performanceHistory: [
          { testName: 'Math Quiz 1', score: 48, date: '2024-01-15', subject: 'Mathematics' },
          { testName: 'Physics Test', score: 41, date: '2024-01-20', subject: 'Physics' },
          { testName: 'Chemistry Lab', score: 45, date: '2024-01-25', subject: 'Chemistry' },
          { testName: 'Biology Exam', score: 35, date: '2024-01-30', subject: 'Biology' }
        ],
        strengths: ['Chemistry Interest'],
        weaknesses: ['Basic Concepts', 'Attendance Issues', 'Motivation'],
        riskFactors: ['Very Low Completion Rate', 'Severe Declining Trend', 'Poor Attendance'],
        recommendations: ['Intensive Support Program', 'Counseling', 'Parent Conference'],
        category: 'at-risk',
        attendanceRate: 58.7,
        timeSpentStudying: 2
      }
    ];

    setTimeout(() => {
      setStudentsData(mockStudentsData);
      setLoading(false);
    }, 1000);
  }, []);

  const topPerformers = studentsData.filter(student => student.category === 'top-performer');
  const atRiskStudents = studentsData.filter(student => student.category === 'at-risk');
  const averageStudents = studentsData.filter(student => student.category === 'average');

  const filteredStudents = studentsData.filter(student => {
    const matchesTab = activeTab === 'all' || student.category === activeTab.replace('-', '-');
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.overallScore - a.overallScore;
      case 'name':
        return a.studentName.localeCompare(b.studentName);
      case 'trend':
        return b.improvementTrend - a.improvementTrend;
      default:
        return 0;
    }
  });

  const performanceDistribution = [
    { name: 'Top Performers', value: topPerformers.length, color: CATEGORY_COLORS['top-performer'] },
    { name: 'At Risk', value: atRiskStudents.length, color: CATEGORY_COLORS['at-risk'] },
    { name: 'Average', value: averageStudents.length, color: CATEGORY_COLORS['average'] }
  ];

  const averageScoreByCategory = [
    { category: 'Top Performers', averageScore: topPerformers.reduce((sum, s) => sum + s.overallScore, 0) / topPerformers.length || 0 },
    { category: 'At Risk', averageScore: atRiskStudents.reduce((sum, s) => sum + s.overallScore, 0) / atRiskStudents.length || 0 },
    { category: 'Average', averageScore: averageStudents.reduce((sum, s) => sum + s.overallScore, 0) / averageStudents.length || 0 }
  ];

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

  if (studentsData.length === 0) {
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
                <h1 className="text-3xl font-bold text-gray-900">Top Performers & At-Risk Students</h1>
                <p className="text-gray-600 mt-1">Performance analysis and intervention insights</p>
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
              title="Top Performers"
              value={topPerformers.length}
              icon={<Trophy className="w-6 h-6" />}
              color="green"
              subtitle={`${((topPerformers.length / studentsData.length) * 100).toFixed(1)}% of students`}
            />
            <KPICard
              title="At-Risk Students"
              value={atRiskStudents.length}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="red"
              subtitle={`${((atRiskStudents.length / studentsData.length) * 100).toFixed(1)}% need support`}
            />
            <KPICard
              title="Average Class Score"
              value={`${(studentsData.reduce((sum, s) => sum + s.overallScore, 0) / studentsData.length).toFixed(1)}%`}
              icon={<Target className="w-6 h-6" />}
              color="blue"
              trend={{ value: 2.3, isPositive: true }}
            />
            <KPICard
              title="Completion Rate"
              value={`${(studentsData.reduce((sum, s) => sum + s.completionRate, 0) / studentsData.length).toFixed(1)}%`}
              icon={<CheckCircle className="w-6 h-6" />}
              color="purple"
              trend={{ value: 1.8, isPositive: true }}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Student Performance Distribution</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average Scores by Category */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Average Scores by Category</h3>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={averageScoreByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averageScore" fill="#8884d8" name="Average Score (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Students ({studentsData.length})
                </button>
                <button
                  onClick={() => setActiveTab('top-performers')}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    activeTab === 'top-performers' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Top Performers ({topPerformers.length})
                </button>
                <button
                  onClick={() => setActiveTab('at-risk')}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    activeTab === 'at-risk' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  At Risk ({atRiskStudents.length})
                </button>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'trend')}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="score">Sort by Score</option>
                  <option value="name">Sort by Name</option>
                  <option value="trend">Sort by Trend</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Student Performance Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <div key={student.studentId} 
                     className={`border-2 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer ${
                       student.category === 'top-performer' ? 'border-green-200 bg-green-50/30' :
                       student.category === 'at-risk' ? 'border-red-200 bg-red-50/30' :
                       'border-gray-200 bg-gray-50/30'
                     }`}
                     onClick={() => setSelectedStudent(student)}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        student.category === 'top-performer' ? 'bg-green-100' :
                        student.category === 'at-risk' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {student.category === 'top-performer' ? 
                          <Trophy className="w-5 h-5 text-green-600" /> :
                          student.category === 'at-risk' ? 
                          <AlertTriangle className="w-5 h-5 text-red-600" /> :
                          <User className="w-5 h-5 text-gray-600" />
                        }
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{student.studentName}</h4>
                        <p className="text-sm text-gray-600">{student.studentId}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      student.category === 'top-performer' ? 'bg-green-100 text-green-800' :
                      student.category === 'at-risk' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {student.category === 'top-performer' ? 'Top Performer' :
                       student.category === 'at-risk' ? 'At Risk' : 'Average'}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall Score:</span>
                      <span className="font-bold text-lg">{student.overallScore.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion Rate:</span>
                      <span className="font-medium">{student.completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Trend:</span>
                      <div className={`flex items-center gap-1 ${
                        student.improvementTrend > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {student.improvementTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="font-medium">{Math.abs(student.improvementTrend).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Attendance:</span>
                      <span className="font-medium">{student.attendanceRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  {student.riskFactors.length > 0 && (
                    <div className="border-t border-red-200 pt-3">
                      <div className="text-xs text-red-600 font-medium mb-1">Risk Factors:</div>
                      <div className="text-xs text-red-700">
                        {student.riskFactors.slice(0, 2).join(', ')}
                        {student.riskFactors.length > 2 && '...'}
                      </div>
                    </div>
                  )}
                  
                  {student.strengths.length > 0 && student.category === 'top-performer' && (
                    <div className="border-t border-green-200 pt-3">
                      <div className="text-xs text-green-600 font-medium mb-1">Strengths:</div>
                      <div className="text-xs text-green-700">
                        {student.strengths.slice(0, 2).join(', ')}
                        {student.strengths.length > 2 && '...'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Student Detail Modal */}
          {selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedStudent.category === 'top-performer' ? 'bg-green-100' :
                      selectedStudent.category === 'at-risk' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {selectedStudent.category === 'top-performer' ? 
                        <Trophy className="w-6 h-6 text-green-600" /> :
                        selectedStudent.category === 'at-risk' ? 
                        <AlertTriangle className="w-6 h-6 text-red-600" /> :
                        <User className="w-6 h-6 text-gray-600" />
                      }
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.studentName}</h3>
                      <p className="text-gray-600">{selectedStudent.studentId} • {selectedStudent.category === 'top-performer' ? 'Top Performer' : selectedStudent.category === 'at-risk' ? 'At Risk Student' : 'Average Student'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
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
                          <div className="text-sm text-blue-600 font-medium">Overall Score</div>
                          <div className="text-2xl font-bold text-blue-900">{selectedStudent.overallScore.toFixed(1)}%</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl">
                          <div className="text-sm text-green-600 font-medium">Completion Rate</div>
                          <div className="text-2xl font-bold text-green-900">{selectedStudent.completionRate.toFixed(1)}%</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl">
                          <div className="text-sm text-purple-600 font-medium">Consistency</div>
                          <div className="text-2xl font-bold text-purple-900">{selectedStudent.consistencyScore.toFixed(1)}%</div>
                        </div>
                        <div className={`p-4 rounded-xl ${
                          selectedStudent.improvementTrend > 0 ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          <div className={`text-sm font-medium ${
                            selectedStudent.improvementTrend > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>Trend</div>
                          <div className={`text-2xl font-bold flex items-center gap-1 ${
                            selectedStudent.improvementTrend > 0 ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {selectedStudent.improvementTrend > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            {Math.abs(selectedStudent.improvementTrend).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h4>
                      <div className="space-y-3">
                        {Object.entries(selectedStudent.subjectScores).map(([subject, score]) => (
                          <div key={subject} className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">{subject}:</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-3 bg-gray-200 rounded-full">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-300 ${
                                    score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-gray-900 w-12">{score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Insights and Recommendations */}
                  <div className="space-y-6">
                    {selectedStudent.strengths.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Strengths</h4>
                        <div className="space-y-2">
                          {selectedStudent.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-gray-700">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedStudent.weaknesses.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Areas for Improvement</h4>
                        <div className="space-y-2">
                          {selectedStudent.weaknesses.map((weakness, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-700">{weakness}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedStudent.riskFactors.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-red-900 mb-3">Risk Factors</h4>
                        <div className="space-y-2">
                          {selectedStudent.riskFactors.map((risk, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span className="text-red-700">{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {selectedStudent.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="text-sm text-gray-600 font-medium">Attendance Rate</div>
                        <div className="text-xl font-bold text-gray-900">{selectedStudent.attendanceRate.toFixed(1)}%</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="text-sm text-gray-600 font-medium">Study Hours/Week</div>
                        <div className="text-xl font-bold text-gray-900">{selectedStudent.timeSpentStudying}h</div>
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