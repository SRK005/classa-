"use client";
import * as React from "react";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTasks, faBook, faChartBar } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function AssessmentDashboard() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <Sidebar />
      <main className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-10">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Assessment & Question Bank</h1>
        <p className="text-gray-500 mb-10">Manage your assessments, questions, and results here.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl">
          {/* Manage Assessments Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-10 shadow flex flex-col items-center border border-gray-100">
            <div className="bg-blue-100 p-6 rounded-full mb-6 shadow-lg">
              <FontAwesomeIcon icon={faTasks} className="text-4xl text-blue-600" />
            </div>
            <h2 className="font-bold text-xl text-blue-900 mb-2">Manage Assessments</h2>
            <p className="text-gray-700 text-center mb-6">Create, schedule, and review assessments for your students.</p>
            <div className="flex flex-col gap-3 w-full">
              <button
                className="bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-800 transition text-lg"
                onClick={() => setShowDialog(true)}
              >
                Create Assessment
              </button>
              <button
                className="bg-blue-100 text-blue-700 px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-200 transition text-lg"
                onClick={() => router.push("/assessment-question-bank/assessments")}
              >
                Go to Assessments
              </button>
            </div>
          </div>
          {/* Question Bank Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-10 shadow flex flex-col items-center border border-gray-100">
            <div className="bg-purple-100 p-6 rounded-full mb-6 shadow-lg">
              <FontAwesomeIcon icon={faBook} className="text-4xl text-purple-600" />
            </div>
            <h2 className="font-bold text-xl text-purple-900 mb-2">Question Bank</h2>
            <p className="text-gray-700 text-center mb-6">Organize, add, and edit questions for all your assessments.</p>
            <button
              className="bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-purple-800 transition text-lg"
              onClick={() => router.push("/assessment-question-bank/question-bank")}
            >
              Go to QB
            </button>
          </div>
          {/* Results & Reports Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-10 shadow flex flex-col items-center border border-gray-100">
            <div className="bg-green-100 p-6 rounded-full mb-6 shadow-lg">
              <FontAwesomeIcon icon={faChartBar} className="text-4xl text-green-600" />
            </div>
            <h2 className="font-bold text-xl text-green-900 mb-2">Results & Reports</h2>
            <p className="text-gray-700 text-center mb-6">View results, analytics, and download detailed reports.</p>
            <button
              className="bg-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-green-800 transition text-lg"
              onClick={() => router.push("/assessment-question-bank/results")}
            >
              Go to Results
            </button>
          </div>
        </div>
        {/* Modal Dialog for Assessment Type Selection */}
        {showDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-fadeIn flex flex-col items-center">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowDialog(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-blue-800 mb-6">Select Assessment Type</h2>
              <div className="flex flex-col gap-4 w-full">
                <button className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-blue-800 transition text-lg" onClick={() => {/* handle custom test */}}>Create Custom Test</button>
                <button className="bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-purple-800 transition text-lg" onClick={() => {/* handle NEET mock */}}>Create NEET MOCK</button>
                <button className="bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-green-800 transition text-lg" onClick={() => {/* handle JEE mock */}}>Create JEE Mock</button>
                <button className="bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-pink-700 transition text-lg" onClick={() => {/* handle PYQ test */}}>Create PYQ test</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 