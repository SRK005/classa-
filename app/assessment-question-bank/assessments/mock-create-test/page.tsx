// This is a mock page for Custom Test creation, with no Firebase integration.
"use client";
import * as React from "react";
import Sidebar from "../../components/Sidebar";
import { db, auth } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, getDoc, Timestamp, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const mockStudents = [
  { id: "stu1", display_name: "Alice" },
  { id: "stu2", display_name: "Bob" },
  { id: "stu3", display_name: "Charlie" },
];

type Student = {
  id: string;
  display_name: string;
};

export default function MockCreateCustomTestPage() {
  const testType = "Custom Test";
  const [testName, setTestName] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [selectedClass, setSelectedClass] = React.useState("");
  const [studentMode, setStudentMode] = React.useState("whole");
  const [showStudentModal, setShowStudentModal] = React.useState(false);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = React.useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = React.useState(0);
  const [classes, setClasses] = React.useState<{ id: string; name: string }[]>([]);
  const [loadingClasses, setLoadingClasses] = React.useState(true);
  const [loadingStudents, setLoadingStudents] = React.useState(false);
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    let unsubscribe: any;
    setLoadingClasses(true);
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user document
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        if (userData && userData.schoolId) {
          // Query classes where schoolId matches
          const classesQuery = query(
            collection(db, "classes"),
            where("schoolId", "==", userData.schoolId)
          );
          const classesSnap = await getDocs(classesQuery);
          const classList: { id: string; name: string }[] = [];
          classesSnap.forEach((docSnap) => {
            const data = docSnap.data();
            classList.push({ id: docSnap.id, name: data.name });
          });
          setClasses(classList);
        } else {
          setClasses([]);
        }
        setLoadingClasses(false);
      }
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  React.useEffect(() => {
    if (studentMode === "selective" && selectedClass) {
      setShowStudentModal(true);
      setLoadingStudents(true);
      (async () => {
        // Query students by classRef
        const studentsQuery = query(
          collection(db, "students"),
          where("classRef", "==", doc(db, "classes", selectedClass))
        );
        const studentSnap = await getDocs(studentsQuery);
        const userRefs: string[] = [];
        const studentData: { id: string; userRef: { id: string } }[] = [];
        studentSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.userID) {
            userRefs.push(data.userID.id);
            studentData.push({ id: docSnap.id, userRef: data.userID });
          }
        });
        // Batch fetch user display names (Firestore 'in' limited to 10)
        let usersMap: Record<string, string> = {};
        for (let i = 0; i < userRefs.length; i += 10) {
          const batch = userRefs.slice(i, i + 10);
          const usersQuery = query(
            collection(db, "users"),
            where("__name__", "in", batch)
          );
          const usersSnap = await getDocs(usersQuery);
          usersSnap.forEach((userDoc) => {
            usersMap[userDoc.id] = userDoc.data().display_name;
          });
        }
        // Map display names
        setStudents(
          studentData.map((s) => ({
            id: s.id,
            display_name: usersMap[s.userRef.id] || s.userRef.id,
          }))
        );
        setLoadingStudents(false);
      })();
    }
  }, [studentMode, selectedClass]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!testName.trim()) newErrors.testName = "Test name is required.";
    if (!startTime) newErrors.startTime = "Start time is required.";
    if (!endTime) newErrors.endTime = "End time is required.";
    if (!selectedClass) newErrors.selectedClass = "Class is required.";
    if (!studentMode) newErrors.studentMode = "Assign To is required.";
    if (studentMode === "selective" && selectedStudents.length === 0) newErrors.selectedStudents = "Select at least one student.";
    if (!totalQuestions || totalQuestions < 1) newErrors.totalQuestions = "Total questions must be greater than 0.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError("");
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const testDoc = {
        name: testName,
        classId: doc(db, "classes", selectedClass),
        start: new Date(startTime),
        end: new Date(endTime),
        createdBy: doc(db, "users", user.uid),
        createdAt: Timestamp.now(),
        totalQuestions: totalQuestions,
        wholeClass: studentMode === "whole",
        ...(studentMode === "selective" && {
          userID: selectedStudents.map(id => doc(db, "users", id))
        })
        // Add more fields as needed from your schema
      };
      await addDoc(collection(db, "test"), testDoc);
      setSubmitSuccess(true);
      setTestName("");
      setStartTime("");
      setEndTime("");
      setSelectedClass("");
      setStudentMode("whole");
      setSelectedStudents([]);
      setTotalQuestions(0);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create test.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <Sidebar />
      <main className="flex-1 bg-transparent flex flex-col items-center justify-center p-10">
        <div className="w-full max-w-xl bg-white/80 rounded-3xl shadow-2xl px-12 py-10 border border-blue-100 backdrop-blur-md">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-4 text-center tracking-tight">Create {testType}</h1>
          <form className="flex flex-col gap-7 mt-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-blue-700 font-semibold mb-1">Test Name</label>
              <input
                type="text"
                className={`w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-base font-medium text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm transition ${errors.testName ? 'border-red-400' : ''}`}
                placeholder="Enter test name"
                value={testName}
                onChange={e => setTestName(e.target.value)}
                autoComplete="off"
              />
              {errors.testName && <div className="text-red-500 text-sm mt-1">{errors.testName}</div>}
            </div>
            <div className="flex gap-8">
              <div className="flex-1 min-w-0">
                <label className="block text-blue-700 font-semibold mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  className={`w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-base font-medium text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm transition ${errors.startTime ? 'border-red-400' : ''}`}
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
                {errors.startTime && <div className="text-red-500 text-sm mt-1">{errors.startTime}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-blue-700 font-semibold mb-1">End Time</label>
                <input
                  type="datetime-local"
                  className={`w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-base font-medium text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm transition ${errors.endTime ? 'border-red-400' : ''}`}
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
                {errors.endTime && <div className="text-red-500 text-sm mt-1">{errors.endTime}</div>}
              </div>
            </div>
            <div>
              <label className="block text-blue-700 font-semibold mb-1">Select Class</label>
              {loadingClasses ? (
                <div className="flex items-center gap-2 py-3"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div> <span className="text-blue-400">Loading classes...</span></div>
              ) : (
                <>
                  <select
                    className={`w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-base font-medium text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm transition ${errors.selectedClass ? 'border-red-400' : ''}`}
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.selectedClass && <div className="text-red-500 text-sm mt-1">{errors.selectedClass}</div>}
                </>
              )}
            </div>
            <div>
              <label className="block text-blue-700 font-semibold mb-1 mb-2">Assign To</label>
              <div className="flex gap-6 flex-wrap items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="studentMode"
                    value="whole"
                    checked={studentMode === "whole"}
                    onChange={() => setStudentMode("whole")}
                    className="accent-blue-600"
                  />
                  <span className="text-blue-900">Whole Class</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer ${!selectedClass ? 'opacity-50 pointer-events-none' : ''}`}> 
                  <input
                    type="radio"
                    name="studentMode"
                    value="selective"
                    checked={studentMode === "selective"}
                    onChange={() => selectedClass && setStudentMode("selective")}
                    className="accent-blue-600"
                    disabled={!selectedClass}
                  />
                  <span className="text-blue-900">Selective Students</span>
                </label>
              </div>
              {studentMode === "selective" && (
                <div className="mt-2 text-blue-600 font-semibold text-right">{selectedStudents.length} selected</div>
              )}
              {errors.selectedStudents && <div className="text-red-500 text-sm mt-1">{errors.selectedStudents}</div>}
            </div>
            <div>
              <label className="block text-blue-700 font-semibold mb-1">Total Questions</label>
              <input
                type="number"
                className={`w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-base font-medium text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm transition ${errors.totalQuestions ? 'border-red-400' : ''}`}
                placeholder="Enter total questions"
                value={totalQuestions}
                onChange={e => setTotalQuestions(Number(e.target.value))}
                min={1}
              />
              {errors.totalQuestions && <div className="text-red-500 text-sm mt-1">{errors.totalQuestions}</div>}
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition text-lg flex items-center justify-center"
              disabled={submitting}
            >
              {submitting ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span> : null}
              Create Test
            </button>
            {submitError && <div className="text-red-500 text-center font-semibold mt-2">{submitError}</div>}
          </form>
        </div>
      </main>
      {/* Student Selection Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <div className="bg-white/80 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-blue-100 backdrop-blur-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Select Students</h2>
            {loadingStudents ? (
              <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div></div>
            ) : (
              <div className="max-h-72 overflow-y-auto mb-4">
                {students.map((student) => (
                  <label key={student.id} className="flex items-center gap-3 py-2 border-b last:border-b-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => {
                        setSelectedStudents((prev) =>
                          prev.includes(student.id)
                            ? prev.filter((id) => id !== student.id)
                            : [...prev, student.id]
                        );
                      }}
                      className="accent-blue-600"
                    />
                    <span className="text-blue-900">{student.display_name}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center mt-4">
              <span className="text-blue-600 font-semibold">{selectedStudents.length} selected</span>
              <button
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={() => setShowStudentModal(false)}
              >
                Save Selection
              </button>
            </div>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 text-2xl"
              onClick={() => setShowStudentModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {submitSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-blue-100 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Test Created!</h2>
            <p className="text-blue-700 mb-6 text-center">Your test has been created successfully.</p>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition text-lg"
              onClick={() => router.push("/assessment-question-bank/assessments/manage-tests")}
            >
              View / Manage Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 