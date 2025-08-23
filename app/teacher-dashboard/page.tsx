"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import RoleBasedRoute from '../../app/components/RoleBasedRoute';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Define TypeScript interfaces for our data
interface ClassData {
  id: string;
  name: string;
  subject?: string;
  students?: string[];
  teacherId: string;
  [key: string]: any; // Allow for additional properties
}

interface TestData {
  id: string;
  name: string;
  createdBy: string;
  start?: string;
  end?: string;
  published?: boolean;
  online?: boolean;
  questions?: any[];
  [key: string]: any; // Allow for additional properties
}

export default function TeacherDashboardPage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = React.useState<ClassData[]>([]);
  const [tests, setTests] = React.useState<TestData[]>([]);
  const [stats, setStats] = React.useState({
    totalClasses: 0,
    totalStudents: 0,
    totalTests: 0,
    completedTests: 0
  });
  const [loadingData, setLoadingData] = React.useState(true);

  // Fetch teacher-specific data
  React.useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;
      
      try {
        setLoadingData(true);
        
        // Fetch classes assigned to this teacher
        const classesQuery = query(
          collection(db, 'classes'),
          where('teacherId', '==', user.uid)
        );
        const classesSnapshot = await getDocs(classesQuery);
        const classesData = classesSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // Ensure required fields exist with defaults
          name: doc.data().name || 'Unnamed Class',
          teacherId: doc.data().teacherId || user.uid
        })) as ClassData[];
        setClasses(classesData);
        
        // Fetch tests created by this teacher
        const testsQuery = query(
          collection(db, 'tests'),
          where('createdBy', '==', user.uid)
        );
        const testsSnapshot = await getDocs(testsQuery);
        const testsData = testsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // Ensure required fields exist with defaults
          name: doc.data().name || 'Unnamed Test',
          createdBy: doc.data().createdBy || user.uid
        })) as TestData[];
        setTests(testsData);
        
        // Calculate stats
        const now = new Date();
        const completedTests = testsData.filter(test => test.end && new Date(test.end as string) < now).length;
        
        // Count total students across all classes
        let totalStudents = 0;
        for (const classItem of classesData) {
          if (classItem.students && Array.isArray(classItem.students)) {
            totalStudents += classItem.students.length;
          }
        }
        
        setStats({
          totalClasses: classesData.length,
          totalStudents,
          totalTests: testsData.length,
          completedTests
        });
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchTeacherData();
  }, [user]);
  
  // Show loading state while checking authentication
  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600">Welcome, {user?.displayName || user?.email}!</p>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-blue-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <UserGroupIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-green-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <AcademicCapIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Classes</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalClasses}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-purple-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <ClipboardDocumentListIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tests</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalTests}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-amber-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                    <ChartBarIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Tests</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.completedTests}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Classes Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 mb-8 border border-blue-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-500" />
                Your Classes
              </h2>
              
              {classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map(classItem => (
                    <div key={classItem.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-medium">{classItem.name}</h3>
                      <p className="text-sm text-gray-600">{classItem.subject || 'No subject'}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {classItem.students?.length || 0} students
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No classes assigned yet.</p>
              )}
            </div>
            
            {/* Tests Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-purple-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 mr-2 text-purple-500" />
                Your Tests
              </h2>
              
              {tests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tests.map(test => (
                        <tr key={test.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs ${test.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {test.online ? 'Online' : 'Offline'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {test.questions?.length || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {test.start ? new Date(test.start).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {test.end ? new Date(test.end).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No tests created yet.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </RoleBasedRoute>
  );
}
