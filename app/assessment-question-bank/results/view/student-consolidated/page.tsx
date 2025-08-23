'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, ArrowLeft, Target, User, Download, FileSpreadsheet, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StudentData {
  id: string;
  name: string;
  class: string;
  totalTests: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  recentTests: Array<{
    testName: string;
    score: number;
    date: string;
    subject: string;
  }>;
  subjectPerformance: Array<{
    subject: string;
    averageScore: number;
    testsCount: number;
  }>;
  performanceTrend: Array<{
    date: string;
    score: number;
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
        <p className="text-gray-600">Loading student data...</p>
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Student Data Available</h3>
        <p className="text-gray-600 mb-6">There are no student records to display at this time.</p>
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

export default function StudentConsolidatedPage() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const router = useRouter();

  // Mock data for demonstration
  useEffect(() => {
    const mockData: StudentData[] = [
      {
        id: 'STU001',
        name: 'Sanjay',
        class: 'Class ',
        totalTests: 12,
        averageScore: 85.5,
        highestScore: 98,
        lowestScore: 72,
        passRate: 100,
        recentTests: [
          { testName: 'Physics Mid-term', score: 92, date: '2024-01-15', subject: 'Physics' },
          { testName: 'Chemistry Quiz', score: 88, date: '2024-01-12', subject: 'Chemistry' },
          { testName: 'Math Test', score: 95, date: '2024-01-10', subject: 'Mathematics' },
          { testName: 'Biology Assessment', score: 78, date: '2024-01-08', subject: 'Biology' }
        ],
        subjectPerformance: [
          { subject: 'Mathematics', averageScore: 92, testsCount: 4 },
          { subject: 'Physics', averageScore: 88, testsCount: 3 },
          { subject: 'Chemistry', averageScore: 85, testsCount: 3 },
          { subject: 'Biology', averageScore: 82, testsCount: 2 }
        ],
        performanceTrend: [
          { date: '2023-12-01', score: 78 },
          { date: '2023-12-15', score: 82 },
          { date: '2024-01-01', score: 85 },
          { date: '2024-01-15', score: 88 },
          { date: '2024-01-30', score: 92 }
        ]
      },
      {
        id: 'STU002',
        name: 'Abu',
        class: 'Class 12',
        totalTests: 10,
        averageScore: 78.2,
        highestScore: 89,
        lowestScore: 65,
        passRate: 90,
        recentTests: [
          { testName: 'Physics Mid-term', score: 85, date: '2024-01-15', subject: 'Physics' },
          { testName: 'Chemistry Quiz', score: 79, date: '2024-01-12', subject: 'Chemistry' },
          { testName: 'Math Test', score: 82, date: '2024-01-10', subject: 'Mathematics' },
          { testName: 'Biology Assessment', score: 71, date: '2024-01-08', subject: 'Biology' }
        ],
        subjectPerformance: [
          { subject: 'Mathematics', averageScore: 82, testsCount: 3 },
          { subject: 'Physics', averageScore: 80, testsCount: 3 },
          { subject: 'Chemistry', averageScore: 76, testsCount: 2 },
          { subject: 'Biology', averageScore: 74, testsCount: 2 }
        ],
        performanceTrend: [
          { date: '2023-12-01', score: 70 },
          { date: '2023-12-15', score: 74 },
          { date: '2024-01-01', score: 76 },
          { date: '2024-01-15', score: 79 },
          { date: '2024-01-30', score: 82 }
        ]
      },
      {
        id: 'STU003',
        name: 'Gokul',
        class: 'Class 11',
        totalTests: 8,
        averageScore: 65.8,
        highestScore: 78,
        lowestScore: 45,
        passRate: 75,
        recentTests: [
          { testName: 'Physics Mid-term', score: 68, date: '2024-01-15', subject: 'Physics' },
          { testName: 'Chemistry Quiz', score: 62, date: '2024-01-12', subject: 'Chemistry' },
          { testName: 'Math Test', score: 71, date: '2024-01-10', subject: 'Mathematics' },
          { testName: 'Biology Assessment', score: 58, date: '2024-01-08', subject: 'Biology' }
        ],
        subjectPerformance: [
          { subject: 'Mathematics', averageScore: 72, testsCount: 2 },
          { subject: 'Physics', averageScore: 68, testsCount: 2 },
          { subject: 'Chemistry', averageScore: 62, testsCount: 2 },
          { subject: 'Biology', averageScore: 60, testsCount: 2 }
        ],
        performanceTrend: [
          { date: '2023-12-01', score: 58 },
          { date: '2023-12-15', score: 62 },
          { date: '2024-01-01', score: 65 },
          { date: '2024-01-15', score: 68 },
          { date: '2024-01-30', score: 71 }
        ]
      }
    ];

    setTimeout(() => {
      setStudentsData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const getPerformanceBand = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { label: 'At-Risk', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const overallStats = {
    totalStudents: studentsData.length,
    averageScore: studentsData.reduce((sum, student) => sum + student.averageScore, 0) / studentsData.length || 0,
    totalTests: studentsData.reduce((sum, student) => sum + student.totalTests, 0),
    overallPassRate: studentsData.reduce((sum, student) => sum + student.passRate, 0) / studentsData.length || 0
  };

  const performanceDistribution = [
    { name: 'Excellent (≥80)', value: studentsData.filter(s => s.averageScore >= 80).length, color: '#22c55e' },
    { name: 'Good (60-79)', value: studentsData.filter(s => s.averageScore >= 60 && s.averageScore < 80).length, color: '#3b82f6' },
    { name: 'At-Risk (<60)', value: studentsData.filter(s => s.averageScore < 60).length, color: '#ef4444' }
  ];

  if (loading) return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <LoadingState />
      </main>
    </div>
  );

  if (studentsData.length === 0) return (
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Consolidated Report</h1>
            <p className="text-gray-600">Individual student performance across all assessments</p>
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
              title="Total Students"
              value={overallStats.totalStudents}
              icon={<Users className="w-6 h-6" />}
              color="blue"
              subtitle="Active learners"
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
              icon={<BookOpen className="w-6 h-6" />}
              color="purple"
              subtitle="Assessments taken"
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
            {/* Performance Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {performanceDistribution.map((entry, index) => (
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

            {/* Student Performance Comparison */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Student Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
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
                  <Bar dataKey="averageScore" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Student Performance Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tests Taken</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Average Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Highest Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pass Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Performance</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentsData.map((student) => {
                    const performanceBand = getPerformanceBand(student.averageScore);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.class}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.totalTests}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${performanceBand.color}`}>
                            {student.averageScore.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.highestScore}%</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.passRate}%</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${performanceBand.bg} ${performanceBand.color}`}>
                            {performanceBand.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Detail Modal */}
          {selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.name} - Detailed Report</h3>
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {/* Student KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-blue-600 text-sm font-medium">Total Tests</div>
                      <div className="text-2xl font-bold text-blue-900">{selectedStudent.totalTests}</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-green-600 text-sm font-medium">Average Score</div>
                      <div className="text-2xl font-bold text-green-900">{selectedStudent.averageScore.toFixed(1)}%</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-purple-600 text-sm font-medium">Highest Score</div>
                      <div className="text-2xl font-bold text-purple-900">{selectedStudent.highestScore}%</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="text-orange-600 text-sm font-medium">Pass Rate</div>
                      <div className="text-2xl font-bold text-orange-900">{selectedStudent.passRate}%</div>
                    </div>
                  </div>

                  {/* Performance Trend Chart */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={selectedStudent.performanceTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Subject Performance */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedStudent.subjectPerformance.map((subject, index) => {
                        const band = getPerformanceBand(subject.averageScore);
                        return (
                          <div key={index} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-900">{subject.subject}</div>
                              <span className={`text-sm font-medium ${band.color}`}>
                                {subject.averageScore}%
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{subject.testsCount} tests</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${band.color.includes('green') ? 'bg-green-500' : band.color.includes('blue') ? 'bg-blue-500' : 'bg-red-500'}`}
                                style={{ width: `${subject.averageScore}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Tests */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Tests</h4>
                    <div className="space-y-3">
                      {selectedStudent.recentTests.map((test, index) => {
                        const band = getPerformanceBand(test.score);
                        return (
                          <div key={index} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{test.testName}</div>
                              <div className="text-sm text-gray-600">{test.subject} • {test.date}</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${band.color}`}>{test.score}%</div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${band.bg} ${band.color}`}>
                                {band.label}
                              </span>
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