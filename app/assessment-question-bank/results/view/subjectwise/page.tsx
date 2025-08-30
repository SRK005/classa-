'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, ArrowLeft, Target, User, Download, FileSpreadsheet, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubjectData {
  subject: string;
  totalTests: number;
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  performanceTrend: Array<{
    month: string;
    averageScore: number;
    testsCount: number;
  }>;
  topicPerformance: Array<{
    topic: string;
    averageScore: number;
    questionsCount: number;
  }>;
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function KPICard({ title, value, icon, color, subtitle }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/40',
    green: 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/40',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/40',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/40'
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
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading subject data...</p>
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subject Data Available</h3>
        <p className="text-gray-600 mb-6">There are no subject performance records to display at this time.</p>
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

export default function SubjectwiseReportPage() {
  const [subjectsData, setSubjectsData] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const router = useRouter();

  // Mock data for demonstration
  useEffect(() => {
    const mockData: SubjectData[] = [
      {
        subject: 'Mathematics',
        totalTests: 15,
        totalStudents: 120,
        averageScore: 78.5,
        highestScore: 98,
        lowestScore: 45,
        passRate: 85.5,
        difficultyDistribution: {
          easy: 40,
          medium: 45,
          hard: 15
        },
        performanceTrend: [
          { month: 'Sep', averageScore: 72, testsCount: 3 },
          { month: 'Oct', averageScore: 75, testsCount: 4 },
          { month: 'Nov', averageScore: 78, testsCount: 4 },
          { month: 'Dec', averageScore: 80, testsCount: 2 },
          { month: 'Jan', averageScore: 82, testsCount: 2 }
        ],
        topicPerformance: [
          { topic: 'Algebra', averageScore: 85, questionsCount: 45 },
          { topic: 'Geometry', averageScore: 78, questionsCount: 38 },
          { topic: 'Trigonometry', averageScore: 72, questionsCount: 32 },
          { topic: 'Statistics', averageScore: 80, questionsCount: 25 },
          { topic: 'Calculus', averageScore: 68, questionsCount: 20 }
        ]
      },
      {
        subject: 'Physics',
        totalTests: 12,
        totalStudents: 118,
        averageScore: 74.2,
        highestScore: 95,
        lowestScore: 38,
        passRate: 78.8,
        difficultyDistribution: {
          easy: 35,
          medium: 50,
          hard: 15
        },
        performanceTrend: [
          { month: 'Sep', averageScore: 70, testsCount: 2 },
          { month: 'Oct', averageScore: 72, testsCount: 3 },
          { month: 'Nov', averageScore: 75, testsCount: 3 },
          { month: 'Dec', averageScore: 76, testsCount: 2 },
          { month: 'Jan', averageScore: 78, testsCount: 2 }
        ],
        topicPerformance: [
          { topic: 'Mechanics', averageScore: 80, questionsCount: 40 },
          { topic: 'Thermodynamics', averageScore: 75, questionsCount: 30 },
          { topic: 'Optics', averageScore: 70, questionsCount: 28 },
          { topic: 'Electricity', averageScore: 72, questionsCount: 35 },
          { topic: 'Modern Physics', averageScore: 68, questionsCount: 22 }
        ]
      },
      {
        subject: 'Chemistry',
        totalTests: 10,
        totalStudents: 115,
        averageScore: 71.8,
        highestScore: 92,
        lowestScore: 42,
        passRate: 76.5,
        difficultyDistribution: {
          easy: 38,
          medium: 47,
          hard: 15
        },
        performanceTrend: [
          { month: 'Sep', averageScore: 68, testsCount: 2 },
          { month: 'Oct', averageScore: 70, testsCount: 2 },
          { month: 'Nov', averageScore: 72, testsCount: 3 },
          { month: 'Dec', averageScore: 74, testsCount: 2 },
          { month: 'Jan', averageScore: 75, testsCount: 1 }
        ],
        topicPerformance: [
          { topic: 'Organic Chemistry', averageScore: 75, questionsCount: 35 },
          { topic: 'Inorganic Chemistry', averageScore: 72, questionsCount: 32 },
          { topic: 'Physical Chemistry', averageScore: 68, questionsCount: 28 },
          { topic: 'Environmental Chemistry', averageScore: 78, questionsCount: 20 },
          { topic: 'Analytical Chemistry', averageScore: 70, questionsCount: 15 }
        ]
      },
      {
        subject: 'Biology',
        totalTests: 8,
        totalStudents: 110,
        averageScore: 76.3,
        highestScore: 96,
        lowestScore: 48,
        passRate: 82.7,
        difficultyDistribution: {
          easy: 42,
          medium: 43,
          hard: 15
        },
        performanceTrend: [
          { month: 'Sep', averageScore: 73, testsCount: 2 },
          { month: 'Oct', averageScore: 75, testsCount: 2 },
          { month: 'Nov', averageScore: 77, testsCount: 2 },
          { month: 'Dec', averageScore: 78, testsCount: 1 },
          { month: 'Jan', averageScore: 80, testsCount: 1 }
        ],
        topicPerformance: [
          { topic: 'Cell Biology', averageScore: 82, questionsCount: 25 },
          { topic: 'Genetics', averageScore: 78, questionsCount: 22 },
          { topic: 'Ecology', averageScore: 75, questionsCount: 20 },
          { topic: 'Human Physiology', averageScore: 74, questionsCount: 28 },
          { topic: 'Plant Biology', averageScore: 72, questionsCount: 18 }
        ]
      }
    ];

    setTimeout(() => {
      setSubjectsData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const getPerformanceBand = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { label: 'At-Risk', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const overallStats = {
    totalSubjects: subjectsData.length,
    averageScore: subjectsData.reduce((sum, subject) => sum + subject.averageScore, 0) / subjectsData.length || 0,
    totalTests: subjectsData.reduce((sum, subject) => sum + subject.totalTests, 0),
    overallPassRate: subjectsData.reduce((sum, subject) => sum + subject.passRate, 0) / subjectsData.length || 0
  };

  const subjectComparison = subjectsData.map(subject => ({
    subject: subject.subject,
    averageScore: subject.averageScore,
    passRate: subject.passRate
  }));

  const difficultyData = [
    { 
      name: 'Easy', 
      value: subjectsData.reduce((sum, s) => sum + s.difficultyDistribution.easy, 0) / subjectsData.length || 0,
      color: '#22c55e' 
    },
    { 
      name: 'Medium', 
      value: subjectsData.reduce((sum, s) => sum + s.difficultyDistribution.medium, 0) / subjectsData.length || 0,
      color: '#f59e0b' 
    },
    { 
      name: 'Hard', 
      value: subjectsData.reduce((sum, s) => sum + s.difficultyDistribution.hard, 0) / subjectsData.length || 0,
      color: '#ef4444' 
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

  if (subjectsData.length === 0) return (
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subject-wise Performance Report</h1>
            <p className="text-gray-600">Subject-specific performance analysis and trends</p>
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
              title="Total Subjects"
              value={overallStats.totalSubjects}
              icon={<BookOpen className="w-6 h-6" />}
              color="blue"
              subtitle="Active subjects"
            />
            <KPICard
              title="Average Score"
              value={`${overallStats.averageScore.toFixed(1)}%`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
              subtitle="Overall performance"
            />
            <KPICard
              title="Total Tests"
              value={overallStats.totalTests}
              icon={<Target className="w-6 h-6" />}
              color="purple"
              subtitle="Assessments conducted"
            />
            <KPICard
              title="Pass Rate"
              value={`${overallStats.overallPassRate.toFixed(1)}%`}
              icon={<Award className="w-6 h-6" />}
              color="orange"
              subtitle="Success rate"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Subject Performance Comparison */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Subject Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectComparison}>
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
                  <Bar dataKey="averageScore" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={25} name="Average Score" />
                  <Bar dataKey="passRate" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={25} name="Pass Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Difficulty Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Question Difficulty Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value != null ? value.toFixed(1) : '0.0'}%`}
                  >
                    {difficultyData.map((entry, index) => (
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
          </div>

          {/* Subject Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {subjectsData.map((subject, index) => {
              const performanceBand = getPerformanceBand(subject.averageScore);
              return (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{subject.subject}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${performanceBand.bg} ${performanceBand.color}`}>
                      {performanceBand.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-gray-600 text-sm">Tests Conducted</div>
                      <div className="text-xl font-bold text-gray-900">{subject.totalTests}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-gray-600 text-sm">Students</div>
                      <div className="text-xl font-bold text-gray-900">{subject.totalStudents}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-gray-600 text-sm">Average Score</div>
                      <div className={`text-xl font-bold ${performanceBand.color}`}>{subject.averageScore.toFixed(1)}%</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-gray-600 text-sm">Pass Rate</div>
                      <div className="text-xl font-bold text-gray-900">{subject.passRate.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Performance Progress</span>
                      <span>{subject.averageScore.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${performanceBand.color.includes('green') ? 'bg-green-500' : performanceBand.color.includes('blue') ? 'bg-blue-500' : 'bg-red-500'}`}
                        style={{ width: `${subject.averageScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Range: {subject.lowestScore}% - {subject.highestScore}%
                    </div>
                    <button
                      onClick={() => setSelectedSubject(subject)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subject Detail Modal */}
          {selectedSubject && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedSubject.subject} - Detailed Analysis</h3>
                    <button
                      onClick={() => setSelectedSubject(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {/* Subject KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-blue-600 text-sm font-medium">Total Tests</div>
                      <div className="text-2xl font-bold text-blue-900">{selectedSubject.totalTests}</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-green-600 text-sm font-medium">Average Score</div>
                      <div className="text-2xl font-bold text-green-900">{selectedSubject.averageScore.toFixed(1)}%</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-purple-600 text-sm font-medium">Students</div>
                      <div className="text-2xl font-bold text-purple-900">{selectedSubject.totalStudents}</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="text-orange-600 text-sm font-medium">Pass Rate</div>
                      <div className="text-2xl font-bold text-orange-900">{selectedSubject.passRate.toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* Performance Trend Chart */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend Over Time</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={selectedSubject.performanceTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="averageScore" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Average Score" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Topic Performance */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Topic-wise Performance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedSubject.topicPerformance.map((topic, index) => {
                        const band = getPerformanceBand(topic.averageScore);
                        return (
                          <div key={index} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-900">{topic.topic}</div>
                              <span className={`text-sm font-medium ${band.color}`}>
                                {topic.averageScore}%
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{topic.questionsCount} questions</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${band.color.includes('green') ? 'bg-green-500' : band.color.includes('blue') ? 'bg-blue-500' : 'bg-red-500'}`}
                                style={{ width: `${topic.averageScore}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}