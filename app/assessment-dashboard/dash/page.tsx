'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../../lib/firebaseClient';
import Link from 'next/link';
import Sidebar from "@/app/assessment-dashboard/components/Sidebar";

import { Users, GraduationCap, BookOpen, RefreshCw, AlertCircle, Plus, User, Calendar } from 'lucide-react';

// Types for class data based on schema
type ClassData = {
  id: string;
  name: string;
  classCode?: string;
  description?: string;
  schoolId: string;
  teacherId?: string;
  teacherName?: string;
  studentCount?: number;
  subjectCount?: number;
  createdAt?: any;
  createdTime?: any;
  updatedAt?: any;
  isActive?: boolean;
  createdBy?: string;
};

const ClassesDashboard = () => {
  const { user, schoolId, userRole } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch classes using the proven query pattern from school management
  const fetchClasses = async (isRefresh = false) => {
    if (!user || !schoolId) {
      console.log('[Classes] Missing user or schoolId:', { user: !!user, schoolId });
      return;
    }

    console.log('[Classes] Starting fetch with schoolId:', schoolId, 'user:', user.uid);

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      // Use the working query pattern from school management (schema reference)
      const classesQuery = query(
        collection(db, "classes"),
        where("schoolId", "==", doc(db, "school", schoolId))
      );

      console.log('[Classes] Executing query with school reference');
      const classesSnapshot = await getDocs(classesQuery);
      console.log('[Classes] Found', classesSnapshot.size, 'classes');

      // Process each class and enhance with related data
      const classesData: ClassData[] = [];

      for (const classDoc of classesSnapshot.docs) {
        const classData = classDoc.data() as any;
        console.log('[Classes] Processing class:', classDoc.id, 'Name:', classData.name);

        // Parallel queries for student and subject counts (optimization from schema)
        const [studentsSnapshot] = await Promise.all([
          // Get student count for this class
          getDocs(query(
            collection(db, "students"),
            where("classId", "==", doc(db, "classes", classDoc.id)),
            where("isActive", "==", true)
          ))
        ]);

        // Get subject count for this class - different approach
        // Subjects have assClass array, not classId field
        let subjectCount = 0;
        try {
          const allSubjectsQuery = query(
            collection(db, "subjects"),
            where("schoolId", "==", doc(db, "school", schoolId))
          );
          const allSubjectsSnapshot = await getDocs(allSubjectsQuery);

          // Count subjects that have this class in their assClass array
          for (const subjectDoc of allSubjectsSnapshot.docs) {
            const subjectData = subjectDoc.data();
            const assClass = subjectData.assClass || [];

            // Check if this class is in the subject's assigned classes
            if (assClass.some((classRef: any) => classRef.id === classDoc.id)) {
              subjectCount++;
            }
          }

          console.log('[Classes] Found', subjectCount, 'subjects for class', classData.name);
        } catch (error) {
          console.warn('Error fetching subject count for class:', classDoc.id, error);
        }

        // Get teacher information if teacherId exists
        let teacherName = 'Not Assigned';
        if (classData.teacherId) {
          try {
            const teacherDoc = await getDoc(doc(db, "users", classData.teacherId));
            if (teacherDoc.exists()) {
              const teacherData = teacherDoc.data();
              teacherName = teacherData.displayName || teacherData.name || 'Unknown Teacher';
            }
          } catch (error) {
            console.warn('Error fetching teacher data for class:', classDoc.id, error);
          }
        }

        classesData.push({
          id: classDoc.id,
          name: classData.name || 'Unnamed Class',
          classCode: classData.classCode || '',
          description: classData.description || '',
          schoolId: classData.schoolId || '',
          teacherId: classData.teacherId || '',
          teacherName,
          studentCount: studentsSnapshot.size,
          subjectCount,
          createdAt: classData.createdAt,
          createdTime: classData.createdTime,
          updatedAt: classData.updatedAt,
          isActive: classData.isActive !== false,
          createdBy: classData.createdBy
        });
      }

      console.log('[Classes] Processed', classesData.length, 'classes with enhanced data');

      // Sort classes by name (alphabetical)
      classesData.sort((a, b) => a.name.localeCompare(b.name));

      setClasses(classesData);

    } catch (error) {
      console.error('Error fetching classes:', error);
      const errorMessage = 'Failed to load classes. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user, schoolId]);

  const handleRefresh = () => {
    fetchClasses(true);
  };

  // Check if user has permission to view classes
  if (!userRole || (userRole !== 'admin' && userRole !== 'teacher' && userRole !== 'principal')) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 bg-slate-50">
          <div className="p-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h1>
              <p className="text-gray-600 mb-4">
                You don't have permission to view the classes dashboard.
              </p>
              <Link href="/assessment-dashboard">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Go to Assessment Dashboard
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
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Classes Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and view all classes in your school</p>
            </div>
            <div className="flex gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white border border-slate-200/70 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Refresh data from Firebase"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
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

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Classes Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-slate-600 mb-1">Total Classes</h2>
                      <div className="text-3xl font-bold text-slate-900">{classes.length}</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-slate-600 mb-1">Total Students</h2>
                      <div className="text-3xl font-bold text-slate-900">
                        {classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)}
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-green-600">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-slate-600 mb-1">Total Subjects</h2>
                      <div className="text-3xl font-bold text-slate-900">
                        {classes.reduce((sum, cls) => sum + (cls.subjectCount || 0), 0)}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Classes Grid */}
              {classes.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow text-center">
                  <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">No Classes Found</h2>
                  <p className="text-gray-500 mb-6">
                    No classes have been created for your school yet.
                  </p>
                  <Link href="/assessment-dashboard/classes/create">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Create First Class
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="bg-white rounded-xl shadow hover:shadow-md transition-transform hover:scale-[1.01] border border-slate-200/70"
                    >
                      {/* Class Header */}
                      <div className="p-6 border-b border-slate-200/70">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {classItem.name}
                          </h3>
                          {classItem.classCode && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                              {classItem.classCode}
                            </span>
                          )}
                        </div>
                        {classItem.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {classItem.description}
                          </p>
                        )}
                      </div>

                      {/* Class Stats */}
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Users className="w-4 h-4 text-green-600 mr-1" />
                              <span className="text-xs text-gray-500">Students</span>
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              {classItem.studentCount || 0}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <BookOpen className="w-4 h-4 text-purple-600 mr-1" />
                              <span className="text-xs text-gray-500">Subjects</span>
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              {classItem.subjectCount || 0}
                            </div>
                          </div>
                        </div>

                        {/* Teacher Info */}
                        <div className="mb-4">
                          <div className="text-xs text-gray-500 mb-1">Class Teacher</div>
                          <div className="text-sm font-medium text-gray-900">
                            {classItem.teacherName}
                          </div>
                        </div>

                        {/* Creation Date */}
                        {classItem.createdTime && (
                          <div className="mb-4">
                            <div className="text-xs text-gray-500 mb-1">Created</div>
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                              {classItem.createdTime.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Link href={`/assessment-dashboard/classes/${classItem.id}`}>
                            <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                              View Details
                            </button>
                          </Link>
                          <Link href={`/assessment-dashboard/classes/${classItem.id}/edit`}>
                            <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                              Edit
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassesDashboard;