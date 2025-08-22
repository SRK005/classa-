'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, DocumentData, DocumentReference } from 'firebase/firestore';
import { db, auth } from '@/lib/firebaseClient';
import { useAuthState } from 'react-firebase-hooks/auth';
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, Download, FileSpreadsheet, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

type PerformanceCategory = 'top' | 'average' | 'at-risk';

interface StudentPerformance {
  studentId: string;
  studentName: string;
  className: string;
  averageScore: number;
  testCount: number;
  highestScore: number;
  lowestScore: number;
  performanceCategory: PerformanceCategory;
}

export default function StudentPerformersPage() {
  const [user] = useAuthState(auth);
  const [topPerformers, setTopPerformers] = useState<StudentPerformance[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // TODO: Implement data fetching logic for student performance
  useEffect(() => {
    const fetchStudentPerformanceData = async () => {
      if (!user) {
        setTopPerformers([]);
        setAtRiskStudents([]);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const testsQuery = query(collection(db, 'test'), where('createdBy', '==', userRef));
        const testsSnapshot = await getDocs(testsQuery);

        if (testsSnapshot.empty) {
          setTopPerformers([]);
          setAtRiskStudents([]);
          setLoading(false);
          return;
        }

        const testIds = testsSnapshot.docs.map(doc => doc.id);
        const testsMap = new Map();
        testsSnapshot.forEach(doc => testsMap.set(doc.id, { id: doc.id, ...doc.data() }));

        const allResults: DocumentData[] = [];
        for (let i = 0; i < testIds.length; i += 30) {
          const batchIds = testIds.slice(i, i + 30);
          const resultsQuery = query(collection(db, 'testResults'), where('testId', 'in', batchIds));
          const resultsSnapshot = await getDocs(resultsQuery);
          resultsSnapshot.forEach(doc => allResults.push(doc.data()));
        }

        if (allResults.length === 0) {
          setTopPerformers([]);
          setAtRiskStudents([]);
          setLoading(false);
          return;
        }

        const studentPerformanceMap = new Map<string, { totalScore: number, testCount: number, highestScore: number, lowestScore: number, studentName: string, className: string }>();

        for (const result of allResults) {
          const studentId = result.studentId;
          const percentageScore = result.percentageScore || 0;
          const testData = testsMap.get(result.testId);

          if (!testData) continue;

          let studentName = 'Unknown Student';
          let className = 'Unknown Class';

          let studentRef: DocumentReference | null = null;

          if (result.studentIdRef instanceof DocumentReference) {
            studentRef = result.studentIdRef;
          } else if (typeof result.studentId === 'string') {
            studentRef = doc(db, 'users', result.studentId);
          }

          if (studentRef) {
            const userDoc = await getDoc(studentRef);
            console.log("User Document Path:", studentRef.path);
            console.log("User Document Exists:", userDoc.exists());

            // First try to get student data from the students collection
            const studentsQuery = query(
              collection(db, 'students'),
              where('userId', '==', studentRef)
            );
            const studentSnapshot = await getDocs(studentsQuery);

            if (!studentSnapshot.empty) {
              const studentData = studentSnapshot.docs[0].data();
              console.log("Student Data:", studentData);
              studentName = studentData.name || 'Unknown Student';
              
              // Get class reference from student document
              const classRef = studentData.classId;
              if (classRef) {
                console.log("classRef type:", typeof classRef, "value:", classRef);
                try {
                  const classDoc = await getDoc(doc(db, 'classes', classRef.id || classRef));
                  console.log("Class Document Exists:", classDoc.exists());
                  if (classDoc.exists()) {
                    className = classDoc.data().name || 'Unknown Class';
                    console.log("Fetched Class Name:", className);
                  } else {
                    console.log('Class document does not exist for ref:', classRef);
                  }
                } catch (error) {
                  console.error('Error fetching class data:', error);
                }
              }
            } else {
              // Fallback to user document if student document not found
              if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("User Data (fallback):", userData);
                studentName = userData.displayName || 'Unknown Student';
              }  
            }
          }

          if (!studentPerformanceMap.has(studentId)) {
            studentPerformanceMap.set(studentId, {
              totalScore: 0,
              testCount: 0,
              highestScore: 0,
              lowestScore: 101,
              studentName: studentName,
              className: className,
            });
          }

          const studentData = studentPerformanceMap.get(studentId)!;
          studentData.totalScore += percentageScore;
          studentData.testCount++;
          studentData.highestScore = Math.max(studentData.highestScore, percentageScore);
          studentData.lowestScore = Math.min(studentData.lowestScore, percentageScore);
        }

        // Create properly typed student objects
        const allStudents: StudentPerformance[] = Array.from(studentPerformanceMap.entries()).map(([studentId, data]) => {
          return {
            studentId,
            studentName: data.studentName,
            className: data.className,
            averageScore: parseFloat((data.totalScore / data.testCount).toFixed(2)),
            testCount: data.testCount,
            highestScore: parseFloat(data.highestScore.toFixed(2)),
            lowestScore: data.lowestScore === 101 ? 0 : parseFloat(data.lowestScore.toFixed(2)),
            performanceCategory: 'average' as const
          };
        });

        const sortedStudents = allStudents.sort((a, b) => b.averageScore - a.averageScore);

        // Ensure type safety when setting performance categories
        const atRisk: StudentPerformance[] = sortedStudents
          .filter(s => s.averageScore < 60)
          .map(s => ({
            ...s,
            performanceCategory: 'at-risk' as const
          }));
          
        const remainingStudents = sortedStudents.filter(s => s.averageScore >= 60);
        
        const top: StudentPerformance[] = remainingStudents
          .slice(0, Math.min(5, remainingStudents.length))
          .map(s => ({
            ...s,
            performanceCategory: 'top' as const
          }));

        setTopPerformers(top);
        setAtRiskStudents(atRisk);
      } catch (error) {
        console.error('Error fetching student performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentPerformanceData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 text-lg font-medium">Loading student performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (topPerformers.length === 0 && atRiskStudents.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="text-center bg-white rounded-xl shadow-sm p-12 max-w-md">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No student performance data available</p>
            <p className="text-gray-500 text-sm mt-2">Create some tests to see analytics</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Performance Dashboard</h1>
            <p className="text-gray-600">Identify top performers and students needing additional support</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-green-600">Top Performers</CardTitle>
                <p className="text-gray-600">Students with the highest average scores.</p>
              </CardHeader>
              <CardContent>
                {topPerformers.length === 0 ? (
                  <p className="text-center text-gray-500">No top performers to display.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead>Tests Taken</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topPerformers.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{student.studentName}</TableCell>
                          <TableCell>{student.className}</TableCell>
                          <TableCell>{student.averageScore}%</TableCell>
                          <TableCell>{student.testCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-red-600">At-Risk Students</CardTitle>
                <p className="text-gray-600">Students with average scores below 60%.</p>
              </CardHeader>
              <CardContent>
                {atRiskStudents.length === 0 ? (
                  <p className="text-center text-gray-500">No at-risk students to display.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead>Tests Taken</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {atRiskStudents.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{student.studentName}</TableCell>
                          <TableCell>{student.className}</TableCell>
                          <TableCell>{student.averageScore}%</TableCell>
                          <TableCell>{student.testCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}