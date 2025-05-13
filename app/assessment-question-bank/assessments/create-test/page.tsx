// This is the page for Custom Test creation. The same structure will be used for NEET Mock, JEE Mock, and PYQ Test with the testType variable set accordingly.
"use client";
import * as React from "react";
import Sidebar from "../../components/Sidebar";
import { db } from "../../../lib/firebaseClient";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

const classes = [
  { id: "class1", name: "Class 10" },
  { id: "class2", name: "Class 11" },
  { id: "class3", name: "Class 12" },
];

type Student = {
  id: string;
  display_name: string;
  userRef: { id: string };
};

export default function CreateCustomTestPage() {
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
  const [loadingStudents, setLoadingStudents] = React.useState(false);

  // Fetch students when class and selective mode is chosen
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
            ...s,
            display_name: usersMap[s.userRef.id] || s.userRef.id,
          }))
        );
        setLoadingStudents(false);
      })();
    }
  }, [studentMode, selectedClass]);

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <Sidebar />
      <main className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-10">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-blue-700 mb-2 text-center">Create {testType}</h1>
          <form className="flex flex-col gap-6 mt-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Test Name</label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                placeholder="Enter test name"
                value={testName}
                onChange={e => setTestName(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-1">End Time</label>
                <input
                  type="datetime-local"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Select Class</label>
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 mb-2">Assign To</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="studentMode"
                    value="whole"
                    checked={studentMode === "whole"}
                    onChange={() => setStudentMode("whole")}
                    className="accent-blue-600"
                  />
                  <span className="text-gray-700">Whole Class</span>
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
                  <span className="text-gray-700">Selective Students</span>
                </label>
                {studentMode === "selective" && (
                  <span className="ml-4 text-blue-600 font-semibold">{selectedStudents.length} selected</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Total Questions</label>
              <input
                type="number"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                placeholder="Enter total questions"
                value={totalQuestions}
                onChange={e => setTotalQuestions(Number(e.target.value))}
                min={1}
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition text-lg"
            >
              Create Test
            </button>
          </form>
        </div>
      </main>
      {/* Student Selection Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Select Students</h2>
            {loadingStudents ? (
              <div className="flex justify-center items-center h-32">Loading...</div>
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
                    <span className="text-gray-800">{student.display_name}</span>
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
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowStudentModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 