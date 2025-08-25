'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../lib/firebaseClient';
import Link from 'next/link';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Clock, CheckCircle, AlertCircle, Calendar, BookOpen, Target, TrendingUp, Award, List, RefreshCw } from 'lucide-react';
import { retryWithBackoff, handleFirebaseError, isOnline, waitForNetwork } from '../../lib/utils';

// Types for assessment data
type TestResult = {
  id: string;
  testId: string;
  testName: string;
  subjectName: string;
  score: number;
  totalMarks: number;
  date: Date;
  percentageScore: number;
  grade: string;
  testResultId?: string; // ID of the test result document
};

type AvailableTest = {
  id: string;
  name: string;
  start: any;
  end: any;
  status: string;
  questions: any[];
  totalQuestions: number;
  wholeClass: boolean;
  canTake: boolean;
  timeRemaining: number;
  subjectName?: string;
  userID?: any[];
  subjectId?: string;
  hasCompleted?: boolean;
};

const AssessmentDashboard = () => {
  const { user, schoolId, userRole } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [availableTests, setAvailableTests] = useState<AvailableTest[]>([]);
  const [recentTests, setRecentTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [overallAverage, setOverallAverage] = useState(0);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'available' | 'allTests' | 'results'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [adminStudents, setAdminStudents] = useState<any[]>([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Calculate grade based on percentage
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  // Get test status based on timing
  const getTestStatus = (test: AvailableTest) => {
    const now = new Date();
    const startTime = test.start?.toDate();
    const endTime = test.end?.toDate();

    if (endTime && endTime < now) return "finished";
    if (startTime && startTime <= now && endTime && endTime > now) return "ongoing";
    if (startTime && startTime > now) return "upcoming";
    return "published";
  };

  // Format time remaining
  const formatTimeRemaining = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "finished":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Fetch available tests for student
  const getStudentTestsWithDetails = async (studentId: string) => {
    try {
      const studentDoc = await retryWithBackoff(async () => {
        return await getDoc(doc(db, "students", studentId));
      });
      
      const studentData = studentDoc.data();
      const classId = studentData?.classId;

      if (!classId) return [];

      // Query all published tests for the class
      const testsQuery = query(
        collection(db, "test"),
        where("classId", "==", classId),
        where("online", "==", true)
      );

      const testsSnapshot = await retryWithBackoff(async () => {
        return await getDocs(testsQuery);
      });
      
      const allTests = testsSnapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => ({
        id: docSnap.id,
        ...(docSnap.data() as any),
      })) as AvailableTest[];

      const now = new Date();
      const studentRef = doc(db, "students", studentId);

      // Get existing test results for this student
      const testResultsQuery = query(
        collection(db, "testResults"),
        where("studentId", "==", user!.uid)
      );
      
      const testResultsSnapshot = await retryWithBackoff(async () => {
        return await getDocs(testResultsQuery);
      });
      
      const completedTestIds = new Set(
        testResultsSnapshot.docs.map(
          (docSnap: QueryDocumentSnapshot<DocumentData>) => (docSnap.data() as any).testId as string
        )
      );

      // Filter and categorize tests
      const availableTests = allTests
        .filter((test) => {
          // Check if student should see this test
          if (test.wholeClass) {
            return true; // Available to whole class
          } else {
            // Check if student is in selective list
            return (
              test.userID &&
              test.userID.some((ref: any) => ref.path === studentRef.path)
            );
          }
        })
        .map(async (test) => {
          const startTime = test.start?.toDate();
          const endTime = test.end?.toDate();

          // Determine test status
          let status = "published";
          if (endTime && endTime < now) status = "finished";
          else if (startTime && startTime <= now && endTime && endTime > now)
            status = "ongoing";
          else if (startTime && startTime > now) status = "upcoming";

          // Check if student has already completed this test
          const hasCompleted = completedTestIds.has(test.id);

          // Get subject name if available
          let subjectName = "Unknown Subject";
          const subjectId = test.subjectId;
          if (subjectId) {
            try {
              const subjectDoc = await retryWithBackoff(async () => {
                return await getDoc(doc(db, "subjects", subjectId));
              });
              
              if (subjectDoc.exists()) {
                subjectName = subjectDoc.data().name || "Unknown Subject";
              }
            } catch (error) {
              console.error("Error fetching subject:", error);
            }
          }

          return {
            ...test,
            status,
            canTake: (status === "ongoing" || status === "upcoming") && !hasCompleted,
            timeRemaining: endTime
              ? Math.max(0, endTime.getTime() - now.getTime())
              : 0,
            subjectName,
            hasCompleted,
          } as AvailableTest;
        });

      const resolvedTests = await Promise.all(availableTests);
      return resolvedTests;
    } catch (error) {
      console.error("Error fetching student tests:", error);
      return [];
    }
  };

  const fetchData = async (isRefresh = false) => {
    if (!user) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);

    try {
      // Check network status first
      if (!isOnline()) {
        setError('No internet connection. Please check your network and try again.');
        return;
      }
      
      // Wait for network if offline
      const networkAvailable = await waitForNetwork(5000);
      if (!networkAvailable) {
        setError('Network connection is slow. Please try again.');
        return;
      }
      
      // Admin/Teacher/Principal: fetch students in school
      if (userRole && userRole !== 'student') {
        if (!schoolId) {
          setError('Your account is missing a schoolId.');
          return;
        }
        const schoolRef = doc(db, 'schools', schoolId);
        const altSchoolRef = doc(db, 'school', schoolId); // some projects use singular collection name
        // Try students collection first (DocumentReference schoolId + isActive)
        const studentsColQuery = query(
          collection(db, 'students'),
          where('schoolId', '==', schoolRef),
          where('isActive', '==', true)
        );
        const studentsColSnap = await retryWithBackoff(async () => await getDocs(studentsColQuery));
        console.log('[AdminFetch] students (ref+isActive) count:', studentsColSnap.size, { schoolId, role: userRole });
        let students = studentsColSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...(d.data() as any) }));

        if (students.length === 0) {
          // Try without isActive
          const studentsNoActiveQuery = query(
            collection(db, 'students'),
            where('schoolId', '==', schoolRef)
          );
          const studentsNoActiveSnap = await retryWithBackoff(async () => await getDocs(studentsNoActiveQuery));
          console.log('[AdminFetch] students (ref only) count:', studentsNoActiveSnap.size);
          students = studentsNoActiveSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...(d.data() as any) }));
        }

        if (students.length === 0) {
          // Try alt school collection ref
          const studentsAltRefQuery = query(
            collection(db, 'students'),
            where('schoolId', '==', altSchoolRef)
          );
          const studentsAltRefSnap = await retryWithBackoff(async () => await getDocs(studentsAltRefQuery));
          console.log('[AdminFetch] students (altRef) count:', studentsAltRefSnap.size);
          students = studentsAltRefSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...(d.data() as any) }));
        }

        if (students.length === 0) {
          // Try string-based schoolId in students
          const studentsStringIdQuery = query(
            collection(db, 'students'),
            where('schoolId', '==', schoolId)
          );
          const studentsStringIdSnap = await retryWithBackoff(async () => await getDocs(studentsStringIdQuery));
          console.log('[AdminFetch] students (string schoolId) count:', studentsStringIdSnap.size);
          students = studentsStringIdSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...(d.data() as any) }));
        }

        if (students.length === 0) {
          // Fallback: users collection (role field may vary in casing; schoolId may be a DocumentReference or a string)
          const usersQueryRefSchool = query(
            collection(db, 'users'),
            where('role', 'in', ['student', 'Student', 'STUDENT']),
            where('schoolId', '==', schoolRef)
          );
          const usersSnapRefSchool = await retryWithBackoff(async () => await getDocs(usersQueryRefSchool));
          console.log('[AdminFetch] users (role IN + ref schoolId) count:', usersSnapRefSchool.size);
          let users = usersSnapRefSchool.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...(d.data() as any) }));

          if (users.length === 0) {
            const usersQueryIdSchool = query(
              collection(db, 'users'),
              where('role', 'in', ['student', 'Student', 'STUDENT']),
              where('schoolId', '==', schoolId)
            );
            const usersSnapIdSchool = await retryWithBackoff(async () => await getDocs(usersQueryIdSchool));
            console.log('[AdminFetch] users (role IN + string schoolId) count:', usersSnapIdSchool.size);
            users = usersSnapIdSchool.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...(d.data() as any) }));
          }

          if (users.length === 0) {
            // Final fallback: fetch by role only, then filter by schoolId client-side (handles mixed schemas)
            try {
              const usersRoleOnlyQuery = query(
                collection(db, 'users'),
                where('role', 'in', ['student', 'Student', 'STUDENT'])
              );
              const usersRoleOnlySnap = await retryWithBackoff(async () => await getDocs(usersRoleOnlyQuery));
              console.log('[AdminFetch] users (role IN only) count:', usersRoleOnlySnap.size);
              let usersRoleOnly = usersRoleOnlySnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...(d.data() as any) }));
              usersRoleOnly = usersRoleOnly.filter((u: any) => {
                const sid = (u as any).schoolId;
                if (!sid) return false;
                if (typeof sid === 'string') return sid === schoolId;
                if (sid?.id) return sid.id === schoolId;
                return false;
              });
              console.log('[AdminFetch] users (role IN only, filtered client-side) count:', usersRoleOnly.length);
              users = usersRoleOnly;
            } catch (e) {
              console.warn('Fallback users by role only failed', e);
            }
          }

          students = users; // show users when students collection is empty
        }

        setAdminStudents(students);
        return; // Skip student-only data fetch below
      }

      // Get student details
      const studentQuery = query(
        collection(db, "students"),
        where("userId", "==", user.uid),
        where("isActive", "==", true)
      );

      const studentSnapshot = await retryWithBackoff(async () => {
        return await getDocs(studentQuery);
      });
      
      const studentData = studentSnapshot.docs[0]?.data();

      if (studentData) {
        setCurrentStudent(studentData);
        
        // Fetch available tests
        const availableTestsData = await getStudentTestsWithDetails(
          studentSnapshot.docs[0].id
        );
        setAvailableTests(availableTestsData);
      }
      
      // Query test results for the current user
      const testResultsRef = collection(db, 'testResults');
      const q = query(testResultsRef, where('studentId', '==', user.uid));
      
      const querySnapshot = await retryWithBackoff(async () => {
        return await getDocs(q);
      });
      
      const results: TestResult[] = [];
      
      // Process each test result
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        
        // Use the new comprehensive data structure
        const testName = data.testName || 'Unknown Test';
        const subjectName = data.subjectName || 'Unknown Subject';
        const percentageScore = data.percentageScore || 0;
        const grade = data.grade || calculateGrade(percentageScore);
        
        results.push({
          id: docSnapshot.id,
          testId: data.testId || '',
          testName,
          subjectName,
          score: percentageScore, // Use percentage as score for backward compatibility
          totalMarks: 100, // Always 100 for percentage-based system
          date: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
          percentageScore,
          grade,
          testResultId: docSnapshot.id // Use the document ID as test result ID
        });
      }
      
      // Sort by date (newest first)
      results.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      setTestResults(results);
      
      // Get recent tests (last 5)
      setRecentTests(results.slice(0, 5));
      
      
      // Calculate overall average
      const allScores = results.map(r => r.percentageScore);
      const average = allScores.length > 0 
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
        : 0;
      setOverallAverage(average);
      
      // Generate progress data (for line chart)
      const progressMap = new Map<string, {date: Date, score: number}[]>();
      
      results.forEach(result => {
        if (!progressMap.has(result.subjectName)) {
          progressMap.set(result.subjectName, []);
        }
        progressMap.get(result.subjectName)?.push({
          date: result.date,
          score: result.percentageScore
        });
      });
      
      // Convert to chart data format
      const progressDataPoints: any[] = [];
      let index = 0;
      
      progressMap.forEach((points, subject) => {
        // Sort by date (oldest first for progress chart)
        points.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        points.forEach((point, i) => {
          const dateStr = point.date.toLocaleDateString();
          const existingPoint = progressDataPoints.find(p => p.date === dateStr);
          
          if (existingPoint) {
            existingPoint[subject] = point.score;
          } else {
            const newPoint: any = { date: dateStr };
            newPoint[subject] = point.score;
            progressDataPoints.push(newPoint);
          }
        });
      });
      
      setProgressData(progressDataPoints);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = handleFirebaseError(error, 'fetching assessment data');
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, userRole, schoolId]);

  const handleRefresh = () => {
    fetchData(true);
  };

  // Filter data based on selected time range
  const filterDataByTimeRange = (data: TestResult[]) => {
    if (selectedTimeRange === 'all') return data;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    if (selectedTimeRange === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (selectedTimeRange === 'quarter') {
      cutoffDate.setMonth(now.getMonth() - 3);
    } else if (selectedTimeRange === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    return data.filter(item => item.date >= cutoffDate);
  };

  const filteredResults = filterDataByTimeRange(testResults);

  const startTest = (testId: string) => {
    // Navigate to test taking interface
    window.location.href = `/sample-test?testId=${testId}`;
  };

  // Admin/Teacher/Principal view: show students in their school
  if (userRole && userRole !== 'student') {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Assessment Dashboard</h1>
            <div className="flex gap-3">
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Refresh data from Firebase"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Students in your school</h2>
                <span className="text-sm text-gray-500">{adminStudents.length} students</span>
              </div>
              <div className="text-xs text-gray-500 mb-3">Role: {userRole} • School: {schoolId}</div>
              {adminStudents.length === 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-4 text-yellow-800">
                  No students found for your school. Ensure student records have a valid schoolId and role set.
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminStudents.map((s: any) => {
                      const uid = s.userId || s.uid || (s.role ? s.id : undefined); // prefer explicit userId; fallback to users doc id
                      const href = uid
                        ? `/assessment-dashboard/student/${s.id}?uid=${encodeURIComponent(uid)}`
                        : `/assessment-dashboard/student/${s.id}`;
                      return (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                            <Link href={href} className="hover:underline">{s.displayName || s.name || '-'}</Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.email || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.class || s.className || (s.classId?.id ?? '-') }</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Assessment Dashboard</h1>
          <div className="flex gap-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Refresh data from Firebase"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link href="/sample-test">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Take Sample Test
              </button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-md">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'available', label: 'Available Tests', icon: BookOpen },
              { id: 'allTests', label: 'All Tests', icon: List },
              { id: 'results', label: 'Test Results', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Performance Overview - Stats Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium opacity-90 mb-1">Overall Average</h2>
                      <div className="flex items-end">
                        <span className="text-3xl font-bold">
                          {overallAverage.toFixed(1)}%
                        </span>
                        <span className="ml-2 text-sm opacity-75">
                          ({calculateGrade(overallAverage)})
                        </span>
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium opacity-90 mb-1">Tests Completed</h2>
                      <div className="text-3xl font-bold">
                        {filteredResults.length}
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium opacity-90 mb-1">Available Tests</h2>
                      <div className="text-3xl font-bold">
                        {availableTests.filter(t => t.canTake).length}
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium opacity-90 mb-1">Best Percentage</h2>
                      <div className="text-3xl font-bold">
                        {testResults.length > 0 ? 
                          `${Math.max(...testResults.map(t => t.percentageScore)).toFixed(1)}%`
                          : 'N/A'
                        }
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>


              {/* Progress Over Time */}
              {progressData.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Progress Over Time</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={progressData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        {Object.keys(progressData[0] || {}).filter(key => key !== 'date').map((subject, index) => (
                          <Line
                            key={subject}
                            type="monotone"
                            dataKey={subject}
                            stroke={COLORS[index % COLORS.length]}
                            activeDot={{ r: 8 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Grade Distribution */}
              {filteredResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Grade Distribution</h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={
                              ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(grade => ({
                                name: grade,
                                value: filteredResults.filter(r => r.grade === grade).length
                              })).filter(item => item.value > 0)
                            }
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {
                              ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))
                            }
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Tests</h2>
                    <div className="overflow-y-auto max-h-64">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentTests.map((test) => (
                            <tr key={test.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.testName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.subjectName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.percentageScore.toFixed(1)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.date.toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.testResultId && (
                                  <Link href={`/test-result/${test.testResultId}`}>
                                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                                      View Details
                                    </button>
                                  </Link>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Available Tests Tab - Only Active Tests */}
          {activeTab === 'available' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Available Tests</h2>
                
                {availableTests.filter(test => test.status !== 'finished').length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No active tests available at the moment.</p>
                    <p className="text-gray-400 text-sm mt-2">Check back later for new assessments.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableTests.filter(test => test.status !== 'finished').map((test) => (
                      <div key={test.id} className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {test.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              test.status
                            )}`}
                          >
                            {test.status}
                          </span>
                        </div>

                        <div className="space-y-3 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Start: {test.start?.toDate().toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>End: {test.end?.toDate().toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>Questions: {test.questions?.length || 0}</span>
                          </div>
                          {test.status === "ongoing" && (
                            <div className="flex items-center space-x-2 text-red-600 font-medium">
                              <AlertCircle className="w-4 h-4" />
                              <span>Time remaining: {formatTimeRemaining(test.timeRemaining)}</span>
                            </div>
                          )}
                          {test.hasCompleted && (
                            <div className="flex items-center space-x-2 text-green-600 font-medium">
                              <CheckCircle className="w-4 h-4" />
                              <span>Test Completed</span>
                            </div>
                          )}
                          <div className="text-blue-600 font-medium">
                            {test.wholeClass ? "Whole Class Test" : "Selective Test"}
                          </div>
                          {test.subjectName && (
                            <div className="text-gray-500">
                              Subject: {test.subjectName}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => startTest(test.id)}
                          disabled={!test.canTake}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                            test.canTake
                              ? "bg-blue-600 text-white hover:bg-blue-700 transform hover:-translate-y-1"
                              : test.hasCompleted
                              ? "bg-green-100 text-green-700 cursor-not-allowed"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {test.canTake ? "Start Test" : test.hasCompleted ? "Completed" : "Test Unavailable"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Tests Tab - Including Expired Tests */}
          {activeTab === 'allTests' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">All Tests</h2>
                
                {availableTests.length === 0 ? (
                  <div className="text-center py-12">
                    <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No tests found.</p>
                    <p className="text-gray-400 text-sm mt-2">No tests have been created for your class yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableTests.map((test) => (
                      <div key={test.id} className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {test.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              test.status
                            )}`}
                          >
                            {test.status}
                          </span>
                        </div>

                        <div className="space-y-3 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Start: {test.start?.toDate().toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>End: {test.end?.toDate().toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>Questions: {test.questions?.length || 0}</span>
                          </div>
                          {test.status === "ongoing" && (
                            <div className="flex items-center space-x-2 text-red-600 font-medium">
                              <AlertCircle className="w-4 h-4" />
                              <span>Time remaining: {formatTimeRemaining(test.timeRemaining)}</span>
                            </div>
                          )}
                          {test.hasCompleted && (
                            <div className="flex items-center space-x-2 text-green-600 font-medium">
                              <CheckCircle className="w-4 h-4" />
                              <span>Test Completed</span>
                            </div>
                          )}
                          <div className="text-blue-600 font-medium">
                            {test.wholeClass ? "Whole Class Test" : "Selective Test"}
                          </div>
                          {test.subjectName && (
                            <div className="text-gray-500">
                              Subject: {test.subjectName}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => startTest(test.id)}
                          disabled={!test.canTake}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                            test.canTake
                              ? "bg-blue-600 text-white hover:bg-blue-700 transform hover:-translate-y-1"
                              : test.hasCompleted
                              ? "bg-green-100 text-green-700 cursor-not-allowed"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {test.canTake ? "Start Test" : test.hasCompleted ? "Completed" : "Test Unavailable"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              {/* Time Range Filter */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Filter by Time Range</h2>
                <div className="flex space-x-4">
                  {['all', 'month', 'quarter', 'year'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedTimeRange(range)}
                      className={`px-4 py-2 rounded-md ${
                        selectedTimeRange === range
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {range === 'all' ? 'All Time' : 
                       range === 'month' ? 'Last Month' : 
                       range === 'quarter' ? 'Last 3 Months' : 'Last Year'}
                    </button>
                  ))}
                </div>
              </div>

              {filteredResults.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700">No Test Results Available</h2>
                  <p className="text-gray-500 mt-2">
                    You haven't completed any tests yet. Your results will appear here once you take assessments.
                  </p>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Results</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredResults.map((test) => (
                          <tr key={test.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.testName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.subjectName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {test.percentageScore.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {test.date.toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {test.testResultId && (
                                <Link href={`/test-result/${test.testResultId}`}>
                                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                                    View Details
                                  </button>
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default AssessmentDashboard;
