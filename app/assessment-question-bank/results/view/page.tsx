import * as React from "react";
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import Link from "next/link";

export default function ResultsViewPage() {
  // Detailed mock data
  const test = {
    name: "NEET Mock Test - November 2024",
    className: "Class 12",
    subject: "Biology",
    start: "Nov 23, 2024, 10:00 AM",
    end: "Nov 23, 2024, 12:00 PM",
    questions: 50,
    totalQuestions: 50,
    teacher: "Dr. A. Kumar",
    status: "Completed",
  };
  const students = [
    {
      name: "Alice Johnson",
      roll: "1201",
      score: 45,
      percentage: 90,
      rank: 1,
      time: "1:45:00",
    },
    {
      name: "Bob Smith",
      roll: "1202",
      score: 40,
      percentage: 80,
      rank: 2,
      time: "1:55:00",
    },
    {
      name: "Charlie Lee",
      roll: "1203",
      score: 38,
      percentage: 76,
      rank: 3,
      time: "1:59:00",
    },
    {
      name: "Diana Patel",
      roll: "1204",
      score: 35,
      percentage: 70,
      rank: 4,
      time: "1:50:00",
    },
    {
      name: "Ethan Brown",
      roll: "1205",
      score: 30,
      percentage: 60,
      rank: 5,
      time: "2:00:00",
    },
  ];
  // Mock question stats: sorted by highest correct ratio
  const questions = [
    { number: 1, text: "What is the powerhouse of the cell?", correct: 20, total: 20 },
    { number: 2, text: "Which is the largest organ in the human body?", correct: 19, total: 20 },
    { number: 3, text: "What is the chemical formula for water?", correct: 18, total: 20 },
    { number: 4, text: "Who discovered penicillin?", correct: 15, total: 20 },
    { number: 5, text: "What is the normal pH of blood?", correct: 12, total: 20 },
    { number: 6, text: "What is the function of hemoglobin?", correct: 10, total: 20 },
    { number: 7, text: "What is the genetic material in most organisms?", correct: 8, total: 20 },
    { number: 8, text: "What is the main function of the kidneys?", correct: 5, total: 20 },
  ];

  return (
    <div className="min-h-screen flex font-sans bg-[#F8F9FB]">
      <Sidebar />
      <main className="flex-1 bg-[#F8F9FB] flex flex-col items-center justify-center p-8 md:p-12 xl:p-16">
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#2563eb' }}>
          Detailed Report
        </h1>
        <div className="bg-white rounded-2xl shadow p-8 border border-blue-100 w-full max-w-2xl flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap gap-6 text-lg text-blue-900 justify-center">
            <div>
              <span className="font-semibold">Class:</span> {test.className}
            </div>
            <div>
              <span className="font-semibold">Subject:</span> {test.subject}
            </div>
            <div>
              <span className="font-semibold">Teacher:</span> {test.teacher}
            </div>
            <div>
              <span className="font-semibold">Status:</span> {test.status}
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-lg text-blue-900 justify-center">
            <div>
              <span className="font-semibold">Start:</span> {test.start}
            </div>
            <div>
              <span className="font-semibold">End:</span> {test.end}
            </div>
            <div>
              <span className="font-semibold">Questions:</span> {test.questions} / {test.totalQuestions}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <button className="px-6 py-2 rounded-xl font-semibold shadow-sm border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 transition">
              Download PDF Report
            </button>
            <button className="px-6 py-2 rounded-xl font-semibold shadow-sm border border-green-200 bg-white text-green-700 hover:bg-green-50 focus:ring-2 focus:ring-green-200 transition">
              Download Excel
            </button>
            <button className="px-6 py-2 rounded-xl font-semibold shadow-sm border border-purple-200 bg-white text-purple-700 hover:bg-purple-50 focus:ring-2 focus:ring-purple-200 transition">
              View Analytics
            </button>
          </div>
        </div>
        {/* Student Results Table */}
        <div className="bg-white rounded-2xl shadow p-8 border border-blue-100 w-full max-w-4xl mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#2563eb' }}>
            Student Results
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-blue-900 border border-blue-100 rounded-xl">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 text-center">Rank</th>
                  <th className="px-4 py-2 text-center">Roll No</th>
                  <th className="px-4 py-2 text-center">Name</th>
                  <th className="px-4 py-2 text-center">Score</th>
                  <th className="px-4 py-2 text-center">%</th>
                  <th className="px-4 py-2 text-center">Time Taken</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.roll} className="even:bg-blue-50">
                    <td className="px-4 py-2 text-center font-bold">{s.rank}</td>
                    <td className="px-4 py-2 text-center">{s.roll}</td>
                    <td className="px-4 py-2 text-center">
                      <Link href={`/assessment-question-bank/results/view/${s.roll}`} className="text-blue-600 hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-center">{s.score}</td>
                    <td className="px-4 py-2 text-center">{s.percentage}%</td>
                    <td className="px-4 py-2 text-center">{s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Question Answered Ratio Table */}
        <div className="bg-white rounded-2xl shadow p-8 border border-blue-100 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#2563eb' }}>
            Question Answered Ratio (Highest to Lowest Correct)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-blue-900 border border-blue-100 rounded-xl">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 text-center">Q#</th>
                  <th className="px-4 py-2 text-center">Question</th>
                  <th className="px-4 py-2 text-center">Answered Correct</th>
                  <th className="px-4 py-2 text-center">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.number} className="even:bg-blue-50">
                    <td className="px-4 py-2 text-center font-bold">{q.number}</td>
                    <td className="px-4 py-2">{q.text}</td>
                    <td className="px-4 py-2 text-center">{q.correct} / {q.total}</td>
                    <td className="px-4 py-2 text-center">{((q.correct / q.total) * 100).toFixed(1)}%</td>
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
