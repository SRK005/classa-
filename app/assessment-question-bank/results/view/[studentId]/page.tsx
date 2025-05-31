"use client";
import * as React from "react";
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import { useParams } from "next/navigation";

export default function StudentReportPage() {
  // Get studentId from the URL
  const params = useParams();
  const studentId = params?.studentId;

  // Mock data for demonstration
  const testName = "NEET Mock Test - November 2024";
  const student = {
    name: "Alice Johnson",
    roll: studentId || "1201",
    className: "Class 12",
    section: "A",
    dob: "2006-05-14",
    gender: "Female",
    image: null, // Placeholder for image
    score: 45,
    percentage: 90,
    rank: 1,
    time: "1:45:00",
    totalMarks: 50,
    answers: [
      { number: 1, question: "What is the powerhouse of the cell?", correct: true },
      { number: 2, question: "Which is the largest organ in the human body?", correct: true },
      { number: 3, question: "What is the chemical formula for water?", correct: true },
      { number: 4, question: "Who discovered penicillin?", correct: true },
      { number: 5, question: "What is the normal pH of blood?", correct: false },
      { number: 6, question: "What is the function of hemoglobin?", correct: false },
      { number: 7, question: "What is the genetic material in most organisms?", correct: true },
      { number: 8, question: "What is the main function of the kidneys?", correct: false },
    ],
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#F8F9FB]">
      <Sidebar />
      <main className="flex-1 bg-[#F8F9FB] flex flex-col items-center justify-center p-8 md:p-12 xl:p-16 w-full">
        {/* Test Name */}
        <h1 className="text-3xl font-bold mb-4 text-center" style={{ color: '#2563eb' }}>
          {testName}
        </h1>
        <h2 className="text-xl font-semibold mb-8 text-center text-blue-900">
          Student Report
        </h2>
        {/* Cards Row */}
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl mb-8">
          {/* Personal Details Card */}
          <div className="flex-1 bg-white rounded-2xl shadow p-6 border border-blue-100 flex flex-col items-center">
            {/* Image Placeholder */}
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4 overflow-hidden">
              {/* Replace with <img src={student.image} ... /> if image is available */}
              <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-lg font-bold text-blue-900 mb-1">{student.name}</div>
            <div className="text-sm text-blue-700 mb-1">Roll No: {student.roll}</div>
            <div className="text-sm text-blue-700 mb-1">Class: {student.className} {student.section}</div>
            <div className="text-sm text-blue-700 mb-1">DOB: {student.dob}</div>
            <div className="text-sm text-blue-700 mb-1">Gender: {student.gender}</div>
          </div>
          {/* Academic Details Card */}
          <div className="flex-1 bg-white rounded-2xl shadow p-6 border border-blue-100 flex flex-col justify-center">
            <div className="flex flex-wrap gap-6 text-lg text-blue-900 justify-center mb-2">
              <div>
                <span className="font-semibold">Score:</span> {student.score} / {student.totalMarks}
              </div>
              <div>
                <span className="font-semibold">Percentage:</span> {student.percentage}%
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-lg text-blue-900 justify-center">
              <div>
                <span className="font-semibold">Rank:</span> {student.rank}
              </div>
              <div>
                <span className="font-semibold">Time Taken:</span> {student.time}
              </div>
            </div>
          </div>
        </div>
        {/* Overall Academic Report Card */}
        <div className="bg-white rounded-2xl shadow p-6 border border-green-100 w-full max-w-4xl mb-8">
          <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#059669' }}>
            Overall Academic Report
          </h3>
          <div className="flex flex-wrap gap-8 justify-center text-blue-900 text-lg">
            <div>
              <span className="font-semibold">Total Tests Taken:</span> 18
            </div>
            <div>
              <span className="font-semibold">Average Score:</span> 41.2
            </div>
            <div>
              <span className="font-semibold">Best Score:</span> 48
            </div>
            <div>
              <span className="font-semibold">Lowest Score:</span> 30
            </div>
            <div>
              <span className="font-semibold">Average Rank:</span> 2.3
            </div>
            <div>
              <span className="font-semibold">Average Percentage:</span> 82.4%
            </div>
          </div>
        </div>
        {/* Answers Table */}
        <div className="bg-white rounded-2xl shadow p-8 border border-blue-100 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#2563eb' }}>
            Answer Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-blue-900 border border-blue-100 rounded-xl">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 text-center">Q#</th>
                  <th className="px-4 py-2 text-center">Question</th>
                  <th className="px-4 py-2 text-center">Correct?</th>
                </tr>
              </thead>
              <tbody>
                {student.answers.map((a) => (
                  <tr key={a.number} className="even:bg-blue-50">
                    <td className="px-4 py-2 text-center font-bold">{a.number}</td>
                    <td className="px-4 py-2">{a.question}</td>
                    <td className="px-4 py-2 text-center">
                      {a.correct ? (
                        <span className="text-green-600 font-bold">✔</span>
                      ) : (
                        <span className="text-red-600 font-bold">✘</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 