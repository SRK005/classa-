'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, ArrowLeft, Target, User, Download, FileSpreadsheet, BarChart3, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DifficultyData {
  level: string;
  totalQuestions: number;
  averageScore: number;
  averageTime: number; // in seconds
  successRate: number;
  subjectDistribution: {
    Mathematics: number;
    Physics: number;
    Chemistry: number;
    Biology: number;
  };
  performanceTrend: Array<{
    month: string;
    averageScore: number;
    questionsAttempted: number;
  }>;
  topicBreakdown: Array<{
    topic: string;
    questionsCount: number;
    averageScore: number;
    difficulty: string;
  }>;
}

interface QuestionAnalysis {
  questionId: string;
  subject: string;
  topic: string;
  difficulty: string;
  averageScore: number;
  timeSpent: number;
  attemptCount: number;
  correctAnswers: number;
  effectiveness: 'High' | 'Medium' | 'Low';
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
    red: 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/40'
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
        <p className="text-gray-600">Loading difficulty analysis...</p>
      </div>
    </div>
  );
}

function EmptyState() {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm max-w-md">
        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Difficulty Data Available</h3>
        <p className="text-gray-600 mb-6">There are no question difficulty records to display at this time.</p>
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

export default function DifficultyReportPage() {
  const [difficultyData, setDifficultyData] = useState<DifficultyData[]>([]);
  const [questionAnalysis, setQuestionAnalysis] = useState<QuestionAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const router = useRouter();

  // Mock data for demonstration
  useEffect(() => {
    const mockDifficultyData: DifficultyData[] = [
      {
        level: 'Easy',
        totalQuestions: 450,
        averageScore: 82.5,
        averageTime: 45,
        successRate: 88.2,
        subjectDistribution: {
          Mathematics: 120,
          Physics: 110,
          Chemistry: 105,
          Biology: 115
        },
        performanceTrend: [
          { month: 'Sep', averageScore: 80, questionsAttempted: 85 },
          { month: 'Oct', averageScore: 81, questionsAttempted: 92 },
          { month: 'Nov', averageScore: 83, questionsAttempted: 88 },
          { month: 'Dec', averageScore: 84, questionsAttempted: 95 },
          { month: 'Jan', averageScore: 85, questionsAttempted: 90 }
        ],
        topicBreakdown: [
          { topic: 'Basic Algebra', questionsCount: 45, averageScore: 85, difficulty: 'Easy' },
          { topic: 'Simple Geometry', questionsCount: 38, averageScore: 83, difficulty: 'Easy' },
          { topic: 'Basic Physics Laws', questionsCount: 42, averageScore: 80, difficulty: 'Easy' },
          { topic: 'Chemical Formulas', questionsCount: 35, averageScore: 82, difficulty: 'Easy' },
          { topic: 'Cell Structure', questionsCount: 40, averageScore: 84, difficulty: 'Easy' }
        ]
      },
      {
        level: 'Medium',
        totalQuestions: 380,
        averageScore: 68.3,
        averageTime: 75,
        successRate: 72.5,
        subjectDistribution: {
          Mathematics: 95,
          Physics: 98,
          Chemistry: 92,
          Biology: 95
        },
        performanceTrend: [
          { month: 'Sep', averageScore: 65, questionsAttempted: 72 },
          { month: 'Oct', averageScore: 67, questionsAttempted: 78 },
          { month: 'Nov', averageScore: 68, questionsAttempted: 75 },
          { month: 'Dec', averageScore: 70, questionsAttempted: 82 },
          { month: 'Jan', averageScore: 71, questionsAttempted: 80 }
        ],
        topicBreakdown: [
          { topic: 'Quadratic Equations', questionsCount: 32, averageScore: 70, difficulty: 'Medium' },
          { topic: 'Trigonometry', questionsCount: 28, averageScore: 68, difficulty: 'Medium' },
          { topic: 'Thermodynamics', questionsCount: 30, averageScore: 66, difficulty: 'Medium' },
          { topic: 'Organic Reactions', questionsCount: 25, averageScore: 69, difficulty: 'Medium' },
          { topic: 'Genetics', questionsCount: 27, averageScore: 71, difficulty: 'Medium' }
        ]
      },
      {
        level: 'Hard',
        totalQuestions: 220,
        averageScore: 52.8,
        averageTime: 120,
        successRate: 58.3,
        subjectDistribution: {
          Mathematics: 60,
          Physics: 58,
          Chemistry: 52,
          Biology: 50
        },
        performanceTrend: [
          { month: 'Sep', averageScore: 48, questionsAttempted: 45 },
          { month: 'Oct', averageScore: 50, questionsAttempted: 52 },
          { month: 'Nov', averageScore: 53, questionsAttempted: 48 },
          { month: 'Dec', averageScore: 55, questionsAttempted: 55 },
          { month: 'Jan', averageScore: 58, questionsAttempted: 50 }
        ],
        topicBreakdown: [
          { topic: 'Calculus', questionsCount: 18, averageScore: 55, difficulty: 'Hard' },
          { topic: 'Complex Geometry', questionsCount: 15, averageScore: 52, difficulty: 'Hard' },
          { topic: 'Quantum Physics', questionsCount: 16, averageScore: 48, difficulty: 'Hard' },
          { topic: 'Advanced Chemistry', questionsCount: 14, averageScore: 54, difficulty: 'Hard' },
          { topic: 'Molecular Biology', questionsCount: 12, averageScore: 56, difficulty: 'Hard' }
        ]
      }
    ];

    const mockQuestionAnalysis: QuestionAnalysis[] = [
      {
        questionId: 'Q001',
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'Easy',
        averageScore: 85,
        timeSpent: 42,
        attemptCount: 120,
        correctAnswers: 102,
        effectiveness: 'High'
      },
      {
        questionId: 'Q002',
        subject: 'Physics',
        topic: 'Mechanics',
        difficulty: 'Medium',
        averageScore: 68,
        timeSpent: 78,
        attemptCount: 95,
        correctAnswers: 65,
        effectiveness: 'Medium'
      },
      {
        questionId: 'Q003',
        subject: 'Chemistry',
        topic: 'Organic',
        difficulty: 'Hard',
        averageScore: 45,
        timeSpent: 135,
        attemptCount: 60,
        correctAnswers: 27,
        effectiveness: 'Low'
      },
      {
        questionId: 'Q004',
        subject: 'Biology',
        topic: 'Genetics',
        difficulty: 'Medium',
        averageScore: 72,
        timeSpent: 65,
        attemptCount: 88,
        correctAnswers: 63,
        effectiveness: 'High'
      },
      {
        questionId: 'Q005',
        subject: 'Mathematics',
        topic: 'Calculus',
        difficulty: 'Hard',
        averageScore: 52,
        timeSpent: 145,
        attemptCount: 45,
        correctAnswers: 23,
        effectiveness: 'Medium'
      }
    ];

    setTimeout(() => {
      setDifficultyData(mockDifficultyData);
      setQuestionAnalysis(mockQuestionAnalysis);
      setLoading(false);
    }, 1000);
  }, []);

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'hard': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness.toLowerCase()) {
      case 'high': return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
      case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle };
      case 'low': return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Target };
    }
  };

  const overallStats = {
    totalQuestions: difficultyData.reduce((sum, d) => sum + d.totalQuestions, 0),
    averageScore: difficultyData.reduce((sum, d) => sum + (d.averageScore * d.totalQuestions), 0) / difficultyData.reduce((sum, d) => sum + d.totalQuestions, 0) || 0,
    averageTime: difficultyData.reduce((sum, d) => sum + (d.averageTime * d.totalQuestions), 0) / difficultyData.reduce((sum, d) => sum + d.totalQuestions, 0) || 0,
    overallSuccessRate: difficultyData.reduce((sum, d) => sum + (d.successRate * d.totalQuestions), 0) / difficultyData.reduce((sum, d) => sum + d.totalQuestions, 0) || 0
  };

  const difficultyDistribution = difficultyData.map(d => ({
    name: d.level,
    value: d.totalQuestions,
    percentage: (d.totalQuestions / overallStats.totalQuestions * 100).toFixed(1),
    color: d.level === 'Easy' ? '#22c55e' : d.level === 'Medium' ? '#f59e0b' : '#ef4444'
  }));

  const performanceComparison = difficultyData.map(d => ({
    difficulty: d.level,
    averageScore: d.averageScore,
    successRate: d.successRate,
    averageTime: d.averageTime
  }));

  const subjectDifficultyData = [
    {
      subject: 'Mathematics',
      Easy: difficultyData.find(d => d.level === 'Easy')?.subjectDistribution.Mathematics || 0,
      Medium: difficultyData.find(d => d.level === 'Medium')?.subjectDistribution.Mathematics || 0,
      Hard: difficultyData.find(d => d.level === 'Hard')?.subjectDistribution.Mathematics || 0
    },
    {
      subject: 'Physics',
      Easy: difficultyData.find(d => d.level === 'Easy')?.subjectDistribution.Physics || 0,
      Medium: difficultyData.find(d => d.level === 'Medium')?.subjectDistribution.Physics || 0,
      Hard: difficultyData.find(d => d.level === 'Hard')?.subjectDistribution.Physics || 0
    },
    {
      subject: 'Chemistry',
      Easy: difficultyData.find(d => d.level === 'Easy')?.subjectDistribution.Chemistry || 0,
      Medium: difficultyData.find(d => d.level === 'Medium')?.subjectDistribution.Chemistry || 0,
      Hard: difficultyData.find(d => d.level === 'Hard')?.subjectDistribution.Chemistry || 0
    },
    {
      subject: 'Biology',
      Easy: difficultyData.find(d => d.level === 'Easy')?.subjectDistribution.Biology || 0,
      Medium: difficultyData.find(d => d.level === 'Medium')?.subjectDistribution.Biology || 0,
      Hard: difficultyData.find(d => d.level === 'Hard')?.subjectDistribution.Biology || 0
    }
  ];

  if (loading) return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <LoadingState />
      </main>
    </div>
  );

  if (difficultyData.length === 0) return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <EmptyState />
      </main>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Difficulty Analysis Report</h1>
            <p className="text-gray-600">Comprehensive analysis of question difficulty levels and performance patterns</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
            <button className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors">
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </button>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Questions"
              value={overallStats.totalQuestions.toLocaleString()}
              icon={<BookOpen className="w-6 h-6" />}
              color="blue"
              subtitle="Across all difficulty levels"
              trend={{ value: 8.5, isPositive: true }}
            />
            <KPICard
              title="Average Score"
              value={`${overallStats.averageScore.toFixed(1)}%`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
              subtitle="Overall performance"
              trend={{ value: 3.2, isPositive: true }}
            />
            <KPICard
              title="Average Time"
              value={`${Math.round(overallStats.averageTime)}s`}
              icon={<Target className="w-6 h-6" />}
              color="purple"
              subtitle="Per question"
              trend={{ value: 2.1, isPositive: false }}
            />
            <KPICard
              title="Success Rate"
              value={`${overallStats.overallSuccessRate.toFixed(1)}%`}
              icon={<Award className="w-6 h-6" />}
              color="orange"
              subtitle="Questions answered correctly"
              trend={{ value: 4.7, isPositive: true }}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Difficulty Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Question Difficulty Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Performance by Difficulty */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance by Difficulty Level</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="difficulty" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="averageScore" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Average Score (%)" />
                  <Bar dataKey="successRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Success Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject-wise Difficulty Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Subject-wise Difficulty Distribution</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={subjectDifficultyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="Easy" stackId="a" fill="#22c55e" name="Easy" />
                <Bar dataKey="Medium" stackId="a" fill="#f59e0b" name="Medium" />
                <Bar dataKey="Hard" stackId="a" fill="#ef4444" name="Hard" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Difficulty Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {difficultyData.map((difficulty, index) => {
              const colors = getDifficultyColor(difficulty.level);
              return (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{difficulty.level}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
                      {difficulty.totalQuestions} Questions
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-gray-600 text-sm">Avg Score</div>
                      <div className={`text-xl font-bold ${difficulty.averageScore >= 70 ? 'text-green-600' : difficulty.averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {difficulty.averageScore.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-gray-600 text-sm">Success Rate</div>
                      <div className="text-xl font-bold text-gray-900">{difficulty.successRate.toFixed(1)}%</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-gray-600 text-sm">Avg Time</div>
                      <div className="text-xl font-bold text-gray-900">{difficulty.averageTime}s</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-gray-600 text-sm">Questions</div>
                      <div className="text-xl font-bold text-gray-900">{difficulty.totalQuestions}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Performance Level</span>
                      <span>{difficulty.averageScore.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          difficulty.averageScore >= 70 ? 'bg-green-500' : 
                          difficulty.averageScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${difficulty.averageScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    Most questions in: {Object.entries(difficulty.subjectDistribution)
                      .sort(([,a], [,b]) => b - a)[0][0]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Question Analysis Table */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Individual Question Analysis</h3>
              <div className="flex gap-2">
                <select 
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Question ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Topic</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Difficulty</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Avg Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Time Spent</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Attempts</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Effectiveness</th>
                  </tr>
                </thead>
                <tbody>
                  {questionAnalysis
                    .filter(q => selectedDifficulty === 'all' || q.difficulty === selectedDifficulty)
                    .map((question, index) => {
                      const difficultyColors = getDifficultyColor(question.difficulty);
                      const effectivenessColors = getEffectivenessColor(question.effectiveness);
                      const EffectivenessIcon = effectivenessColors.icon;
                      
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-blue-600">{question.questionId}</td>
                          <td className="py-3 px-4 text-gray-900">{question.subject}</td>
                          <td className="py-3 px-4 text-gray-600">{question.topic}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficultyColors.bg} ${difficultyColors.text}`}>
                              {question.difficulty}
                            </span>
                          </td>
                          <td className={`py-3 px-4 font-semibold ${
                            question.averageScore >= 70 ? 'text-green-600' : 
                            question.averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {question.averageScore}%
                          </td>
                          <td className="py-3 px-4 text-gray-600">{question.timeSpent}s</td>
                          <td className="py-3 px-4 text-gray-600">{question.attemptCount}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <EffectivenessIcon className={`w-4 h-4 ${effectivenessColors.text}`} />
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${effectivenessColors.bg} ${effectivenessColors.text}`}>
                                {question.effectiveness}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}