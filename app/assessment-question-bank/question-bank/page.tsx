"use client";
import * as React from "react";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faList, faUpload, faBook, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { db } from '../../../lib/firebaseClient';
import { collection, query, where, getCountFromServer } from "firebase/firestore";

export default function QuestionBankDashboard() {
  const router = useRouter();
  const [edueronCount, setEdueronCount] = useState<number | null>(null);
  const [pyqCount, setPyqCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const edueronQ = query(collection(db, "questionCollection"), where("sp", "==", true));
        const pyqQ = query(collection(db, "questionCollection"), where("previous", "==", true));
        const [edueronSnap, pyqSnap] = await Promise.all([
          getCountFromServer(edueronQ),
          getCountFromServer(pyqQ),
        ]);
        setEdueronCount(edueronSnap.data().count);
        setPyqCount(pyqSnap.data().count);
      } catch {
        setEdueronCount(null);
        setPyqCount(null);
      }
    }
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen flex font-sans bg-[#F8F9FB]">
      <Sidebar />
      <main className="flex-1 bg-[#F8F9FB] flex flex-col items-center justify-center p-8 md:p-12 xl:p-16">
        <h1 className="text-3xl font-bold text-[#6C63FF] mb-2">Question Bank</h1>
        <p className="text-gray-500 mb-10">Organize, add, and edit questions for all your assessments.</p>
        {/* Count Containers Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl mb-12">
          {/* Questions in School */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center">
            <div className="bg-[#C4B5FD] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faBook} className="text-xl text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">1,234</div>
            <div className="text-gray-500">Questions in School</div>
          </div>
          {/* Questions in Edueron */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center">
            <div className="bg-[#6EE7B7] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faLayerGroup} className="text-xl text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{edueronCount === null ? "-" : edueronCount.toLocaleString()}</div>
            <div className="text-gray-500">Questions in Edueron</div>
          </div>
          {/* Questions in PYQ */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center">
            <div className="bg-[#FBCFE8] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faList} className="text-xl text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{pyqCount === null ? "-" : pyqCount.toLocaleString()}</div>
            <div className="text-gray-500">Questions in PYQ</div>
          </div>
          {/* Add Question */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center">
            <div className="bg-[#A5B4FC] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faPlus} className="text-xl text-white" />
            </div>
            <button className="bg-[#6C63FF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4338CA] transition text-base">Add Question</button>
          </div>
        </div>
        {/* Action Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
          {/* View School Questions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center min-w-[260px]">
            <div className="bg-[#C4B5FD] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faBook} className="text-xl text-white" />
            </div>
            <h2 className="font-bold text-lg text-gray-800 mb-2 text-center">View School Questions</h2>
            <p className="text-gray-500 text-center mb-6">Browse and manage all questions created by your school.</p>
            <button className="bg-[#6C63FF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4338CA] transition text-base">View</button>
          </div>
          {/* View Edueron Questions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center min-w-[260px]">
            <div className="bg-[#6EE7B7] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faLayerGroup} className="text-xl text-white" />
            </div>
            <h2 className="font-bold text-lg text-gray-800 mb-2 text-center">View Edueron Questions</h2>
            <p className="text-gray-500 text-center mb-6">Explore Edueron's curated question bank for your use.</p>
            <button className="bg-[#6EE7B7] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#059669] transition text-base" onClick={() => router.push('/assessment-question-bank/questionbank/view-edueron-questions')}>View</button>
          </div>
          {/* View PYQ */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center min-w-[260px]">
            <div className="bg-[#FBCFE8] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faList} className="text-xl text-white" />
            </div>
            <h2 className="font-bold text-lg text-gray-800 mb-2 text-center">View PYQ</h2>
            <p className="text-gray-500 text-center mb-6">Access previous year questions for NEET and JEE exams.</p>
            <button className="bg-[#FBCFE8] text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-[#F472B6] transition text-base" onClick={() => router.push('/assessment-question-bank/pyq')}>View</button>
          </div>
          {/* Bulk Upload */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center min-w-[260px]">
            <div className="bg-[#A5B4FC] p-3 rounded-full mb-4">
              <FontAwesomeIcon icon={faUpload} className="text-xl text-white" />
            </div>
            <h2 className="font-bold text-lg text-gray-800 mb-2 text-center">Bulk Upload</h2>
            <p className="text-gray-500 text-center mb-6">Upload multiple questions at once using a file.</p>
            <button className="bg-[#A5B4FC] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#6C63FF] transition text-base">Upload</button>
          </div>
        </div>
      </main>
    </div>
  );
} 