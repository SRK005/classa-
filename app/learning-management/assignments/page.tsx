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
  faCalendarAlt,
  faBook,
  faBookOpen,
  faUsers,
  faFileAlt,
  faClipboard,
  faClock,
  faBookmark,
  faGraduationCap,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "overdue" | "completed">("all");

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
          chapterName: chapterName || "N/A",
          lessonName: lessonName || "N/A",
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

  const getStatusColor = (assignment: AssignmentWithDetails) => {
    if (isOverdue(assignment.endDate)) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    const now = new Date();
    const start = assignment.startDate?.toDate() || new Date();
    const end = assignment.endDate?.toDate() || new Date();
    
    if (now >= start && now <= end) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getStatusText = (assignment: AssignmentWithDetails) => {
    if (isOverdue(assignment.endDate)) {
      return "Overdue";
    }
    const now = new Date();
    const start = assignment.startDate?.toDate() || new Date();
    const end = assignment.endDate?.toDate() || new Date();
    
    if (now >= start && now <= end) {
      return "Active";
    }
    return "Upcoming";
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    
    const status = getStatusText(assignment);
    if (filterStatus === "active") return matchesSearch && status === "Active";
    if (filterStatus === "overdue") return matchesSearch && status === "Overdue";
    if (filterStatus === "completed") return matchesSearch && status === "Upcoming";
    
    return matchesSearch;
  });

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
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignment Management</h1>
              <p className="text-gray-600">Create and manage assignments for students</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Assignment
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="overdue">Overdue</option>
                  <option value="completed">Upcoming</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
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
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                      <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FontAwesomeIcon icon={faClipboard} className="text-blue-600 text-xl" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-3xl font-bold text-green-600">
                        {assignments.filter(a => getStatusText(a) === "Active").length}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FontAwesomeIcon icon={faClock} className="text-green-600 text-xl" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overdue</p>
                      <p className="text-3xl font-bold text-red-600">
                        {assignments.filter(a => getStatusText(a) === "Overdue").length}
                      </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Upcoming</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {assignments.filter(a => getStatusText(a) === "Upcoming").length}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignments Grid */}
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faClipboardList} className="text-gray-400 text-6xl mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No assignments found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || filterStatus !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "Create your first assignment to get started"}
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Assignment
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAssignments.map((assignment) => (
                    <div key={assignment.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                      {/* Status Badge */}
                      <div className={`px-4 py-2 text-xs font-medium border-b ${getStatusColor(assignment)}`}>
                        {getStatusText(assignment)}
                      </div>
                      
                      <div className="p-6">
                        {/* Assignment Header */}
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                            {assignment.topic}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {assignment.description}
                          </p>
                        </div>

                        {/* Assignment Details */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} className="text-gray-400 text-sm" />
                            <span className="text-sm text-gray-600">{assignment.className}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faBook} className="text-gray-400 text-sm" />
                            <span className="text-sm text-gray-600">{assignment.subjectName}</span>
                          </div>
                          
                          {assignment.chapterName !== "N/A" && (
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faBookmark} className="text-gray-400 text-sm" />
                              <span className="text-sm text-gray-600">{assignment.chapterName}</span>
                            </div>
                          )}
                          
                          {assignment.lessonName !== "N/A" && (
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faGraduationCap} className="text-gray-400 text-sm" />
                              <span className="text-sm text-gray-600">{assignment.lessonName}</span>
                            </div>
                          )}
                        </div>

                        {/* Dates */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="flex justify-between items-center text-sm">
                            <div>
                              <span className="text-gray-500">Start:</span>
                              <span className="ml-1 text-gray-900">{formatDate(assignment.startDate)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">End:</span>
                              <span className="ml-1 text-gray-900">{formatDate(assignment.endDate)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Attachment */}
                        {assignment.attachmentUrl && (
                          <div className="mb-4">
                            <a
                              href={assignment.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <FontAwesomeIcon icon={faFileAlt} />
                              <span>{assignment.attachmentName || "View Attachment"}</span>
                              <FontAwesomeIcon icon={faDownload} className="text-xs" />
                            </a>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t">
                          <button
                            onClick={() => handleEditAssignment(assignment)}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
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