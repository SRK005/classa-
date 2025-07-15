"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebaseClient";
import { useAuth } from "../../contexts/AuthContext";
import LearningManagementSidebar from "../components/LearningManagementSidebar";
import DiaryForm from "../../components/forms/DiaryForm";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faBook,
  faExclamationTriangle,
  faCalendarAlt,
  faUser,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: any;
  classId: string;
  subjectId: string;
  studentId: string;
  createdAt: any;
  updatedAt?: any;
}

interface DiaryEntryWithDetails extends DiaryEntry {
  className: string;
  subjectName: string;
  studentName: string;
}

export default function DiaryManagementPage() {
  const { schoolId, loading: authLoading } = useAuth();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!authLoading) {
      if (schoolId) {
        fetchDiaryEntries();
      } else {
        setError("School ID not found. Please ensure you're logged in as a school administrator.");
        setLoading(false);
      }
    }
  }, [schoolId, authLoading]);

  const fetchDiaryEntries = async () => {
    if (!schoolId) return;

    setLoading(true);
    setError("");
    
    try {
      const diaryQuery = query(
        collection(db, "diary"),
        where("schoolId", "==", doc(db, "school", schoolId))
      );
      const diarySnapshot = await getDocs(diaryQuery);
      
      const entryPromises = diarySnapshot.docs.map(async (entryDoc) => {
        const entryData = entryDoc.data();
        const entry: DiaryEntry = {
          id: entryDoc.id,
          title: entryData.title || "",
          content: entryData.content || "",
          date: entryData.date,
          classId: entryData.classId?.id || entryData.classId || "",
          subjectId: entryData.subjectId?.id || entryData.subjectId || "",
          studentId: entryData.studentId?.id || entryData.studentId || "",
          createdAt: entryData.createdAt,
          updatedAt: entryData.updatedAt,
        };

        // Fetch class name
        let className = "Unknown Class";
        try {
          if (entry.classId) {
            const classDoc = await getDoc(doc(db, "classes", entry.classId));
            if (classDoc.exists()) {
              className = classDoc.data().name;
            }
          }
        } catch (error) {
          console.error("Error fetching class name:", error);
        }

        // Fetch subject name
        let subjectName = "Unknown Subject";
        try {
          if (entry.subjectId) {
            const subjectDoc = await getDoc(doc(db, "subjects", entry.subjectId));
            if (subjectDoc.exists()) {
              subjectName = subjectDoc.data().name;
            }
          }
        } catch (error) {
          console.error("Error fetching subject name:", error);
        }

        // Fetch student name
        let studentName = "Unknown Student";
        try {
          if (entry.studentId) {
            const studentDoc = await getDoc(doc(db, "students", entry.studentId));
            if (studentDoc.exists()) {
              studentName = studentDoc.data().name;
            }
          }
        } catch (error) {
          console.error("Error fetching student name:", error);
        }

        return {
          ...entry,
          className,
          subjectName,
          studentName,
        };
      });

      const entriesWithDetails = await Promise.all(entryPromises);
      // Sort by date (newest first)
      entriesWithDetails.sort((a, b) => {
        if (a.date && b.date) {
          return b.date.toDate().getTime() - a.date.toDate().getTime();
        }
        return 0;
      });
      setDiaryEntries(entriesWithDetails);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
      setError("Failed to load diary entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm("Are you sure you want to delete this diary entry?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "diary", entryId));
      setDiaryEntries(diaryEntries.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error("Error deleting diary entry:", error);
      setError("Failed to delete diary entry");
    }
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEntry(null);
    fetchDiaryEntries();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if no school ID
  if (!schoolId) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <LearningManagementSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-4xl mb-4" />
              <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
              <p className="text-red-600 mb-4">
                You don't have permission to access this page. Please ensure you're logged in as a school administrator.
              </p>
              <button
                onClick={() => window.location.href = "/login"}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LearningManagementSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Diary Management</h1>
              <p className="text-gray-600">Manage student diary entries and daily activities</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Diary Entry
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{error}</span>
              </div>
              <button
                onClick={() => fetchDiaryEntries()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-600">Loading diary entries...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {diaryEntries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <FontAwesomeIcon icon={faBook} className="text-4xl text-gray-300 mb-4" />
                            <p className="text-lg font-medium mb-2">No diary entries found</p>
                            <p className="text-sm">Create your first diary entry to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      diaryEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                              <span className="text-sm text-gray-900">{entry.studentName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faGraduationCap} className="text-gray-400" />
                              <span className="text-sm text-gray-900">{entry.className}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {entry.subjectName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {entry.date?.toDate?.()?.toLocaleDateString() || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {entry.content || "No content"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditEntry(entry)}
                                className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                                title="Edit diary entry"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                                title="Delete diary entry"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <DiaryForm
                entryId={editingEntry?.id}
                initialData={editingEntry ? {
                  title: editingEntry.title,
                  content: editingEntry.content,
                  date: editingEntry.date,
                  classId: editingEntry.classId,
                  subjectId: editingEntry.subjectId,
                  studentId: editingEntry.studentId,
                } : undefined}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 