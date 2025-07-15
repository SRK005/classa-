"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebaseClient";
import { useAuth } from "../../contexts/AuthContext";
import LearningManagementSidebar from "../components/LearningManagementSidebar";
import AssignmentForm from "../../components/forms/AssignmentForm";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faClipboardList,
  faExclamationTriangle,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

interface Assignment {
  id: string;
  topic: string;
  description: string;
  classId: string;
  subjectId: string;
  chapterId: string;
  lessonId: string;
  attachmentUrl?: string;
  attachmentName?: string;
  startDate: any;
  endDate: any;
  createdAt: any;
  updatedAt?: any;
}

interface AssignmentWithDetails extends Assignment {
  className: string;
  subjectName: string;
  chapterName: string;
  lessonName: string;
}

export default function AssignmentManagementPage() {
  const { schoolId, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    console.log("AuthContext state:", { schoolId, authLoading });
    
    if (!authLoading) {
      if (schoolId) {
        fetchAssignments();
      } else {
        setError("School ID not found. Please ensure you're logged in as a school administrator or teacher.");
        setLoading(false);
      }
    }
  }, [schoolId, authLoading]);

  const fetchAssignments = async () => {
    if (!schoolId) return;

    console.log("Fetching assignments for school:", schoolId);
    setLoading(true);
    setError("");
    
    try {
      const assignmentsQuery = query(
        collection(db, "assignments"),
        where("schoolId", "==", doc(db, "school", schoolId))
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      console.log("Assignments found:", assignmentsSnapshot.size);
      
      const assignmentPromises = assignmentsSnapshot.docs.map(async (assignmentDoc) => {
        const assignmentData = assignmentDoc.data();
        const assignment: Assignment = {
          id: assignmentDoc.id,
          topic: assignmentData.topic || "",
          description: assignmentData.description || "",
          classId: assignmentData.classId?.id || assignmentData.classId || "",
          subjectId: assignmentData.subjectId?.id || assignmentData.subjectId || "",
          chapterId: assignmentData.chapterId?.id || assignmentData.chapterId || "",
          lessonId: assignmentData.lessonId?.id || assignmentData.lessonId || "",
          attachmentUrl: assignmentData.attachmentUrl || "",
          attachmentName: assignmentData.attachmentName || "",
          startDate: assignmentData.startDate,
          endDate: assignmentData.endDate,
          createdAt: assignmentData.createdAt,
          updatedAt: assignmentData.updatedAt,
        };

        // Fetch related data
        const [className, subjectName, chapterName, lessonName] = await Promise.all([
          fetchName("classes", assignment.classId),
          fetchName("subjects", assignment.subjectId),
          fetchName("chapters", assignment.chapterId),
          fetchName("lessons", assignment.lessonId),
        ]);

        return {
          ...assignment,
          className: className || "Unknown Class",
          subjectName: subjectName || "Unknown Subject",
          chapterName: chapterName || "Unknown Chapter",
          lessonName: lessonName || "Unknown Lesson",
        };
      });

      const assignmentsWithDetails = await Promise.all(assignmentPromises);
      // Sort by end date (most recent first)
      assignmentsWithDetails.sort((a, b) => {
        if (a.endDate && b.endDate) {
          return b.endDate.toDate().getTime() - a.endDate.toDate().getTime();
        }
        return 0;
      });
      setAssignments(assignmentsWithDetails);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError("Failed to load assignments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchName = async (collection: string, id: string): Promise<string> => {
    if (!id) return "";
    
    try {
      const docRef = doc(db, collection, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().name || docSnap.data().topic || "";
      }
    } catch (error) {
      console.error(`Error fetching ${collection} name:`, error);
    }
    return "";
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "assignments", assignmentId));
      setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
    } catch (error) {
      console.error("Error deleting assignment:", error);
      setError("Failed to delete assignment");
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAssignment(null);
    fetchAssignments();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAssignment(null);
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    return date.toDate ? date.toDate().toLocaleDateString() : "N/A";
  };

  const isOverdue = (endDate: any) => {
    if (!endDate) return false;
    const now = new Date();
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    return end < now;
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
                You don't have permission to access this page. Please ensure you're logged in as a school administrator or teacher.
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignment Management</h1>
              <p className="text-gray-600">Create and manage assignments for students</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Assignment
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{error}</span>
              </div>
              <button
                onClick={() => fetchAssignments()}
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
                <p className="mt-4 text-gray-600">Loading assignments...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Topic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chapter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lesson
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attachment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <FontAwesomeIcon icon={faClipboardList} className="text-4xl text-gray-300 mb-4" />
                            <p className="text-lg font-medium mb-2">No assignments found</p>
                            <p className="text-sm">Create your first assignment to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.topic}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {assignment.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {assignment.className}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {assignment.subjectName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {assignment.chapterName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {assignment.lessonName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(assignment.startDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${isOverdue(assignment.endDate) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                              {formatDate(assignment.endDate)}
                              {isOverdue(assignment.endDate) && (
                                <span className="text-xs block">Overdue</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {assignment.attachmentUrl ? (
                              <a
                                href={assignment.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <FontAwesomeIcon icon={faDownload} className="text-xs" />
                                <span className="text-xs">{assignment.attachmentName || "Download"}</span>
                              </a>
                            ) : (
                              <span className="text-gray-500 text-sm">No attachment</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditAssignment(assignment)}
                                className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                                title="Edit assignment"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                                title="Delete assignment"
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <AssignmentForm
                assignmentId={editingAssignment?.id}
                initialData={editingAssignment ? {
                  topic: editingAssignment.topic,
                  description: editingAssignment.description,
                  classId: editingAssignment.classId,
                  subjectId: editingAssignment.subjectId,
                  chapterId: editingAssignment.chapterId,
                  lessonId: editingAssignment.lessonId,
                  attachmentUrl: editingAssignment.attachmentUrl,
                  attachmentName: editingAssignment.attachmentName,
                  startDate: editingAssignment.startDate,
                  endDate: editingAssignment.endDate,
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