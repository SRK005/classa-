"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';

import { db, auth } from '@/lib/firebaseClient';
import { collection, query, where, getDocs, doc, getDoc, documentId } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface StudentData {
  id: string;
  name: string;
  class: string;
  overallScore: number;
  accuracy: number;
  timeTaken: number;
  testsCompleted: number;
  topicsMastered: string[];
}

interface TestResult {
  testId: string;
  score?: number;
  percentageScore?: number;
  questionBreakdown?: { topic?: string }[];
}

interface StudentAnswer {
  isCorrect?: boolean;
}

async function fetchStudentsData(schoolId: string) {
  try {
    if (!schoolId) return [] as StudentData[];

    // Fetch all students from users collection with role 'student' in the same school
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('schoolId', '==', schoolId)
    );
    const usersSnapshot = await getDocs(usersQuery);
    

    
    const studentIds = usersSnapshot.docs.map(doc => doc.id);

    // Helper to batch 'in' queries (limit 30)
    const batchedInQuery = async (col: string, field: string, ids: string[]) => {
      const results: any[] = [];
      for (let i = 0; i < ids.length; i += 30) {
        const batch = ids.slice(i, i + 30);
        const snap = await getDocs(query(collection(db, col), where(field, 'in', batch)));
        results.push(...snap.docs);
      }
      return results;
    };

    // Fetch all test results and student answers in batches
    const allTestResultsDocs = studentIds.length > 0
      ? await batchedInQuery('testResults', 'studentId', studentIds)
      : [];
    const allStudentAnswersDocs = studentIds.length > 0
      ? await batchedInQuery('studentAnswers', 'studentId', studentIds)
      : [];

    const testResultsMap = new Map<string, any[]>();
    allTestResultsDocs.forEach((doc: any) => {
      const studentId = doc.data().studentId;
      if (studentId) {
        if (!testResultsMap.has(studentId)) {
          testResultsMap.set(studentId, []);
        }
        testResultsMap.get(studentId)?.push(doc.data());
      }
    });

    const studentAnswersMap = new Map<string, any[]>();
    allStudentAnswersDocs.forEach((doc: any) => {
      const studentId = doc.data().studentId;
      if (studentId) {
        if (!studentAnswersMap.has(studentId)) {
          studentAnswersMap.set(studentId, []);
        }
        studentAnswersMap.get(studentId)?.push(doc.data());
      }
    });

    const testAttemptIds = new Set<string>();
    allTestResultsDocs.forEach((doc: any) => testAttemptIds.add(doc.data().testId));

    // Fetch all unique test attempts in a single query
    const testAttemptsMap = new Map<string, any>();
    if (testAttemptIds.size > 0) {
      const ids = Array.from(testAttemptIds);
      for (let i = 0; i < ids.length; i += 30) {
        const batch = ids.slice(i, i + 30);
        const testAttemptsQuery = query(collection(db, 'testAttempts'), where(documentId(), 'in', batch));
        const testAttemptsSnapshot = await getDocs(testAttemptsQuery);
        testAttemptsSnapshot.docs.forEach(doc => testAttemptsMap.set(doc.id, doc.data()));
      }
    }

    const studentsData: StudentData[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Use pre-fetched data

      
      // Calculate aggregated metrics
      const testResults = (testResultsMap.get(userDoc.id) as TestResult[]) || [];
      const answers = (studentAnswersMap.get(userDoc.id) as StudentAnswer[]) || [];

      const testsCompleted = testResults.length;
      const totalScore = testResults.reduce((sum: number, result: TestResult) => sum + (result.score || 0), 0);
      const overallScore = testsCompleted > 0 ? Math.round(totalScore / testsCompleted) : 0;
      
      // Calculate accuracy
      const correctAnswers = answers.filter((answer: StudentAnswer) => !!answer.isCorrect).length;
      const accuracy = answers.length > 0 ? correctAnswers / answers.length : 0;
      
      // Get class from user data or pre-fetched test attempts
      let studentClass = userData.class || '';
      if (!studentClass && testResults.length > 0 && testAttemptsMap.has(testResults[0].testId)) {
        studentClass = (testAttemptsMap.get(testResults[0].testId) as any)?.class || '';
      }
      
      // Get topics mastered (simplified for now)
      const topicsMastered = Array.from(
        new Set(
          testResults.flatMap((result: TestResult) =>
            (result.questionBreakdown ?? [])
              .map(q => q.topic)
              .filter((t): t is string => typeof t === 'string')
          )
        )
      );
      
      studentsData.push({
        id: userDoc.id,
        name: userData.name || 'Unknown Student',
        class: studentClass,
        overallScore,
        accuracy,
        timeTaken: 0, // TODO: Calculate from testAttempts
        testsCompleted,
        topicsMastered
      });
    }
    
    return studentsData;
  } catch (error) {
    console.error('Error fetching student data:', error);
    return [];
  }
}

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, description }) => (
  <Card className="flex-1">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
    <p className="mt-4 text-lg text-muted-foreground">Loading student data...</p>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <AlertCircle className="h-12 w-12 text-yellow-500" />
    <p className="mt-4 text-lg text-muted-foreground">No student data available for the selected class.</p>
    <p className="text-sm text-muted-foreground">Please select a different class or add students.</p>
  </div>
);

export default function StudentWiseReportPage() {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);

  const availableClasses = ['All', ...new Set(allStudents.map(student => student.class).filter(Boolean))].sort();

  // Effect to fetch all student data once on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!user) {
        setAllStudents([]);
        setLoading(false);
        return;
      }
      // Read current user's schoolId
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const schoolId = userSnap.exists() ? (userSnap.data() as any).schoolId : undefined;
      if (!schoolId) {
        setAllStudents([]);
        setLoading(false);
        return;
      }
      const fetchedStudents = await fetchStudentsData(schoolId);
      setAllStudents(fetchedStudents);
      setLoading(false);
    };
    fetchData();
  }, [user]); // Re-run when auth user changes

  // Effect to filter students whenever selectedClass or allStudents changes
  useEffect(() => {
    const studentsToDisplay = selectedClass === 'All'
      ? allStudents
      : allStudents.filter(student => student.class === selectedClass);
    setFilteredStudents(studentsToDisplay);
  }, [selectedClass, allStudents]);

  if (loading) {
    return <LoadingState />;
  }

  if (filteredStudents.length === 0) {
    return <EmptyState />;
  }

  // Calculate overall statistics for filtered students
  const totalStudents = filteredStudents.length;
  const avgScore = (filteredStudents.reduce((sum, s) => sum + s.overallScore, 0) / totalStudents).toFixed(2);
  const avgAccuracy = (filteredStudents.reduce((sum, s) => sum + s.accuracy, 0) / totalStudents * 100).toFixed(2);
  const avgTestsCompleted = (filteredStudents.reduce((sum, s) => sum + s.testsCompleted, 0) / totalStudents).toFixed(2);

  // Performance distribution data for chart
  const performanceDistribution = [
    { range: '90-100', count: filteredStudents.filter(s => s.overallScore >= 90).length },
    { range: '80-89', count: filteredStudents.filter(s => s.overallScore >= 80 && s.overallScore < 90).length },
    { range: '70-79', count: filteredStudents.filter(s => s.overallScore >= 70 && s.overallScore < 80).length },
    { range: '60-69', count: filteredStudents.filter(s => s.overallScore >= 60 && s.overallScore < 70).length },
    { range: '<60', count: filteredStudents.filter(s => s.overallScore < 60).length },
  ];

  return (
    <div className="flex flex-col space-y-6 p-8">
      <h1 className="text-3xl font-bold">Student-wise Performance Report</h1>

      <div className="flex items-center space-x-4">
        <label htmlFor="class-select" className="text-lg font-medium">Select Class:</label>
        <Select onValueChange={setSelectedClass} value={selectedClass}>
          <SelectTrigger id="class-select" className="w-[180px]">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {availableClasses.map(cls => (
              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Students" value={totalStudents} description={`in ${selectedClass === 'All' ? 'all classes' : selectedClass}`} />
        <KPICard title="Average Score" value={avgScore} description={`across ${totalStudents} students`} />
        <KPICard title="Average Accuracy" value={`${avgAccuracy}%`} description={`across ${totalStudents} students`} />
        <KPICard title="Avg. Tests Completed" value={avgTestsCompleted} description={`per student in ${selectedClass === 'All' ? 'all classes' : selectedClass}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Number of Students" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Overall Score</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Tests Completed</TableHead>
                <TableHead>Topics Mastered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.overallScore}</TableCell>
                  <TableCell>{(student.accuracy * 100).toFixed(2)}%</TableCell>
                  <TableCell>{student.testsCompleted}</TableCell>
                  <TableCell>{student.topicsMastered.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
