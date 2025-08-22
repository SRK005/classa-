'use client';

import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/app/assessment-question-bank/components/Sidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  TrendingUp, Clock, CircleHelp, Download, FileSpreadsheet, BarChart3
} from 'lucide-react';

type QuestionStat = {
  id: string;
  index: number;
  text: string;
  topic: string;
  totalStudents: number;
  attempted: number;
  correct: number;
  avgTimeSec: number;
};

const MOCK_QUESTION_STATS: QuestionStat[] = [
  { id: 'q1', index: 1, text: 'Identify the main idea of the passage.', topic: 'Reading', totalStudents: 120, attempted: 118, correct: 102, avgTimeSec: 42 },
  { id: 'q2', index: 2, text: 'Solve for x: 3x + 5 = 20', topic: 'Algebra', totalStudents: 120, attempted: 115, correct: 96, avgTimeSec: 36 },
  { id: 'q3', index: 3, text: 'Select the synonym for “benevolent”.', topic: 'Vocabulary', totalStudents: 120, attempted: 110, correct: 62, avgTimeSec: 28 },
  { id: 'q4', index: 4, text: 'Find the area of a triangle with base 10 and height 7.', topic: 'Geometry', totalStudents: 120, attempted: 108, correct: 55, avgTimeSec: 39 },
  { id: 'q5', index: 5, text: 'Which sentence has correct punctuation?', topic: 'Grammar', totalStudents: 120, attempted: 112, correct: 88, avgTimeSec: 31 },
  { id: 'q6', index: 6, text: 'Interpret the trend shown in the line graph.', topic: 'Data Interpretation', totalStudents: 120, attempted: 103, correct: 61, avgTimeSec: 48 },
  { id: 'q7', index: 7, text: 'Compute 18% of 250.', topic: 'Arithmetic', totalStudents: 120, attempted: 119, correct: 111, avgTimeSec: 22 },
  { id: 'q8', index: 8, text: 'Choose the correct chemical symbol for Sodium.', topic: 'Science', totalStudents: 120, attempted: 101, correct: 44, avgTimeSec: 26 },
  { id: 'q9', index: 9, text: 'Which is a renewable source of energy?', topic: 'EVS', totalStudents: 120, attempted: 117, correct: 97, avgTimeSec: 19 },
  { id: 'q10', index: 10, text: 'Rearrange the words to form a sentence.', topic: 'English', totalStudents: 120, attempted: 90, correct: 34, avgTimeSec: 55 },
];

function pct(n: number) {
  return Math.max(0, Math.min(100, n));
}

function classifyEffectiveness(correctRate: number) {
  // Material 3-friendly buckets for quick insight
  if (correctRate >= 80) return { label: 'Easy', color: '#22c55e' };         // green-500
  if (correctRate >= 60) return { label: 'Moderate', color: '#06b6d4' };     // cyan-500
  if (correctRate >= 40) return { label: 'Hard', color: '#f59e0b' };         // amber-500
  return { label: 'Very Hard', color: '#ef4444' };                           // red-500
}

// Extra subjects/grades to show in the Subject dropdown
const EXTRA_SUBJECTS = ['Biology 11', 'Biology 12', 'Chemistry 11', 'Chemistry 12', 'Physics 11', 'Physics 12'];

export default function QuestionEffectivenessPage() {
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('Biology 11');

  // Simulate async load for skeleton demo
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const derived = useMemo(() => {
    return MOCK_QUESTION_STATS.map(q => {
      const attemptRate = q.totalStudents ? pct((q.attempted / q.totalStudents) * 100) : 0;
      const correctRate = q.totalStudents ? pct((q.correct / q.totalStudents) * 100) : 0;
      const correctOfAttempted = q.attempted ? pct((q.correct / q.attempted) * 100) : 0;
      const klass = classifyEffectiveness(correctRate);
      return { ...q, attemptRate, correctRate, correctOfAttempted, klass };
    });
  }, []);

  const subjects = useMemo(() => EXTRA_SUBJECTS, []);

  const kpis = useMemo(() => {
    const n = derived.length || 1;
    const avgAttemptRate = derived.reduce((s, q) => s + q.attemptRate, 0) / n;
    const avgCorrectRate = derived.reduce((s, q) => s + q.correctRate, 0) / n;
    const avgTime = derived.reduce((s, q) => s + q.avgTimeSec, 0) / n;
    const atRiskCount = derived.filter(q => q.correctRate < 40 || q.attemptRate < 60).length;
    return { avgAttemptRate, avgCorrectRate, avgTime, atRiskCount };
  }, [derived]);

  const barData = useMemo(() => {
    const source = derived.filter(q => q.topic === selectedSubject);
    const mapped = source.map(q => ({
      name: `T${q.index}`,
      attemptRate: Number(q.attemptRate.toFixed(1)),
      correctRate: Number(q.correctRate.toFixed(1)),
    }));
    // Graceful fallback so selecting extra subjects doesn't empty the chart in mock mode
    return mapped.length > 0
      ? mapped
      : derived.map(q => ({
          name: `T${q.index}`,
          attemptRate: Number(q.attemptRate.toFixed(1)),
          correctRate: Number(q.correctRate.toFixed(1)),
        }));
  }, [derived, selectedSubject]);

  const distribution = useMemo(() => {
    const buckets: Record<string, { name: string; value: number; color: string }> = {};
    derived.forEach(q => {
      const key = q.klass.label;
      if (!buckets[key]) buckets[key] = { name: key, value: 0, color: q.klass.color };
      buckets[key].value += 1;
    });
    return Object.values(buckets).filter(b => b.value > 0);
  }, [derived]);

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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Question Effectiveness Report</h1>
            <p className="text-slate-600">
              How effectively questions were attempted and answered correctly across all students.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm font-medium">Avg Attempt Rate</span>
                  <CircleHelp className="h-5 w-5 text-blue-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.avgAttemptRate.toFixed(1)}%</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>

            <div className="bg-green-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-100 text-sm font-medium">Avg Correct Rate</span>
                  <TrendingUp className="h-5 w-5 text-green-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.avgCorrectRate.toFixed(1)}%</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>

            <div className="bg-purple-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-100 text-sm font-medium">Avg Time/Question</span>
                  <Clock className="h-5 w-5 text-purple-200" />
                </div>
                <p className="text-3xl font-bold">{Math.round(kpis.avgTime)}s</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>

            <div className="bg-orange-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-100 text-sm font-medium">At-Risk Questions</span>
                  <CircleHelp className="h-5 w-5 text-orange-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.atRiskCount}</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Attempt vs Correct Rate by Question */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Attempt vs Correct Rate by Question</h3>
                <div className="flex items-center gap-2">
                  <label htmlFor="subjectFilter" className="text-sm text-slate-600">Subject</label>
                  <select
                    id="subjectFilter"
                    className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
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
                  <Bar dataKey="attemptRate" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="correctRate" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-4 justify-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2" />
                  <span className="text-sm text-slate-600 font-medium">Attempt Rate (%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-emerald-500 rounded mr-2" />
                  <span className="text-sm text-slate-600 font-medium">Correct Rate (%)</span>
                </div>
              </div>
            </div>

            {/* Effectiveness Distribution */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Effectiveness Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {distribution.map((entry, i) => (
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {distribution.map((b) => (
                  <div key={b.name} className="flex items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: b.color }} />
                    <div className="text-center">
                      <span className="text-sm font-semibold text-slate-700">{b.name}</span>
                      <p className="text-xs text-slate-500">{b.value} questions</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Per-Question Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {derived.map((q) => (
                <div key={q.id} className="group bg-white rounded-3xl shadow hover:shadow-lg transition-all duration-300 border border-slate-100/70 overflow-hidden">
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Q{q.index} • {q.topic}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2">{q.text}</p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm">
                        <CircleHelp className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
                        <div className="text-xs font-medium text-emerald-700 uppercase">Correct</div>
                        <div className="text-xl font-bold text-emerald-700">{q.correctRate.toFixed(1)}%</div>
                      </div>
                      <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
                        <div className="text-xs font-medium text-blue-700 uppercase">Attempt</div>
                        <div className="text-xl font-bold text-blue-700">{q.attemptRate.toFixed(1)}%</div>
                      </div>
                      <div className="bg-indigo-50 rounded-2xl p-3 border border-indigo-100">
                        <div className="text-xs font-medium text-indigo-700 uppercase">Time</div>
                        <div className="text-xl font-bold text-indigo-700">{Math.round(q.avgTimeSec)}s</div>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span>Attempted</span>
                          <span>{q.attempted}/{q.totalStudents}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${q.attemptRate}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span>Correct of Attempted</span>
                          <span>{q.correct}/{q.attempted}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${q.correctOfAttempted}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Mini trend (time context) */}
                    <div className="mb-5">
                      <ResponsiveContainer width="100%" height={56}>
                        <LineChart data={[
                          { name: 'Min', value: Math.max(8, q.avgTimeSec * 0.6) },
                          { name: 'Avg', value: q.avgTimeSec },
                          { name: 'Max', value: Math.max(12, q.avgTimeSec * 1.4) }
                        ]}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#6366f1"
                            strokeWidth={3}
                            dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Badge + CTA */}
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${q.klass.color}22`,
                          color: q.klass.color,
                          border: `1px solid ${q.klass.color}55`
                        }}
                      >
                        {q.klass.label}
                      </span>
                      <button
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium py-2 px-3 rounded-xl transition-all duration-300 shadow hover:shadow-md"
                        onClick={() => window.alert(`Mock: View responses for Q${q.index}`)}
                      >
                        View Responses
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