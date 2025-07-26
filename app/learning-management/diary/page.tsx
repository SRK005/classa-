"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, DocumentReference } from "firebase/firestore";
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
  faBookOpen,
  faExclamationTriangle,
  faCalendarAlt,
  faUser,
  faGraduationCap,
  faComments,
  faClipboard,
  faSearch,
  faFileAlt,
  faUserCheck,
  faCalendarCheck,
  faChartLine,
  faBook,
  faUsers
} from "@fortawesome/free-solid-svg-icons";

interface HomeworkEntry {
  id: string;
  type: "homework";
  title: string;
  description: string;
  workToDo: string;
  dueDate: any;
  priority: string;
  metadata: {
    estimatedTime?: string;
    difficulty?: string;
  };
  classId: DocumentReference;
  subjectId: DocumentReference;
  attachments?: any[];
  createdAt: any;
  updatedAt?: any;
}

interface RemarkEntry {
  id: string;
  type: "remark";
  studentId: DocumentReference;
  personalRemarks: string;
  workRemarks?: string;
  parentRemarks?: string;
  priority: string;
  category: string;
  tags: string[];
  visibleToParents: boolean;
  visibleToStudent: boolean;
  followUpRequired: boolean;
  followUpDate?: any;
  classId: DocumentReference;
  subjectId?: DocumentReference;
  attachments?: any[];
  createdAt: any;
  updatedAt?: any;
}

type DiaryEntry = HomeworkEntry | RemarkEntry;

type DiaryEntryWithDetails = DiaryEntry & {
  className: string;
  subjectName: string;
  studentName?: string;
};

const PRIORITY_COLORS = {
  high: { color: "#ef4444", bgColor: "#fef2f2" },
  medium: { color: "#f59e0b", bgColor: "#fffbeb" },
  low: { color: "#10b981", bgColor: "#f0fdf4" }
};

const CATEGORY_ICONS = {
  academic: faGraduationCap,
  behavior: faUserCheck,
  attendance: faCalendarCheck,
  performance: faChartLine
};

export default function DiaryManagementPage() {
  const { schoolId, loading: authLoading } = useAuth();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "homework" | "remark">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");

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
      // Fetch homework entries
      const homeworkQuery = query(
        collection(db, "homeworks"),
        where("schoolId", "==", doc(db, "school", schoolId))
      );
      const homeworkSnapshot = await getDocs(homeworkQuery);
      
      // Fetch remark entries
      const remarkQuery = query(
        collection(db, "remarks"),
        where("schoolId", "==", doc(db, "school", schoolId))
      );
      const remarkSnapshot = await getDocs(remarkQuery);

      const allEntries = [
        ...homeworkSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "homework" as const })),
        ...remarkSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "remark" as const }))
      ];

      const entryPromises = allEntries.map(async (entryData: any) => {
        const entry = entryData as DiaryEntry;

        // Fetch class name
        let className = "Unknown Class";
        try {
          if (entry.classId) {
            const classDoc = await getDoc(entry.classId);
            if (classDoc.exists()) {
              const classData = classDoc.data();
              className = classData?.name || "Unknown Class";
            }
          }
        } catch (error) {
          console.error("Error fetching class name:", error);
        }

        // Fetch subject name
        let subjectName = "Unknown Subject";
        try {
          if (entry.subjectId) {
            const subjectDoc = await getDoc(entry.subjectId);
            if (subjectDoc.exists()) {
              const subjectData = subjectDoc.data();
              subjectName = subjectData?.name || "Unknown Subject";
            }
          }
        } catch (error) {
          console.error("Error fetching subject name:", error);
        }

        // Fetch student name for remarks
        let studentName = "";
        if (entry.type === "remark") {
          try {
            const studentDoc = await getDoc(entry.studentId);
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              studentName = studentData?.name || studentData?.email || "Unknown Student";
            }
          } catch (error) {
            console.error("Error fetching student name:", error);
          }
        }

        return {
          ...entry,
          className,
          subjectName,
          studentName,
        };
      });

      const entriesWithDetails = await Promise.all(entryPromises);
      
      // Sort by created date (newest first)
      entriesWithDetails.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setDiaryEntries(entriesWithDetails);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
      setError("Failed to load diary entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string, entryType: string) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      const collectionName = entryType === "homework" ? "homeworks" : "remarks";
      await deleteDoc(doc(db, collectionName, entryId));
      setDiaryEntries(diaryEntries.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error("Error deleting entry:", error);
      setError("Failed to delete entry");
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

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    return date.toDate ? date.toDate().toLocaleDateString() : "N/A";
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
  };

  const filteredEntries = diaryEntries.filter(entry => {
    const matchesSearch = (
      (entry.type === "homework" && (
        (entry.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (entry.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (entry.workToDo?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      )) ||
      (entry.type === "remark" && (
        (entry.personalRemarks?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (entry.workRemarks?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (entry.parentRemarks?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (entry.studentName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      ))
    ) || (entry.className?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (entry.subjectName?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || entry.type === filterType;
    const matchesPriority = filterPriority === "all" || entry.priority === filterPriority;

    return matchesSearch && matchesType && matchesPriority;
  });

  const getStats = () => {
    const total = diaryEntries.length;
    const homework = diaryEntries.filter(entry => entry.type === "homework").length;
    const remarks = diaryEntries.filter(entry => entry.type === "remark").length;
    const highPriority = diaryEntries.filter(entry => entry.priority === "high").length;
    
    return { total, homework, remarks, highPriority };
  };

  const stats = getStats();

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
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Diary Management</h1>
              <p className="text-gray-600">Manage homework assignments and student remarks</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Entry
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faClipboard} className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Homework</p>
                  <p className="text-3xl font-bold text-green-600">{stats.homework}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faBookOpen} className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remarks</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.remarks}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faComments} className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-3xl font-bold text-red-600">{stats.highPriority}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="homework">Homework</option>
                  <option value="remark">Remarks</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
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
            <>
              {/* Entries Grid */}
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faClipboard} className="text-gray-400 text-6xl mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No entries found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || filterType !== "all" || filterPriority !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Create your first diary entry to get started"}
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Entry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                      {/* Entry Header */}
                      <div className={`p-4 border-b`} style={{ backgroundColor: getPriorityColor(entry.priority).bgColor }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                              <FontAwesomeIcon 
                                icon={entry.type === "homework" ? faBookOpen : faComments}
                                className="text-lg"
                                style={{ color: getPriorityColor(entry.priority).color }}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {entry.type === "homework" ? "Homework" : "Remark"}
                              </h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: getPriorityColor(entry.priority).color }}
                                ></span>
                                {entry.priority.charAt(0).toUpperCase() + entry.priority.slice(1)} Priority
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(entry.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {/* Content */}
                        <div className="mb-4">
                          {entry.type === "homework" ? (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">
                                {entry.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {entry.description}
                              </p>
                              <div className="text-xs text-gray-500 mb-2">
                                <span className="font-medium">Due:</span> {formatDate(entry.dueDate)}
                              </div>
                              {entry.metadata?.estimatedTime && (
                                <div className="text-xs text-gray-500">
                                  <span className="font-medium">Time:</span> {entry.metadata.estimatedTime}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon 
                                  icon={CATEGORY_ICONS[entry.category as keyof typeof CATEGORY_ICONS]} 
                                  className="text-sm text-gray-600"
                                />
                                <span className="text-sm font-medium text-gray-600">
                                  {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                                {entry.personalRemarks}
                              </p>
                              {entry.studentName && (
                                <div className="text-xs text-gray-500 mb-2">
                                  <span className="font-medium">Student:</span> {entry.studentName}
                                </div>
                              )}
                              {entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {entry.tags.slice(0, 3).map((tag: string, index: number) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                  {entry.tags.length > 3 && (
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                      +{entry.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} className="text-gray-400 text-sm" />
                            <span className="text-sm text-gray-600">{entry.className}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faBook} className="text-gray-400 text-sm" />
                            <span className="text-sm text-gray-600">{entry.subjectName}</span>
                          </div>
                        </div>

                        {/* Attachments */}
                        {entry.attachments && entry.attachments.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <FontAwesomeIcon icon={faFileAlt} />
                              <span>{entry.attachments.length} attachment(s)</span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t">
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id, entry.type)}
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
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-xl">
            <DiaryForm
              entryId={editingEntry?.id}
              initialData={editingEntry}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
} 