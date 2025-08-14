'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, DocumentData, DocumentReference } from 'firebase/firestore';
import { db, auth } from '@/lib/firebaseClient';
import { useAuthState } from 'react-firebase-hooks/auth';
import Sidebar from '@/app/assessment-question-bank/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ClasswiseReportPage() {
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<any[]>([]);
  const [user] = useAuthState(auth);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const testsQuery = query(
          collection(db, 'test'),
          where('createdBy', '==', userRef)
        );
        const testsSnapshot = await getDocs(testsQuery);

        const testIds = testsSnapshot.docs.map(doc => doc.id);
        if (testIds.length === 0) {
          setClassData([]);
          setLoading(false);
          return;
        }

        const classMetrics: Map<string, { testIds: Set<string>, scores: number[], studentIds: Set<string>, className: string }> = new Map();

        // Prepare class data from tests
        for (const testDoc of testsSnapshot.docs) {
          const testData = testDoc.data();
          const classRef = testData.classId as DocumentReference | undefined;
          if (classRef) {
            const classId = classRef.id;
            if (!classMetrics.has(classId)) {
              const classDoc = await getDoc(classRef);
              const className = classDoc.exists() ? classDoc.data().name : 'Unknown Class';
              classMetrics.set(classId, { testIds: new Set(), scores: [], studentIds: new Set(), className });
            }
            classMetrics.get(classId)!.testIds.add(testDoc.id);
          }
        }

        // Fetch all relevant test results in batches of 30 (Firestore 'in' query limit)
        const allResults: DocumentData[] = [];
        for (let i = 0; i < testIds.length; i += 30) {
            const batchIds = testIds.slice(i, i + 30);
            const resultsQuery = query(collection(db, 'testResults'), where('testId', 'in', batchIds));
            const resultsSnapshot = await getDocs(resultsQuery);
            resultsSnapshot.forEach(doc => allResults.push(doc.data()));
        }

        // Aggregate results
        for (const result of allResults) {
            for (const [classId, metrics] of classMetrics.entries()) {
                if (metrics.testIds.has(result.testId)) {
                    metrics.scores.push(result.percentageScore || 0);
                    metrics.studentIds.add(result.studentId);
                    break; 
                }
            }
        }

        const aggregatedData = Array.from(classMetrics.entries()).map(([classId, metrics]) => {
            const totalScore = metrics.scores.reduce((sum, score) => sum + score, 0);
            const averageScore = metrics.scores.length > 0 ? Math.round(totalScore / metrics.scores.length) : 0;
            return {
                className: metrics.className,
                testsTaken: metrics.testIds.size,
                averageScore: averageScore,
                totalStudents: metrics.studentIds.size,
            };
        });

        setClassData(aggregatedData);

      } catch (error) {
        console.error('Error fetching class data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchClassData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">Loading class data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Classwise Performance Report</h1>
          <p className="text-gray-600 mt-2">Analyze and compare performance across different classes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classData.length}</div>
              <p className="text-xs text-gray-500 mt-1">across all grades</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(classData.reduce((acc, curr) => acc + curr.averageScore, 0) / classData.length)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">across all classes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classData.reduce((acc, curr) => acc + curr.totalStudents, 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">across all classes</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Class Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="className" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageScore" name="Average Score %" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests Taken</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classData.map((classItem, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{classItem.className}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{classItem.averageScore}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{classItem.totalStudents}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{classItem.testsTaken}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => setSelectedClass(classItem.className)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}