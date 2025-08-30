'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../../../lib/firebaseClient';
import Link from 'next/link';
import Sidebar from "../../components/Sidebar";

import { Users, GraduationCap, ArrowLeft, Mail, Phone, Calendar, User } from 'lucide-react';

// Types for student data
type StudentData = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt?: any;
  isActive?: boolean;
};

// Types for class data
type ClassData = {
  id: string;
  name: string;
  classCode?: string;
  description?: string;
  teacherId?: string;
  teacherName?: string;
};

const ClassDetailsPage = () => {
  const params = useParams();
  const classId = params.classId as string;
  const { user, schoolId, userRole } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classInfo, setClassInfo] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch class information and students
  const fetchClassDetails = async (isRefresh = false) => {
    if (!user || !schoolId || !classId) {
      console.log('[ClassDetails] Missing required data:', { user: !!user, schoolId, classId });
      return;
    }

    console.log('[ClassDetails] Fetching details for class:', classId);

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      // Fetch class information
      const classDoc = await getDoc(doc(db, 'classes', classId));
      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }

      const classData = classDoc.data() as any;

      // Get teacher information if teacherId exists
      let teacherName = 'Not Assigned';
      if (classData.teacherId) {
        try {
          const teacherDoc = await getDoc(doc(db, 'users', classData.teacherId));
          if (teacherDoc.exists()) {
            const teacherData = teacherDoc.data();
            teacherName = teacherData.displayName || teacherData.name || 'Unknown Teacher';
          }
        } catch (error) {
          console.warn('Error fetching teacher data:', error);
        }
      }

      const classInfo: ClassData = {
        id: classDoc.id,
        name: classData.name || 'Unnamed Class',
        classCode: classData.classCode || '',
        description: classData.description || '',
        teacherId: classData.teacherId || '',
        teacherName
      };

      setClassInfo(classInfo);

      // Fetch students in this class
      const studentsQuery = query(
        collection(db, 'students'),
        where('classId', '==', doc(db, 'classes', classId)),
        where('isActive', '==', true)
      );

      const studentsSnapshot = await getDocs(studentsQuery);
      console.log('[ClassDetails] Found', studentsSnapshot.size, 'students in class', classInfo.name);

      // Get detailed student information
      const studentsData: StudentData[] = [];

      for (const studentDoc of studentsSnapshot.docs) {
        const studentData = studentDoc.data() as any;

        // Get user information for each student
        let studentInfo: StudentData = {
          id: studentDoc.id,
          userId: studentData.userId || '',
          name: studentData.name || 'Unknown Student',
          email: studentData.email || '',
          phone: studentData.phone || '',
          createdAt: studentData.createdAt,
          isActive: studentData.isActive !== false
        };

        // Try to get additional user info if userId exists
        if (studentData.userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', studentData.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              studentInfo.name = userData.displayName || userData.name || studentInfo.name;
              studentInfo.email = userData.email || studentInfo.email;
            }
          } catch (error) {
            console.warn('Error fetching user data for student:', studentDoc.id, error);
          }
        }

        studentsData.push(studentInfo);
      }

      // Sort students by name
      studentsData.sort((a, b) => a.name.localeCompare(b.name));

      setStudents(studentsData);

    } catch (error) {
      console.error('Error fetching class details:', error);
      const errorMessage = 'Failed to load class details. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, [user, schoolId, classId]);

  const handleRefresh = () => {
    fetchClassDetails(true);
  };

  // Check if user has permission to view class details
  if (!userRole || (userRole !== 'admin' && userRole !== 'teacher' && userRole !== 'principal')) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 bg-slate-50">
          <div className="p-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h1>
              <p className="text-gray-600 mb-4">
                You don't have permission to view class details.
              </p>
              <Link href="/assessment-dashboard/dash">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Back to Classes Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-slate-50">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Link href="/assessment-dashboard/dash">
                <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Classes
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {classInfo?.name || 'Class Details'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {classInfo?.classCode && `Code: ${classInfo.classCode} • `}
                  {students.length} students enrolled
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white border border-slate-200/70 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Refresh data from Firebase"
              >
                <Users className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Class Information Card */}
          {classInfo && (
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Class Name</h3>
                  <p className="text-lg font-semibold text-gray-900">{classInfo.name}</p>
                </div>
                {classInfo.classCode && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Class Code</h3>
                    <p className="text-lg font-semibold text-gray-900">{classInfo.classCode}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Class Teacher</h3>
                  <p className="text-lg font-semibold text-gray-900">{classInfo.teacherName}</p>
                </div>
              </div>
              {classInfo.description && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-700">{classInfo.description}</p>
                </div>
              )}
            </div>
          )}

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

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Students Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-slate-600 mb-1">Total Students</h2>
                      <div className="text-3xl font-bold text-slate-900">{students.length}</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-slate-600 mb-1">Active Students</h2>
                      <div className="text-3xl font-bold text-slate-900">
                        {students.filter(s => s.isActive !== false).length}
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-green-600">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Students List */}
              <div className="bg-white rounded-xl shadow">
                <div className="p-6 border-b border-slate-200/70">
                  <h2 className="text-xl font-semibold text-gray-900">Students in {classInfo?.name}</h2>
                  <p className="text-gray-600 mt-1">{students.length} students enrolled</p>
                </div>

                {students.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Students Found</h3>
                    <p className="text-gray-500 mb-6">
                      No students have been enrolled in this class yet.
                    </p>
                    <Link href="/assessment-dashboard/dash">
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Back to Classes Dashboard
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enrolled Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    <Link
                                      href={`/assessment-dashboard/student/${student.id}`}
                                      className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      {student.name}
                                    </Link>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {student.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.email ? (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    {student.email}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Not provided</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.phone ? (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {student.phone}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Not provided</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                student.isActive !== false
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {student.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetailsPage;
