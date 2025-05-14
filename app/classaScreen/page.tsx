"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../components/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseClient";

const modules = [
  {
    title: "Content Management\nSystem",
    icon: "/assets/images/cEmoji.png",
    arrowColor: "text-blue-500 group-hover:text-white",
    bgHover: "hover:bg-blue-300",
    textImg: "/assets/images/CText.png",
    page: "/content-management",
  },
  {
    title: "Assessments and\nQuestion Book",
    icon: "/assets/images/assessment.png",
    arrowColor: "text-yellow-400 group-hover:text-white",
    bgHover: "hover:bg-yellow-200",
    textImg: "/assets/images/oxi63_A.png",
    page: "/assessment-question-bank",
  },
  {
    title: "SenseAI",
    icon: "/assets/images/senseai.png",
    arrowColor: "text-purple-500 group-hover:text-white",
    bgHover: "hover:bg-purple-300",
    textImg: "/assets/images/77jyz_S.png",
    page: null,
  },
];

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
        {children}
      </div>
    </div>
  );
}

export default function ClassaScreen() {
  const [userName, setUserName] = useState("User");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().display_name) {
            setUserName(userDoc.data().display_name);
          } else if (user.displayName) {
            setUserName(user.displayName);
          } else if (user.email) {
            setUserName(user.email.split("@")[0]);
          } else {
            setUserName("User");
          }
        } catch (e) {
          setUserName("User");
        }
      } else {
        setUserName("User");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCardClick = (mod: typeof modules[0]) => {
    if (mod.page) {
      router.push(mod.page);
    } else {
      setModalMsg("Please Stay Tuned For Further Updates");
      setModalOpen(true);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-start"
      style={{ backgroundImage: 'url(/assets/images/Profile_Screen.png)' }}
    >
      <div className="w-full max-w-6xl px-2 sm:px-4 md:px-8 py-6 md:py-10 mx-auto">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <img src="/assets/images/edueronLogo.png" alt="Logo" className="h-12 w-auto" />
          <div className="text-right">
            <div className="text-base sm:text-lg md:text-xl font-semibold text-gray-700">Hi, {userName} 👋</div>
            <div className="text-sm sm:text-base md:text-lg font-medium text-gray-500 mt-2">Please Select The Required Module!</div>
          </div>
        </div>
        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-center mx-auto">
          {/* 1st row */}
          {/* Content Management System */}
          <button
            key="Content Management System"
            className={`rounded-2xl shadow-md p-4 md:p-6 flex flex-col justify-between w-full h-56 md:h-60 relative transition group bg-gray-100 focus:outline-none hover:bg-blue-300`}
            onClick={() => handleCardClick(modules[0])}
          >
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className="text-gray-700 group-hover:text-white font-semibold text-base md:text-lg leading-tight whitespace-pre-line text-left">{modules[0].title}</div>
              <img src={modules[0].icon} alt="Module Icon" className="h-10 w-10 md:h-12 md:w-12" />
            </div>
            <div className="flex justify-between items-end h-full">
              <span className={`text-gray-400 group-hover:${modules[0].arrowColor.replace('text-', '')} text-3xl md:text-4xl font-bold`}>⟶</span>
              <img src={modules[0].textImg} alt="Module Text" className="h-16 md:h-20 w-auto" />
            </div>
          </button>
          {/* Learning Management System (locked) */}
          <div
            className="rounded-2xl shadow-md p-4 md:p-6 flex flex-col justify-center items-center w-full h-56 md:h-60 relative cursor-not-allowed group select-none bg-gray-100"
            style={{ opacity: 0.8 }}
          >
            <span className="absolute top-4 left-4 text-gray-400 group-hover:text-green-400 text-2xl">
              <img src="/assets/images/lms.png" alt="LMS Icon" className="w-8 h-8" />
            </span>
            <span className="text-6xl md:text-7xl font-extrabold text-gray-400 group-hover:text-green-400 flex-1 flex items-center justify-center">L</span>
            <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-2xl opacity-0 group-hover:opacity-100"
                 style={{ pointerEvents: 'none', backgroundColor: '#d2f5e3' }}>
              <span className="text-center w-full text-green-700 text-lg md:text-2xl font-semibold">Learning Management System</span>
            </div>
            <span className="absolute top-4 right-4 text-gray-400 text-2xl"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-8 h-8'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4' /></svg></span>
          </div>
          {/* Assessments and Question Book */}
          <button
            key="Assessments and Question Book"
            className={`rounded-2xl shadow-md p-4 md:p-6 flex flex-col justify-between w-full h-56 md:h-60 relative transition group bg-gray-100 focus:outline-none hover:bg-yellow-200`}
            onClick={() => handleCardClick(modules[1])}
          >
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className="text-gray-700 group-hover:text-white font-semibold text-base md:text-lg leading-tight whitespace-pre-line text-left">{modules[1].title}</div>
              <img src={modules[1].icon} alt="Module Icon" className="h-10 w-10 md:h-12 md:w-12" />
            </div>
            <div className="flex justify-between items-end h-full">
              <span className={`text-gray-400 group-hover:${modules[1].arrowColor.replace('text-', '')} text-3xl md:text-4xl font-bold`}>⟶</span>
              <img src={modules[1].textImg} alt="Module Text" className="h-16 md:h-20 w-auto" />
            </div>
          </button>
          {/* 2nd row */}
          {/* SenseAI (locked) */}
          <div
            className="rounded-2xl shadow-md p-4 md:p-6 flex flex-col justify-center items-center w-full h-56 md:h-60 relative cursor-not-allowed group select-none bg-gray-100"
            style={{ opacity: 0.8 }}
          >
            <span className="absolute top-4 left-4 text-purple-400 text-2xl">
              <img src="/assets/images/senseai.png" alt="SenseAI Icon" className="w-8 h-8" />
            </span>
            <span className="text-6xl md:text-7xl font-extrabold text-gray-400 group-hover:text-purple-400 flex-1 flex items-center justify-center">S</span>
            <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-2xl opacity-0 group-hover:opacity-100"
                  style={{ pointerEvents: 'none', backgroundColor: '#e6d6fa' }}>
              <span className="text-center w-full text-purple-700 text-lg md:text-2xl font-semibold">SenseAI</span>
            </div>
            <span className="absolute top-4 right-4 text-gray-400 text-2xl"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-8 h-8'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4' /></svg></span>
          </div>
          {/* School Management System (locked) */}
          <div
            className="rounded-2xl shadow-md p-4 md:p-6 flex flex-col justify-center items-center w-full h-56 md:h-60 relative cursor-not-allowed group select-none bg-gray-100"
            style={{ opacity: 0.8 }}
          >
            <span className="absolute top-4 left-4 text-gray-400 group-hover:text-yellow-900 text-2xl">
              <img src="/assets/images/sms.png" alt="SMS Icon" className="w-8 h-8" />
            </span>
            <span className="text-6xl md:text-7xl font-extrabold text-gray-400 group-hover:text-yellow-900 flex-1 flex items-center justify-center">S</span>
            <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-2xl opacity-0 group-hover:opacity-100"
                 style={{ pointerEvents: 'none', backgroundColor: '#e9dac5' }}>
              <span className="text-center w-full text-yellow-900 text-lg md:text-2xl font-semibold">School Management System</span>
            </div>
            <span className="absolute top-4 right-4 text-gray-400 text-2xl"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-8 h-8'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4' /></svg></span>
          </div>
          {/* Admission Management (locked) */}
          <div className="rounded-2xl shadow-md p-4 md:p-6 flex flex-col justify-center items-center w-full h-56 md:h-60 relative bg-gray-100 opacity-80 cursor-not-allowed group select-none">
            <span className="absolute top-4 left-4 text-purple-400 text-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </span>
            <span className="text-6xl md:text-7xl font-extrabold text-gray-400 group-hover:text-purple-400 flex-1 flex items-center justify-center">A</span>
            <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-2xl bg-gray-100 opacity-0 group-hover:opacity-100"
                 style={{ pointerEvents: 'none', backgroundColor: '#d6c3f7' }}>
              <span className="text-center w-full text-purple-700 text-lg md:text-2xl font-semibold">Admission Management System</span>
            </div>
            <span className="absolute top-4 right-4 text-gray-400 text-2xl"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-8 h-8'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4' /></svg></span>
          </div>
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col items-center gap-4">
          <span className="text-4xl text-blue-500">🚧</span>
          <div className="text-lg font-semibold text-gray-800">{modalMsg}</div>
          <div className="text-gray-500 text-sm">We're working hard to bring you this feature soon.</div>
        </div>
      </Modal>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
      `}</style>
      <style jsx>{`
        button.group:hover {
          background: #e6d6fa;
        }
      `}</style>
    </div>
  );
} 