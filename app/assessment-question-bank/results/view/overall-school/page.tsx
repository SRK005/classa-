'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';

interface ClassAgg {
  className: string;
  studentIds: Set<string>;
  totalScore: number;
  resultCount: number;
  highestScore: number;
  lowestScore: number;
  passedCount: number;
}

interface ClassFormatted {
  className: string;
  totalStudents: number;
  averageScore: number;
  passRate: number;
}

export default function OverallSchoolReportPage() {
  const { schoolId, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassFormatted[]>([]);
  const [kpis, setKpis] = useState({
    totalStudents: 0,
    totalClasses: 0,
    averageScore: 0,
    passRate: 0,
    highestScore: 0,
    lowestScore: 0,
  });
  const [studentDistribution, setStudentDistribution] = useState<{ name: string; value: number; color: string }[]>([]);

  // Mock mode toggle via query param (?mock=1 or ?mock=true) or NEXT_PUBLIC env
  const isMock = true;

  useEffect(() => {
    const fetchData = async () => {
      // Short-circuit with mock data
      if (isMock) {
        const mockClassData: ClassFormatted[] = [
          { className: 'Class 1A', totalStudents: 32, averageScore: 72.4, passRate: 78.3 },
          { className: 'Class 1B', totalStudents: 30, averageScore: 65.2, passRate: 68.0 },
          { className: 'Class 2A', totalStudents: 28, averageScore: 81.6, passRate: 92.9 },
          { className: 'Class 2B', totalStudents: 34, averageScore: 54.7, passRate: 41.2 },
          { className: 'Class 3A', totalStudents: 29, averageScore: 76.1, passRate: 84.5 },
          { className: 'Class 3B', totalStudents: 27, averageScore: 61.3, passRate: 59.8 },
        ];
        const totalStudentsMock = mockClassData.reduce((a, c) => a + c.totalStudents, 0);
        const avgScoreWeighted =
          totalStudentsMock
            ? mockClassData.reduce((a, c) => a + c.averageScore * c.totalStudents, 0) / totalStudentsMock
            : 0;
        const passRateWeighted =
          totalStudentsMock
            ? (mockClassData.reduce((a, c) => a + (c.passRate / 100) * c.totalStudents, 0) / totalStudentsMock) * 100
            : 0;
        const highest = Math.max(...mockClassData.map((c) => c.averageScore));
        const lowest = Math.min(...mockClassData.map((c) => c.averageScore));

        setClassData(mockClassData);
        setKpis({
          totalStudents: totalStudentsMock,
          totalClasses: mockClassData.length,
          averageScore: parseFloat(avgScoreWeighted.toFixed(2)),
          passRate: parseFloat(passRateWeighted.toFixed(2)),
          highestScore: parseFloat(highest.toFixed(2)),
          lowestScore: parseFloat(lowest.toFixed(2)),
        });
        const mockDist = [
          { name: 'Excellent', value: 38, color: '#22c55e' },
          { name: 'Good', value: 72, color: '#06b6d4' },
          { name: 'At-Risk', value: 70, color: '#ef4444' },
        ];
        setStudentDistribution(mockDist);
        setLoading(false);
        return;
      }

      if (authLoading) return;
      if (!schoolId) {
        setLoading(false);
        return;
      }

      try {
        // Helper: normalize various Firestore reference formats to a document ID string
        const getRefId = (val: any): string | null => {
          if (!val) return null;
          if (typeof val === 'string') {
            const parts = val.split('/');
            return parts[parts.length - 1] || val;
          }
          if (typeof val === 'object') {
            // Firestore DocumentReference has an 'id' field
            if ('id' in val && typeof (val as any).id === 'string') return (val as any).id as string;
            // Some code may store a path-like object
            if ('path' in val && typeof (val as any).path === 'string') {
              const parts = (val as any).path.split('/');
              return parts[parts.length - 1] || null;
            }
            // Firestore SDK internal path structure
            if ('_path' in val && (val as any)._path?.segments?.length) {
              const segs = (val as any)._path.segments as string[];
              return segs[segs.length - 1] || null;
            }
          }
          return null;
        };

        // Fetch all tests, then filter by schoolId (supports string and reference storage)
        const testsSnap = await getDocs(collection(db, 'test'));
        const tests: { id: string; classId?: DocumentReference | null; schoolId?: any }[] = [];
        const classRefMap = new Map<string, DocumentReference>();

        testsSnap.forEach((t) => {
          const d = t.data();
          // Determine school match (support both 'schoolId' and 'schoolID' and various formats)
          let match = false;
          const schoolField = (d as any).schoolId ?? (d as any).schoolID ?? null;
          const schoolRefId = getRefId(schoolField);
          if (schoolRefId && schoolRefId === schoolId) match = true;
          if (!match) return;

          // Normalize class reference (support 'classId' or 'classID', allow string/path fallback)
          let classIdRef: DocumentReference | null = null;
          const rawClassField = (d as any).classId ?? (d as any).classID ?? null;
          if (rawClassField) {
            if (typeof rawClassField === 'object' && 'id' in rawClassField) {
              classIdRef = rawClassField as DocumentReference;
            } else {
              const cid = getRefId(rawClassField);
              if (cid) {
                try {
                  classIdRef = doc(db, 'classes', cid);
                } catch {
                  classIdRef = null;
                }
              }
            }
          }
          if (classIdRef && classIdRef.id) {
            classRefMap.set(classIdRef.id, classIdRef);
          }

          tests.push({ id: t.id, classId: classIdRef, schoolId: d.schoolId });
        });

        if (tests.length === 0) {
          setClassData([]);
          setKpis({ totalStudents: 0, totalClasses: 0, averageScore: 0, passRate: 0, highestScore: 0, lowestScore: 0 });
          setStudentDistribution([]);
          setLoading(false);
          return;
        }

        // Resolve class names
        const classNames = new Map<string, string>();
        for (const [id, ref] of classRefMap.entries()) {
          try {
            const classDoc = await getDoc(ref);
            classNames.set(id, classDoc.exists() ? classDoc.data().name || 'Unknown Class' : 'Unknown Class');
          } catch {
            classNames.set(id, 'Unknown Class');
          }
        }

        const testIds = tests.map((t) => t.id);

        // Fetch results in batches of 10 (Firestore 'in' query limit is 10)
        const allResults: DocumentData[] = [];
        for (let i = 0; i < testIds.length; i += 10) {
          const batch = testIds.slice(i, i + 10);
          if (batch.length === 0) continue;
          const resQ = query(collection(db, 'testResults'), where('testId', 'in', batch as any));
          const resSnap = await getDocs(resQ);
          resSnap.forEach((r) => allResults.push(r.data()));
        }

        if (allResults.length === 0) {
          setClassData([]);
          setKpis({ totalStudents: 0, totalClasses: classRefMap.size, averageScore: 0, passRate: 0, highestScore: 0, lowestScore: 0 });
          setStudentDistribution([]);
          setLoading(false);
          return;
        }

        // Aggregate per-class and schoolwide metrics
        const byClass = new Map<string, ClassAgg>();
        const studentAgg = new Map<string, { total: number; count: number }>();
        let totalScore = 0;
        let totalCount = 0;
        let passCount = 0;
        let highest = 0;
        let lowest = 101;
        const studentIdsSet = new Set<string>();
        const classesSet = new Set<string>();

        for (const r of allResults) {
          const testId = r.testId as string;
          const test = tests.find((t) => t.id === testId);
          const score = (r.percentageScore || 0) as number;
          const studentId = (r.studentId || '') as string;

          totalScore += score;
          totalCount += 1;
          if (score >= 35) passCount += 1;
          highest = Math.max(highest, score);
          lowest = Math.min(lowest, score);
          if (studentId) {
            studentIdsSet.add(studentId);
            const s = studentAgg.get(studentId) || { total: 0, count: 0 };
            s.total += score;
            s.count += 1;
            studentAgg.set(studentId, s);
          }

          if (test && test.classId) {
            const classId = test.classId.id;
            classesSet.add(classId);
            const className = classNames.get(classId) || 'Unknown Class';
            const agg = byClass.get(classId) || {
              className,
              studentIds: new Set<string>(),
              totalScore: 0,
              resultCount: 0,
              highestScore: 0,
              lowestScore: 101,
              passedCount: 0,
            };
            agg.totalScore += score;
            agg.resultCount += 1;
            agg.highestScore = Math.max(agg.highestScore, score);
            agg.lowestScore = Math.min(agg.lowestScore, score);
            if (score >= 35) agg.passedCount += 1;
            if (studentId) agg.studentIds.add(studentId);
            byClass.set(classId, agg);
          }
        }

        const formattedClassData: ClassFormatted[] = Array.from(byClass.values()).map((c) => ({
          className: c.className,
          totalStudents: c.studentIds.size,
          averageScore: c.resultCount ? parseFloat((c.totalScore / c.resultCount).toFixed(2)) : 0,
          passRate: c.resultCount ? parseFloat(((c.passedCount / c.resultCount) * 100).toFixed(2)) : 0,
        }));

        const avg = totalCount ? totalScore / totalCount : 0;
        const pr = totalCount ? (passCount / totalCount) * 100 : 0;

        setClassData(formattedClassData);
        setKpis({
          totalStudents: studentIdsSet.size,
          totalClasses: classesSet.size,
          averageScore: parseFloat(avg.toFixed(2)),
          passRate: parseFloat(pr.toFixed(2)),
          highestScore: parseFloat(highest.toFixed(2)),
          lowestScore: lowest === 101 ? 0 : parseFloat(lowest.toFixed(2)),
        });

        // Student distribution by average performance
        const dist = [
          { name: 'Excellent', value: 0, color: '#22c55e' },
          { name: 'Good', value: 0, color: '#06b6d4' },
          { name: 'At-Risk', value: 0, color: '#ef4444' },
        ];
        for (const [, v] of studentAgg) {
          const sAvg = v.count ? v.total / v.count : 0;
          if (sAvg >= 80) dist[0].value += 1;
          else if (sAvg >= 60) dist[1].value += 1;
          else dist[2].value += 1;
        }
        setStudentDistribution(dist.filter((d) => d.value > 0));
      } catch (e) {
        console.error('Error fetching overall school report:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [schoolId, authLoading, isMock]);

  const chartData = useMemo(
    () =>
      classData.map((c) => ({
        name: c.className.replace('Class ', ''),
        averageScore: c.averageScore,
        passRate: c.passRate,
        students: c.totalStudents,
      })),
    [classData]
  );

  if ((authLoading && !isMock) || loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 text-lg font-medium">Loading overall school performance...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!schoolId && !isMock) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="text-center bg-white rounded-xl shadow-sm p-12 max-w-md">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No school associated with your account</p>
            <p className="text-gray-500 text-sm mt-2">Contact your administrator to set your school.</p>
          </div>
        </div>
      </div>
    );
  }

  if (classData.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="text-center bg-white rounded-xl shadow-sm p-12 max-w-md">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No results found for this school</p>
            <p className="text-gray-500 text-sm mt-2">Create and publish assessments to see analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Overall School Performance</h1>
              {isMock && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  Mock data
                </span>
              )}
            </div>
            <p className="text-gray-600">Comprehensive view of assessment outcomes across the school</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100 text-sm font-medium">Average Score</p>
                  <TrendingUp className="h-5 w-5 text-blue-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.averageScore.toFixed(1)}%</p>
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
                  <p className="text-purple-100 text-sm font-medium">Total Students</p>
                  <Users className="h-5 w-5 text-purple-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.totalStudents}</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>

            <div className="bg-orange-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-100 text-sm font-medium">Pass Rate</p>
                  <Award className="h-5 w-5 text-orange-200" />
                </div>
                <p className="text-3xl font-bold">{kpis.passRate.toFixed(1)}%</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Class Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="averageScore" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="passRate" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-6 mt-4 justify-center">
                <div className="flex items-center"><div className="w-4 h-4 bg-blue-500 rounded mr-2"></div><span className="text-sm text-gray-600 font-medium">Average Score (%)</span></div>
                <div className="flex items-center"><div className="w-4 h-4 bg-green-500 rounded mr-2"></div><span className="text-sm text-gray-600 font-medium">Pass Rate (%)</span></div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800"><span className="font-semibold">Pro Tip:</span> Compare class averages and pass rates to identify classes needing support.</p>
              </div>
            </div>

            {/* Student Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={studentDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="value">
                    {studentDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg border border-green-200"><div className="w-4 h-4 rounded-full mr-3 bg-green-500"></div><div className="text-center"><span className="text-sm font-semibold text-green-700">Excellent</span><p className="text-xs text-green-600">80% - 100%</p></div></div>
                <div className="flex items-center justify-center p-3 bg-cyan-50 rounded-lg border border-cyan-200"><div className="w-4 h-4 rounded-full mr-3 bg-cyan-500"></div><div className="text-center"><span className="text-sm font-semibold text-cyan-700">Good</span><p className="text-xs text-cyan-600">60% - 79%</p></div></div>
                <div className="flex items-center justify-center p-3 bg-red-50 rounded-lg border border-red-200"><div className="w-4 h-4 rounded-full mr-3 bg-red-500"></div><div className="text-center"><span className="text-sm font-semibold text-red-700">At-Risk</span><p className="text-xs text-red-600">Below 60%</p></div></div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800"><span className="font-semibold">Insight:</span> Focus support on the At-Risk segment to improve overall outcomes.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
