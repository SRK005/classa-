'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, ArrowLeft, Target, User, Download, FileSpreadsheet, BarChart3, Brain, Lightbulb, Eye, Zap, Puzzle, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BloomLevel {
  level: string;
  description: string;
  totalQuestions: number;
  averageScore: number;
  averageTime: number;
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
  skillDevelopment: Array<{
    skill: string;
    proficiency: number;
    questionsCount: number;
  }>;
}

interface StudentBloomProfile {
  studentId: string;
  studentName: string;
  overallScore: number;
  bloomLevels: {
    Remember: number;
    Understand: number;
    Apply: number;
    Analyze: number;
    Evaluate: number;
    Create: number;
  };
  strengths: string[];
  improvements: string[];
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
    indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/40'
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
        <p className="text-gray-600">Loading Bloom's Taxonomy analysis...</p>
      </div>
    </div>
  );
}

function EmptyState() {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm max-w-md">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bloom's Taxonomy Data Available</h3>
        <p className="text-gray-600 mb-6">There are no cognitive level analysis records to display at this time.</p>
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

export default function BloomsTaxonomyReportPage() {
  const [bloomData, setBloomData] = useState<BloomLevel[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<StudentBloomProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentBloomProfile | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const router = useRouter();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
  const BLOOM_COLORS = {
    Remember: '#FF6B6B',
    Understand: '#4ECDC4',
    Apply: '#45B7D1',
    Analyze: '#96CEB4',
    Evaluate: '#FFEAA7',
    Create: '#DDA0DD'
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockBloomData: BloomLevel[] = [
      {
        level: 'Remember',
        description: 'Recall facts and basic concepts',
        totalQuestions: 245,
        averageScore: 78.5,
        averageTime: 45,
        successRate: 82.3,
        subjectDistribution: {
          Mathematics: 35,
          Physics: 28,
          Chemistry: 22,
          Biology: 15
        },
        performanceTrend: [
          { month: 'Jan', averageScore: 75, questionsAttempted: 180 },
          { month: 'Feb', averageScore: 77, questionsAttempted: 195 },
          { month: 'Mar', averageScore: 79, questionsAttempted: 210 },
          { month: 'Apr', averageScore: 78, questionsAttempted: 245 }
        ],
        skillDevelopment: [
          { skill: 'Factual Recall', proficiency: 85, questionsCount: 120 },
          { skill: 'Definition Recognition', proficiency: 78, questionsCount: 80 },
          { skill: 'Formula Identification', proficiency: 72, questionsCount: 45 }
        ]
      },
      {
        level: 'Understand',
        description: 'Explain ideas or concepts',
        totalQuestions: 198,
        averageScore: 72.8,
        averageTime: 62,
        successRate: 75.4,
        subjectDistribution: {
          Mathematics: 42,
          Physics: 35,
          Chemistry: 28,
          Biology: 25
        },
        performanceTrend: [
          { month: 'Jan', averageScore: 70, questionsAttempted: 150 },
          { month: 'Feb', averageScore: 72, questionsAttempted: 165 },
          { month: 'Mar', averageScore: 74, questionsAttempted: 180 },
          { month: 'Apr', averageScore: 73, questionsAttempted: 198 }
        ],
        skillDevelopment: [
          { skill: 'Concept Explanation', proficiency: 76, questionsCount: 95 },
          { skill: 'Pattern Recognition', proficiency: 71, questionsCount: 68 },
          { skill: 'Interpretation', proficiency: 69, questionsCount: 35 }
        ]
      },
      {
        level: 'Apply',
        description: 'Use information in new situations',
        totalQuestions: 156,
        averageScore: 68.2,
        averageTime: 85,
        successRate: 71.8,
        subjectDistribution: {
          Mathematics: 48,
          Physics: 38,
          Chemistry: 32,
          Biology: 28
        },
        performanceTrend: [
          { month: 'Jan', averageScore: 65, questionsAttempted: 120 },
          { month: 'Feb', averageScore: 67, questionsAttempted: 135 },
          { month: 'Mar', averageScore: 69, questionsAttempted: 145 },
          { month: 'Apr', averageScore: 68, questionsAttempted: 156 }
        ],
        skillDevelopment: [
          { skill: 'Problem Solving', proficiency: 72, questionsCount: 78 },
          { skill: 'Method Application', proficiency: 66, questionsCount: 52 },
          { skill: 'Procedure Execution', proficiency: 64, questionsCount: 26 }
        ]
      },
      {
        level: 'Analyze',
        description: 'Draw connections among ideas',
        totalQuestions: 124,
        averageScore: 64.5,
        averageTime: 105,
        successRate: 68.2,
        subjectDistribution: {
          Mathematics: 38,
          Physics: 32,
          Chemistry: 28,
          Biology: 26
        },
        performanceTrend: [
          { month: 'Jan', averageScore: 62, questionsAttempted: 95 },
          { month: 'Feb', averageScore: 64, questionsAttempted: 105 },
          { month: 'Mar', averageScore: 66, questionsAttempted: 115 },
          { month: 'Apr', averageScore: 65, questionsAttempted: 124 }
        ],
        skillDevelopment: [
          { skill: 'Critical Analysis', proficiency: 68, questionsCount: 62 },
          { skill: 'Data Interpretation', proficiency: 63, questionsCount: 42 },
          { skill: 'Relationship Identification', proficiency: 61, questionsCount: 20 }
        ]
      },
      {
        level: 'Evaluate',
        description: 'Justify a stand or decision',
        totalQuestions: 89,
        averageScore: 61.3,
        averageTime: 125,
        successRate: 64.8,
        subjectDistribution: {
          Mathematics: 28,
          Physics: 25,
          Chemistry: 20,
          Biology: 16
        },
        performanceTrend: [
          { month: 'Jan', averageScore: 58, questionsAttempted: 68 },
          { month: 'Feb', averageScore: 60, questionsAttempted: 75 },
          { month: 'Mar', averageScore: 63, questionsAttempted: 82 },
          { month: 'Apr', averageScore: 61, questionsAttempted: 89 }
        ],
        skillDevelopment: [
          { skill: 'Judgment Making', proficiency: 65, questionsCount: 45 },
          { skill: 'Criteria Assessment', proficiency: 59, questionsCount: 30 },
          { skill: 'Quality Evaluation', proficiency: 57, questionsCount: 14 }
        ]
      },
      {
        level: 'Create',
        description: 'Produce new or original work',
        totalQuestions: 67,
        averageScore: 58.7,
        averageTime: 145,
        successRate: 61.2,
        subjectDistribution: {
          Mathematics: 22,
          Physics: 18,
          Chemistry: 15,
          Biology: 12
        },
        performanceTrend: [
          { month: 'Jan', averageScore: 55, questionsAttempted: 48 },
          { month: 'Feb', averageScore: 57, questionsAttempted: 55 },
          { month: 'Mar', averageScore: 60, questionsAttempted: 62 },
          { month: 'Apr', averageScore: 59, questionsAttempted: 67 }
        ],
        skillDevelopment: [
          { skill: 'Creative Synthesis', proficiency: 62, questionsCount: 35 },
          { skill: 'Original Design', proficiency: 56, questionsCount: 22 },
          { skill: 'Innovation', proficiency: 54, questionsCount: 10 }
        ]
      }
    ];

    const mockStudentProfiles: StudentBloomProfile[] = [
      {
        studentId: 'STU001',
        studentName: 'Alice Johnson',
        overallScore: 78.5,
        bloomLevels: {
          Remember: 85,
          Understand: 82,
          Apply: 75,
          Analyze: 72,
          Evaluate: 68,
          Create: 65
        },
        strengths: ['Factual Recall', 'Concept Understanding'],
        improvements: ['Creative Problem Solving', 'Critical Evaluation']
      },
      {
        studentId: 'STU002',
        studentName: 'Bob Smith',
        overallScore: 72.3,
        bloomLevels: {
          Remember: 78,
          Understand: 76,
          Apply: 74,
          Analyze: 70,
          Evaluate: 66,
          Create: 62
        },
        strengths: ['Problem Application', 'Method Understanding'],
        improvements: ['Original Thinking', 'Judgment Skills']
      },
      {
        studentId: 'STU003',
        studentName: 'Carol Davis',
        overallScore: 85.2,
        bloomLevels: {
          Remember: 92,
          Understand: 88,
          Apply: 85,
          Analyze: 82,
          Evaluate: 78,
          Create: 75
        },
        strengths: ['All Cognitive Levels', 'Exceptional Analysis'],
        improvements: ['Time Management', 'Consistency']
      }
    ];

    setTimeout(() => {
      setBloomData(mockBloomData);
      setStudentProfiles(mockStudentProfiles);
      setLoading(false);
    }, 1000);
  }, []);

  const totalQuestions = bloomData.reduce((sum, level) => sum + level.totalQuestions, 0);
  const overallAverageScore = bloomData.reduce((sum, level) => sum + level.averageScore, 0) / bloomData.length;
  const overallSuccessRate = bloomData.reduce((sum, level) => sum + level.successRate, 0) / bloomData.length;

  const pieChartData = bloomData.map(level => ({
    name: level.level,
    value: level.totalQuestions,
    color: BLOOM_COLORS[level.level as keyof typeof BLOOM_COLORS]
  }));

  const barChartData = bloomData.map(level => ({
    level: level.level,
    averageScore: level.averageScore,
    successRate: level.successRate,
    totalQuestions: level.totalQuestions
  }));

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

  if (bloomData.length === 0) {
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
                <h1 className="text-3xl font-bold text-gray-900">Bloom's Taxonomy Report</h1>
                <p className="text-gray-600 mt-1">Cognitive level analysis and performance insights</p>
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
              title="Total Questions"
              value={totalQuestions.toLocaleString()}
              icon={<BookOpen className="w-6 h-6" />}
              color="blue"
              subtitle="Across all levels"
            />
            <KPICard
              title="Overall Average Score"
              value={`${overallAverageScore.toFixed(1)}%`}
              icon={<Target className="w-6 h-6" />}
              color="green"
              trend={{ value: 3.2, isPositive: true }}
            />
            <KPICard
              title="Success Rate"
              value={`${overallSuccessRate.toFixed(1)}%`}
              icon={<Award className="w-6 h-6" />}
              color="purple"
              trend={{ value: 1.8, isPositive: true }}
            />
            <KPICard
              title="Students Analyzed"
              value={studentProfiles.length}
              icon={<Users className="w-6 h-6" />}
              color="orange"
              subtitle="Active profiles"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Question Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Question Distribution by Bloom Level</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Comparison */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Performance by Cognitive Level</h3>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averageScore" fill="#8884d8" name="Average Score (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Bloom Level Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bloomData.map((level, index) => (
                <div key={level.level} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: BLOOM_COLORS[level.level as keyof typeof BLOOM_COLORS] }}
                    ></div>
                    <h4 className="text-lg font-semibold text-gray-900">{level.level}</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{level.description}</p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Questions:</span>
                      <span className="font-medium">{level.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Score:</span>
                      <span className="font-medium">{level.averageScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-medium">{level.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Time:</span>
                      <span className="font-medium">{level.averageTime}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Profiles */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Student Bloom Profiles</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {studentProfiles.map((student) => (
                <div key={student.studentId} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => setSelectedStudent(student)}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{student.studentName}</h4>
                      <p className="text-sm text-gray-600">Overall: {student.overallScore}%</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {Object.entries(student.bloomLevels).map(([level, score]) => (
                      <div key={level} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{level}:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${score}%`, 
                                backgroundColor: BLOOM_COLORS[level as keyof typeof BLOOM_COLORS] 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Strengths: {student.strengths.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Detail Modal */}
          {selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.studentName} - Bloom Profile</h3>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-sm text-blue-600 font-medium">Overall Score</div>
                      <div className="text-2xl font-bold text-blue-900">{selectedStudent.overallScore}%</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <div className="text-sm text-green-600 font-medium">Student ID</div>
                      <div className="text-lg font-semibold text-green-900">{selectedStudent.studentId}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Bloom Level Performance</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedStudent.bloomLevels).map(([level, score]) => (
                        <div key={level} className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">{level}:</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-3 bg-gray-200 rounded-full">
                              <div 
                                className="h-3 rounded-full transition-all duration-300" 
                                style={{ 
                                  width: `${score}%`, 
                                  backgroundColor: BLOOM_COLORS[level as keyof typeof BLOOM_COLORS] 
                                }}
                              ></div>
                            </div>
                            <span className="font-bold text-gray-900 w-12">{score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Areas for Improvement</h4>
                      <div className="space-y-2">
                        {selectedStudent.improvements.map((improvement, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-700">{improvement}</span>
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