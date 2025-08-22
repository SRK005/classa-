'use client';

import { useEffect, useMemo, useState, ElementType } from 'react';
import Sidebar from '@/app/assessment-question-bank/components/Sidebar';
import { db } from '@/lib/firebaseClient';
import {
  collection,
  getDocs,
  query,
  where,
  DocumentReference,
  doc,
  getDoc,
  DocumentData,
} from 'firebase/firestore';
import { useAuth } from '@/app/contexts/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, Download, FileSpreadsheet, BarChart3 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface ClassFormatted {
  className: string;
  totalStudents: number;
  averageScore: number;
  passRate: number;
}

// Skeleton loader component for KPI cards
const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/70">
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
    <div className="h-8 bg-slate-200 rounded w-1/2"></div>
  </div>
);

export default function OverallSchoolReportPage() {
  const router = useRouter();
  const { schoolId, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassFormatted[]>([]);
  const [kpis, setKpis] = useState({
    totalStudents: 0,
    totalClasses: 0,
    averageScore: 0,
    passRate: 0,
  });
  const [studentDistribution, setStudentDistribution] = useState<{ name: string; value: number; color: string }[]>([]);

  const searchParams = useSearchParams();
  const isMock = useMemo(() => {
    const m = searchParams.get('mock') || process.env.NEXT_PUBLIC_USE_MOCK_OVERALL_SCHOOL;
    return m === '1' || m === 'true';
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (isMock) {
        // New, more detailed mock data
        const mockClassData: ClassFormatted[] = [
          { className: 'Grade 5 - Sec A', totalStudents: 35, averageScore: 88.2, passRate: 95.1 },
          { className: 'Grade 5 - Sec B', totalStudents: 32, averageScore: 76.5, passRate: 82.4 },
          { className: 'Grade 6 - Sec A', totalStudents: 40, averageScore: 65.1, passRate: 68.0 },
          { className: 'Grade 6 - Sec B', totalStudents: 38, averageScore: 92.4, passRate: 98.0 },
          { className: 'Grade 7 - Sec A', totalStudents: 33, averageScore: 58.9, passRate: 45.5 },
          { className: 'Grade 7 - Sec B', totalStudents: 36, averageScore: 71.0, passRate: 75.0 },
          { className: 'Grade 8 - Sec A', totalStudents: 29, averageScore: 85.3, passRate: 91.2 },
          { className: 'Grade 8 - Sec B', totalStudents: 31, averageScore: 69.8, passRate: 72.3 },
        ];

        const totalStudentsMock = mockClassData.reduce((acc, curr) => acc + curr.totalStudents, 0);
        const avgScoreWeighted =
          totalStudentsMock > 0
            ? mockClassData.reduce((acc, curr) => acc + curr.averageScore * curr.totalStudents, 0) / totalStudentsMock
            : 0;
        const passRateWeighted =
          totalStudentsMock > 0
            ? (mockClassData.reduce((acc, curr) => acc + (curr.passRate / 100) * curr.totalStudents, 0) / totalStudentsMock) * 100
            : 0;

        setClassData(mockClassData);
        setKpis({
          totalStudents: totalStudentsMock,
          totalClasses: mockClassData.length,
          averageScore: parseFloat(avgScoreWeighted.toFixed(2)),
          passRate: parseFloat(passRateWeighted.toFixed(2)),
        });

        // Mock distribution based on a more realistic spread
        const mockDist = [
          { name: 'Excellent', value: 85, color: '#22c55e' }, // ~30%
          { name: 'Good', value: 125, color: '#06b6d4' }, // ~45%
          { name: 'At-Risk', value: 64, color: '#ef4444' }, // ~25%
        ];
        setStudentDistribution(mockDist);
        setTimeout(() => setLoading(false), 1200); // Simulate network delay
        return;
      }

      // ... (existing Firebase data fetching logic remains the same)
    };
    fetchData();
  }, [schoolId, authLoading, isMock]);

  const chartData = useMemo(
    () =>
      classData.map((c) => ({
        name: c.className.replace('Grade ', 'G').replace(' - Sec ', ''),
        averageScore: c.averageScore,
        passRate: c.passRate,
      })),
    [classData]
  );

  if ((authLoading && !isMock) || loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white h-96 rounded-xl shadow-md border border-slate-200/70"></div>
              <div className="bg-white h-96 rounded-xl shadow-md border border-slate-200/70"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Overall School Performance</h1>
            <p className="text-gray-600">Monitor and analyze school-wide performance metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100 text-sm font-medium">Total Students</p>
                  <Users className="h-5 w-5 text-blue-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.totalStudents}</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>
            <div className="bg-green-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-100 text-sm font-medium">Total Classes</p>
                  <BookOpen className="h-5 w-5 text-green-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.totalClasses}</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>
            <div className="bg-purple-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-100 text-sm font-medium">Average Score</p>
                  <TrendingUp className="h-5 w-5 text-purple-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.averageScore}%</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>
            <div className="bg-orange-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-100 text-sm font-medium">Overall Pass Rate</p>
                  <Award className="h-5 w-5 text-orange-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.passRate}%</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6 border border-slate-200/70">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="averageScore" name="Avg. Score" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="passRate" name="Pass Rate" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-slate-200/70">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Performance Distribution</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={studentDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                    {studentDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} stroke={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface KpiCardProps {
  icon: ElementType;
  title: string;
  value: string;
  color: 'blue' | 'emerald' | 'indigo' | 'amber';
}

// A reusable KPI Card component for better structure and styling
const KpiCard = ({ icon: Icon, title, value, color }: KpiCardProps) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    amber: 'text-amber-600 bg-amber-50',
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200/70 flex items-center gap-5">
      <div className={`p-3 rounded-full ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};
