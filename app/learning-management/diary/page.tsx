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
  faCalendarDay,
  faExclamationTriangle,
  faUser,
  faBook,
  faComments,
  faClipboard,
  faSearch,
  faFileAlt,
  faUsers
} from "@fortawesome/free-solid-svg-icons";

interface DiaryEntry {
  id: string;
  content: string;
  classId: any;
  subjectId: any;
  schoolId: any;
  createdBy: any;
  attachments?: any[];
  createdAt: any;
  updatedAt?: any;
}

type DiaryEntryWithDetails = DiaryEntry & {
  className: string;
  subjectName: string;
  createdByName: string;
};

export default function DiaryManagementPage() {
  const { schoolId, loading: authLoading } = useAuth();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

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
      // Fetch diary entries
      const diaryQuery = query(
        collection(db, "diary_entries"),
        where("schoolId", "==", doc(db, "school", schoolId))
      );
      const diarySnapshot = await getDocs(diaryQuery);

      const entries = diarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const entryPromises = entries.map(async (entryData: any) => {
        const entry = entryData as DiaryEntry;

        // Fetch class name
        let className = "Unknown Class";
        try {
          if (entry.classId) {
            const classDoc = await getDoc(entry.classId as any);
            if (classDoc.exists()) {
              className = (classDoc.data() as any).name;
            }
          }
        } catch (error) {
          console.error("Error fetching class name:", error);
        }

        // Fetch subject name
        let subjectName = "Unknown Subject";
        try {
          if (entry.subjectId) {
            const subjectDoc = await getDoc(entry.subjectId as any);
            if (subjectDoc.exists()) {
              subjectName = (subjectDoc.data() as any).name;
            }
          }
        } catch (error) {
          console.error("Error fetching subject name:", error);
        }

        // Fetch creator name
        let createdByName = "Unknown User";
        try {
          if (entry.createdBy) {
            const userDoc = await getDoc(entry.createdBy as any);
            if (userDoc.exists()) {
              const userData = userDoc.data() as any;
              createdByName = userData.name || userData.email || "Unknown User";
            }
          }
        } catch (error) {
          console.error("Error fetching creator name:", error);
        }

        return {
          ...entry,
          className,
          subjectName,
          createdByName,
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

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm("Are you sure you want to delete this diary entry?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "diary_entries", entryId));
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
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEntries = diaryEntries.filter(entry => {
    const matchesSearch = 
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.createdByName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStats = () => {
    const total = diaryEntries.length;
    const today = diaryEntries.filter(entry => {
      const entryDate = entry.createdAt?.toDate?.() || new Date(entry.createdAt);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString();
    }).length;
    
    return { total, today };
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Diary Management</h1>
              <p className="text-gray-600">Record and manage your daily teaching notes and observations</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Daily Notes
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-gray-600">Today's Entries</p>
                  <p className="text-3xl font-bold text-green-600">{stats.today}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faCalendarDay} className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search diary entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No diary entries found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm
                      ? "Try adjusting your search criteria"
                      : "Create your first daily diary entry to get started"}
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Daily Notes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                      {/* Entry Header */}
                      <div className="p-4 border-b border-gray-100 bg-blue-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FontAwesomeIcon 
                                icon={faCalendarDay}
                                className="text-blue-600 text-lg"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Daily Notes</h3>
                              <p className="text-sm text-gray-600">Created by {entry.createdByName}</p>
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
                          <p className="text-sm text-gray-700 line-clamp-4">
                            {entry.content}
                          </p>
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
                            onClick={() => handleDeleteEntry(entry.id)}
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
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-xl">
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