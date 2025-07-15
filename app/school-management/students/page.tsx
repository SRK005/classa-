"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebaseClient";
import { useAuth } from "../../contexts/AuthContext";
import SchoolSidebar from "../components/SchoolSidebar";
import StudentForm from "../../components/forms/StudentForm";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faUsers,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  classId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  dateOfBirth: any;
  address: string;
  createdAt: any;
  updatedAt?: any;
}

interface StudentWithDetails extends Student {
  className: string;
}

export default function StudentManagementPage() {
  const { schoolId, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    console.log("AuthContext state:", { schoolId, authLoading });
    
    if (!authLoading) {
      if (schoolId) {
        fetchStudents();
      } else {
        setError("School ID not found. Please ensure you're logged in as a school administrator.");
        setLoading(false);
      }
    }
  }, [schoolId, authLoading]);

  const fetchStudents = async () => {
    if (!schoolId) return;

    console.log("Fetching students for school:", schoolId);
    setLoading(true);
    setError("");
    
    try {
      const studentsQuery = query(
        collection(db, "students"),
        where("schoolId", "==", doc(db, "school", schoolId))
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      console.log("Students found:", studentsSnapshot.size);
      
      // Log each student document to debug
      studentsSnapshot.docs.forEach((doc, index) => {
        console.log(`Student ${index}:`, doc.id, doc.data());
      });

      // If no students found, show helpful message
      if (studentsSnapshot.size === 0) {
        console.log("No students found in database");
        setStudents([]);
        setLoading(false);
        return;
      }
      
      const studentPromises = studentsSnapshot.docs.map(async (studentDoc) => {
        const studentData = studentDoc.data();
        console.log("Student data:", studentData);
        console.log("Student data keys:", Object.keys(studentData));
        
        // Helper function to extract ID from DocumentReference
        const extractIdFromRef = (ref: any): string => {
          if (!ref) return "";
          if (typeof ref === 'string') return ref;
          if (ref.id) return ref.id;
          if (ref._path && ref._path.segments) {
            return ref._path.segments[ref._path.segments.length - 1];
          }
          if (ref.path) {
            return ref.path.split('/').pop() || "";
          }
          console.log("Unknown reference structure:", ref);
          return "";
        };
        
        const classId = extractIdFromRef(studentData.classId);
        console.log("Extracted classId:", classId);
        
        const student: Student = {
          id: studentDoc.id,
          name: studentData.name || "",
          email: studentData.email || "",
          phone: studentData.phone || "",
          rollNumber: studentData.rollNumber || "",
          classId: classId || "",
          parentName: studentData.parentName || "",
          parentPhone: studentData.parentPhone || "",
          parentEmail: studentData.parentEmail || "",
          dateOfBirth: studentData.dateOfBirth,
          address: studentData.address || "",
          createdAt: studentData.createdAt,
          updatedAt: studentData.updatedAt,
        };
        console.log("Processed student:", student);

        // Fetch class name
        let className = "Unknown Class";
        try {
          if (student.classId) {
            const classDoc = await getDoc(doc(db, "classes", student.classId));
            if (classDoc.exists()) {
              className = classDoc.data().name;
            }
          }
        } catch (error) {
          console.error("Error fetching class name:", error);
        }

        return {
          ...student,
          className,
        };
      });

      const studentsWithDetails = await Promise.all(studentPromises);
      // Sort by class name, then by name
      studentsWithDetails.sort((a, b) => {
        const classNameA = a.className || "Unknown Class";
        const classNameB = b.className || "Unknown Class";
        if (classNameA !== classNameB) {
          return classNameA.localeCompare(classNameB);
        }
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameA.localeCompare(nameB);
      });
      setStudents(studentsWithDetails);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "students", studentId));
      setStudents(students.filter(student => student.id !== studentId));
    } catch (error) {
      console.error("Error deleting student:", error);
      setError("Failed to delete student");
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingStudent(null);
    fetchStudents();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
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
        <SchoolSidebar />
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
      <SchoolSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
              <p className="text-gray-600">Manage students and their information</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Student
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{error}</span>
              </div>
              <button
                onClick={() => fetchStudents()}
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
                <p className="mt-4 text-gray-600">Loading students...</p>
              </div>
            </div>
                    ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parent Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-300 mb-4" />
                            <p className="text-lg font-medium mb-2">No students found</p>
                            <p className="text-sm">Create your first student to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.rollNumber || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.className}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.email || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.phone || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.parentName || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.createdAt ? 
                                (student.createdAt.toDate ? 
                                  student.createdAt.toDate().toLocaleDateString() : 
                                  (student.createdAt instanceof Date ? 
                                    student.createdAt.toLocaleDateString() : 
                                    "N/A"
                                  )
                                ) : 
                                "N/A"
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditStudent(student)}
                                className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                                title="Edit student"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                                title="Delete student"
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
              <StudentForm
                studentId={editingStudent?.id}
                initialData={editingStudent ? {
                  name: editingStudent.name,
                  email: editingStudent.email,
                  phone: editingStudent.phone,
                  rollNumber: editingStudent.rollNumber,
                  classId: editingStudent.classId,
                  parentName: editingStudent.parentName,
                  parentPhone: editingStudent.parentPhone,
                  parentEmail: editingStudent.parentEmail,
                  dateOfBirth: editingStudent.dateOfBirth,
                  address: editingStudent.address,
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