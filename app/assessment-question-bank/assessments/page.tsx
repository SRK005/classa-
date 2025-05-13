"use client";
import * as React from "react";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCalendarAlt, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function ManageAssessments() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <Sidebar />
      <main className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-10">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Manage Assessments</h1>
        <p className="text-gray-500 mb-10">Create, schedule, and review assessments for your students.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl">
          {/* Create Assessment Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-10 shadow flex flex-col items-center border border-gray-100">
            <div className="bg-blue-100 p-6 rounded-full mb-6 shadow-lg">
              <FontAwesomeIcon icon={faPlus} className="text-4xl text-blue-600" />
            </div>
            <h2 className="font-bold text-xl text-blue-900 mb-2">Create Assessment</h2>
            <p className="text-gray-700 text-center mb-6">Start a new assessment for your class or subject.</p>
            <button className="bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-800 transition text-lg">New Assessment</button>
          </div>
          {/* View Scheduled Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-10 shadow flex flex-col items-center border border-gray-100">
            <div className="bg-blue-100 p-6 rounded-full mb-6 shadow-lg">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl text-blue-600" />
            </div>
            <h2 className="font-bold text-xl text-blue-900 mb-2">View Scheduled</h2>
            <p className="text-gray-700 text-center mb-6">See all upcoming and scheduled assessments.</p>
            <button className="bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-800 transition text-lg">Scheduled Assessments</button>
          </div>
          {/* View Completed Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-10 shadow flex flex-col items-center border border-gray-100">
            <div className="bg-blue-100 p-6 rounded-full mb-6 shadow-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-blue-600" />
            </div>
            <h2 className="font-bold text-xl text-blue-900 mb-2">View Completed</h2>
            <p className="text-gray-700 text-center mb-6">Browse completed assessments and their results.</p>
            <button className="bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-800 transition text-lg">Completed Assessments</button>
          </div>
        </div>
      </main>
    </div>
  );
} 