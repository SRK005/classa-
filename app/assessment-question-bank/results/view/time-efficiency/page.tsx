'use client';

import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/app/assessment-question-bank/components/Sidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  TrendingUp, Clock, Download, FileSpreadsheet, BarChart3
} from 'lucide-react';

type StudentStat = {
  id: string;
  name: string;
  attempted: number;
  totalQuestions: number;
  correct: number;
  totalTimeSec: number;
};

type QuestionTime = {
  index: number;
  avgTimeSec: number;
  correctRate: number; // 0-100
};

const MOCK_STUDENTS: StudentStat[] = [
  { id: 's1', name: 'Aarav', attempted: 20, totalQuestions: 20, correct: 16, totalTimeSec: 560 }, // 28s/q
  { id: 's2', name: 'Diya', attempted: 20, totalQuestions: 20, correct: 18, totalTimeSec: 720 }, // 36s/q
  { id: 's3', name: 'Ishaan', attempted: 18, totalQuestions: 20, correct: 11, totalTimeSec: 810 }, // 45s/q
  { id: 's4', name: 'Meera', attempted: 20, totalQuestions: 20, correct: 19, totalTimeSec: 500 }, // 25s/q
  { id: 's5', name: 'Vikram', attempted: 17, totalQuestions: 20, correct: 9, totalTimeSec: 780 },  // 45.9s/q
  { id: 's6', name: 'Anaya', attempted: 20, totalQuestions: 20, correct: 15, totalTimeSec: 660 }, // 33s/q
  { id: 's7', name: 'Rohan', attempted: 20, totalQuestions: 20, correct: 14, totalTimeSec: 900 }, // 45s/q
  { id: 's8', name: 'Kavya', attempted: 19, totalQuestions: 20, correct: 13, totalTimeSec: 665 }, // ~35s/q
];

const MOCK_QUESTIONS: QuestionTime[] = [
  { index: 1, avgTimeSec: 22, correctRate: 90 },
  { index: 2, avgTimeSec: 27, correctRate: 82 },
  { index: 3, avgTimeSec: 31, correctRate: 65 },
  { index: 4, avgTimeSec: 38, correctRate: 58 },
  { index: 5, avgTimeSec: 29, correctRate: 77 },
  { index: 6, avgTimeSec: 41, correctRate: 52 },
  { index: 7, avgTimeSec: 24, correctRate: 92 },
  { index: 8, avgTimeSec: 26, correctRate: 48 },
  { index: 9, avgTimeSec: 19, correctRate: 88 },
  { index: 10, avgTimeSec: 52, correctRate: 38 },
];

function pct(n: number) {
  return Math.max(0, Math.min(100, n));
}

export default function TimeEfficiencyPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const studentDerived = useMemo(() => {
    return MOCK_STUDENTS.map((s) => {
      const avgPerQ = s.attempted ? s.totalTimeSec / s.attempted : 0;
      const completionRate = s.totalQuestions ? pct((s.attempted / s.totalQuestions) * 100) : 0;
      const accuracy = s.attempted ? pct((s.correct / s.attempted) * 100) : 0;
      const efficiency = s.totalTimeSec ? (s.correct / (s.totalTimeSec / 60)) : 0; // correct per minute
      return { ...s, avgPerQ, completionRate, accuracy, efficiency };
    });
  }, []);

  const kpis = useMemo(() => {
    const totalAttempts = studentDerived.reduce((s, st) => s + st.attempted, 0);
    const totalTime = studentDerived.reduce((s, st) => s + st.totalTimeSec, 0);
    const avgTimePerQ = totalAttempts ? totalTime / totalAttempts : 0;

    const studentsAvgPerQ = studentDerived.map((s) => s.avgPerQ).sort((a, b) => a - b);
    const mid = Math.floor(studentsAvgPerQ.length / 2);
    const medianAvgPerQ = studentsAvgPerQ.length % 2
      ? studentsAvgPerQ[mid]
      : (studentsAvgPerQ[mid - 1] + studentsAvgPerQ[mid]) / 2;

    const fastest = studentDerived.reduce((min, s) => (s.avgPerQ < min.avgPerQ ? s : min), studentDerived[0]);
    const slowest = studentDerived.reduce((max, s) => (s.avgPerQ > max.avgPerQ ? s : max), studentDerived[0]);

    const onTimeRate = pct((studentDerived.filter((s) => s.avgPerQ <= 35).length / studentDerived.length) * 100);

    return { avgTimePerQ, medianAvgPerQ, fastest, slowest, onTimeRate };
  }, [studentDerived]);

  const perQuestionBar = useMemo(() => {
    return MOCK_QUESTIONS.map((q) => ({
      name: `Q${q.index}`,
      avgTimeSec: q.avgTimeSec,
      correctRate: q.correctRate,
    }));
  }, []);

  const timeBucketDistribution = useMemo(() => {
    const buckets = { Fast: 0, Moderate: 0, Slow: 0 } as Record<string, number>;
    studentDerived.forEach((s) => {
      if (s.avgPerQ < 25) buckets.Fast += 1;
      else if (s.avgPerQ <= 40) buckets.Moderate += 1;
      else buckets.Slow += 1;
    });
    const palette: Record<string, string> = { Fast: '#22c55e', Moderate: '#06b6d4', Slow: '#ef4444' };
    return Object.keys(buckets).map((k) => ({ name: k, value: buckets[k], color: palette[k] }));
  }, [studentDerived]);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto" aria-busy="true">
          <div className="max-w-7xl mx-auto">
            <div className="h-8 w-72 bg-white rounded-xl shadow animate-pulse mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-6">
                  <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
                  <div className="h-8 w-32 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-6">
                  <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
                  <div className="h-64 w-full bg-slate-100 rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow p-6">
                  <div className="h-5 w-48 bg-slate-200 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-100 rounded" />
                    <div className="h-3 w-5/6 bg-slate-100 rounded" />
                    <div className="h-3 w-4/6 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Time Efficiency Report</h1>
            <p className="text-slate-600">How efficiently students spent time per question and overall during the test.</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm font-medium">Avg Time / Question</span>
                  <Clock className="h-5 w-5 text-blue-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.avgTimePerQ.toFixed(1)}s</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>

            <div className="bg-green-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-100 text-sm font-medium">Median Avg / Q</span>
                  <TrendingUp className="h-5 w-5 text-green-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.medianAvgPerQ.toFixed(1)}s</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>

            <div className="bg-purple-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-100 text-sm font-medium">Fastest Student</span>
                  <TrendingUp className="h-5 w-5 text-purple-200" />
                </div>
                <p className="text-lg font-semibold">{kpis.fastest.name}</p>
                <p className="text-sm text-purple-100">{kpis.fastest.avgPerQ.toFixed(1)}s per question</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>

            <div className="bg-orange-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-100 text-sm font-medium">On-Time Students</span>
                  <TrendingUp className="h-5 w-5 text-orange-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.onTimeRate.toFixed(0)}%</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Avg Time & Correct Rate by Question</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={perQuestionBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="avgTimeSec" name="Avg Time (s)" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="correctRate" name="Correct Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-4 justify-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-indigo-500 rounded mr-2" />
                  <span className="text-sm text-slate-600 font-medium">Avg Time (s)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-emerald-500 rounded mr-2" />
                  <span className="text-sm text-slate-600 font-medium">Correct Rate (%)</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Student Time Buckets</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={timeBucketDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="value">
                    {timeBucketDistribution.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
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
              <div className="grid grid-cols-3 gap-3 mt-4">
                {timeBucketDistribution.map((b) => (
                  <div key={b.name} className="flex items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: b.color }} />
                    <div className="text-center">
                      <span className="text-sm font-semibold text-slate-700">{b.name}</span>
                      <p className="text-xs text-slate-500">{b.value} students</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Student Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Per-Student Time Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {studentDerived.map((s) => (
                <div key={s.id} className="group bg-white rounded-3xl shadow hover:shadow-lg transition-all duration-300 border border-slate-100/70 overflow-hidden">
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{s.name}</h3>
                        <p className="text-sm text-slate-500">{s.attempted}/{s.totalQuestions} attempted • {s.correct} correct</p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-sm">
                        <Clock className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-indigo-50 rounded-2xl p-3 border border-indigo-100">
                        <div className="text-xs font-medium text-indigo-700 uppercase">Avg / Q</div>
                        <div className="text-xl font-bold text-indigo-700">{s.avgPerQ.toFixed(1)}s</div>
                      </div>
                      <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
                        <div className="text-xs font-medium text-blue-700 uppercase">Complete</div>
                        <div className="text-xl font-bold text-blue-700">{s.completionRate.toFixed(0)}%</div>
                      </div>
                      <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
                        <div className="text-xs font-medium text-emerald-700 uppercase">Accuracy</div>
                        <div className="text-xl font-bold text-emerald-700">{s.accuracy.toFixed(0)}%</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span>Pace (s per question)</span>
                          <span>{s.avgPerQ.toFixed(1)}s</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, (s.avgPerQ / 50) * 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span>Efficiency (correct/min)</span>
                          <span>{s.efficiency.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, (s.efficiency / 1.0) * 100)}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="mb-5">
                      <ResponsiveContainer width="100%" height={56}>
                        <LineChart data={[
                          { name: 'Start', value: Math.max(10, s.avgPerQ * 0.7) },
                          { name: 'Mid', value: s.avgPerQ },
                          { name: 'End', value: Math.max(12, s.avgPerQ * 1.2) }
                        ]}>
                          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium py-2 px-3 rounded-xl transition-all duration-300 shadow hover:shadow-md"
                        onClick={() => window.alert(`Mock: View timeline for ${s.name}`)}
                      >
                        View Timeline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow">
              <Download className="h-5 w-5 mr-2" />
              Download PDF Report
            </button>
            <button className="flex items-center px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium shadow">
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Export to Excel
            </button>
            <button className="flex items-center px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium shadow">
              <BarChart3 className="h-5 w-5 mr-2" />
              View Analytics
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}