"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebaseClient";
import { useAuth } from "../../contexts/AuthContext";
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
  classId: string;
  subjectId: string;
  attachments?: any[];
  createdAt: any;
  updatedAt?: any;
}

interface RemarkEntry {
  id: string;
  type: "remark";
  studentId: string;
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
  classId: string;
  subjectId: string;
  attachments?: any[];
  createdAt: any;
  updatedAt?: any;
}

interface DiaryEntry {
  id: string;
  note: string;
  userId: string;
  schoolId: string;
  createdAt?: { toDate: () => Date } | null;
}

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
  const { user, schoolId } = useAuth();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDiaryEntries = async () => {
    if (!schoolId) return;
    setLoading(true);
    setError("");
    try {
      const diaryQuery = query(
        collection(db, "diary_entries"),
        where("schoolId", "==", schoolId)
      );
      const snapshot = await getDocs(diaryQuery);
      const entries: DiaryEntry[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiaryEntry));
      entries.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setDiaryEntries(entries);
    } catch (err) {
      setError("Failed to load diary entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiaryEntries();
  }, [schoolId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Daily Diary</h1>
      <DiaryForm onSuccess={fetchDiaryEntries} />
      {loading ? (
        <div className="mt-6"><LoadingSpinner /></div>
      ) : error ? (
        <div className="text-red-600 mt-6">{error}</div>
      ) : (
        <div className="mt-8 space-y-4">
          {diaryEntries.length === 0 ? (
            <div className="text-gray-500">No diary entries yet.</div>
          ) : (
            diaryEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-900 font-medium">{entry.note}</div>
                    <div className="text-gray-500 text-xs mt-1">{entry.createdAt?.toDate?.().toLocaleString?.() || ""}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 