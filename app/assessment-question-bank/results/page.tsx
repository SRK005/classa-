"use client";
import * as React from "react";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faFileDownload, faChartPie, faCheckCircle, faUserFriends, faClipboardList, faPenFancy, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const lastTests = [
  { name: "NEET Mock 2024", date: "2024-06-01" },
  { name: "JEE Main 2024", date: "2024-05-28" },
  { name: "Weekly Biology", date: "2024-05-20" },
  { name: "Physics Drill", date: "2024-05-15" },
  { name: "Chemistry Test", date: "2024-05-10" },
];

export default function ResultsDashboard() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex font-sans bg-[#F8F9FB]">
      <Sidebar />
      <main className="flex-1 bg-[#F8F9FB] flex flex-col items-center justify-center p-8 md:p-12 xl:p-16">
        <h1 className="text-3xl font-bold text-[#22A699] mb-2">Results & Reports</h1>
        <p className="text-gray-500 mb-10">View results, analytics, and download detailed reports.</p>
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-6xl mb-12">
          {/* Last 5 Tests */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-start min-w-[220px]">
            <div className="bg-[#A5B4FC] p-3 rounded-full mb-4 self-center">
              <FontAwesomeIcon icon={faClipboardList} className="text-xl text-white" />
            </div>
            <div className="text-lg font-bold text-gray-800 mb-2">Last 5 Tests</div>
            <ul className="text-xs text-gray-500 pl-2">
              {lastTests.map((test) => (
                <li key={test.name} className="mb-1 list-disc list-inside">{test.name} <span className="text-gray-300">|</span> {test.date}</li>
              ))}
            </ul>
          </div>
          {/* Tests Completed */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center min-w-[220px]">
            <div className="bg-[#6EE7B7] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faCheckCircle} className="text-xl text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">28</div>
            <div className="text-gray-500">Tests Completed</div>
          </div>
          {/* Drafted Tests */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center min-w-[220px]">
            <div className="bg-[#A5B4FC] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faPenFancy} className="text-xl text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">7</div>
            <div className="text-gray-500">Drafted Tests</div>
          </div>
          {/* Upcoming Tests */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-start min-w-[220px]">
            <div className="bg-[#FBCFE8] p-3 rounded-full mb-4 self-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-xl text-white" />
            </div>
            <div className="text-lg font-bold text-gray-800 mb-2">Upcoming Tests</div>
            <ul className="text-xs text-gray-500 pl-2">
              <li className="mb-1 list-disc list-inside">Maths Weekly | 2024-06-10</li>
              <li className="mb-1 list-disc list-inside">NEET Practice | 2024-06-12</li>
              <li className="mb-1 list-disc list-inside">JEE Drill | 2024-06-15</li>
              <li className="mb-1 list-disc list-inside">Physics Mock | 2024-06-18</li>
              <li className="mb-1 list-disc list-inside">Chemistry Quiz | 2024-06-20</li>
            </ul>
          </div>
        </div>
        {/* Action Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {/* View Results */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center min-w-[260px]">
            <div className="bg-[#6EE7B7] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faChartBar} className="text-xl text-white" />
            </div>
            <h2 className="font-bold text-lg text-gray-800 mb-2 text-center">View Results</h2>
            <p className="text-gray-500 text-center mb-6">See all student results for your assessments.</p>
            <button className="bg-[#6EE7B7] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#059669] transition text-base">View</button>
          </div>
          {/* Analytics Overview */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center min-w-[260px]">
            <div className="bg-[#A5B4FC] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faChartPie} className="text-xl text-white" />
            </div>
            <h2 className="font-bold text-lg text-gray-800 mb-2 text-center">Analytics Overview</h2>
            <p className="text-gray-500 text-center mb-6">Get a quick overview of assessment analytics.</p>
            <button className="bg-[#A5B4FC] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#6C63FF] transition text-base">View</button>
          </div>
          {/* Download Reports */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center min-w-[260px]">
            <div className="bg-[#FDE68A] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faFileDownload} className="text-xl text-white" />
            </div>
            <h2 className="font-bold text-lg text-gray-800 mb-2 text-center">Download Reports</h2>
            <p className="text-gray-500 text-center mb-6">Download detailed reports for offline analysis.</p>
            <button className="bg-[#FDE68A] text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-[#FBBF24] transition text-base">Download</button>
          </div>
        </div>
      </main>
    </div>
  );
} 