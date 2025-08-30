'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../lib/firebaseClient';
import Link from 'next/link';
import Sidebar from "@/app/assessment-dashboard/components/Sidebar";

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
import { Clock, CheckCircle, AlertCircle, Calendar, BookOpen, Target, TrendingUp, Award, List, RefreshCw, Users, GraduationCap } from 'lucide-react';
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
    // Derived KPIs for admin view
    const totalStudents = adminStudents.length;
    const classAssignedCount = adminStudents.filter((s: any) => !!(s.class || s.className || (typeof s.classId === 'string' ? s.classId : s.classId?.id))).length;
    const uniqueClassCount = Array.from(new Set(adminStudents
      .map((s: any) => s.class || s.className || (typeof s.classId === 'string' ? s.classId : s.classId?.id))
      .filter(Boolean)
    )).length;
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 bg-slate-50">
          <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Assessment Dashboard</h1>
            <div className="flex gap-3">
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="bg-white border border-slate-200/70 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            <>
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-slate-600 mb-1">Total Students</h2>
                      <div className="text-3xl font-bold text-slate-900">{totalStudents}</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-slate-600 mb-1">With Class Assigned</h2>
                      <div className="text-3xl font-bold text-slate-900">{classAssignedCount}</div>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-slate-600 mb-1">Unique Classes</h2>
                      <div className="text-3xl font-bold text-slate-900">{uniqueClassCount}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
                      <List className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white p-6 rounded-xl shadow border border-slate-200/70">
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
            </>
          )}
          </div>
        </div>
      </div>
    );
  }

  // Student view: redirect to admin dashboard or show appropriate message
  if (userRole === 'student') {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 bg-slate-50">
          <div className="p-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h1>
              <p className="text-gray-600 mb-4">
                Students should access their assessments through the main testing interface.
              </p>
              <Link href="/sample-test">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Go to Test Interface
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-slate-50">
        <div className="p-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
            <p className="text-gray-600">Please contact your administrator for access.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;
