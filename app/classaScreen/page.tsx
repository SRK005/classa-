"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../components/firebase";

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
    title: "Learning Management\nSystem",
    icon: "/assets/images/lms.png",
    arrowColor: "text-green-500 group-hover:text-white",
    bgHover: "hover:bg-green-400",
    textImg: "/assets/images/1yi0p_L.png",
    page: null,
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
  {
    title: "School Management\nSystem",
    icon: "/assets/images/sms.png",
    arrowColor: "text-orange-400 group-hover:text-white",
    bgHover: "hover:bg-orange-200",
    textImg: "/assets/images/77jyz_S.png",
    page: null,
  },
  {
    title: "Admission Management",
    icon: "/assets/images/edueronLogo.png",
    arrowColor: "text-pink-500 group-hover:text-white",
    bgHover: "hover:bg-pink-200",
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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.displayName) {
        setUserName(user.displayName);
      } else if (user && user.email) {
        setUserName(user.email.split("@")[0]);
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
            <div className="text-base sm:text-lg md:text-xl font-semibold text-gray-700">Hello, {userName} 👋</div>
            <div className="text-sm sm:text-base md:text-lg font-medium text-gray-500 mt-2">Please Select The Required Module!</div>
          </div>
        </div>
        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-center mx-auto">
          {modules.map((mod, idx) => (
            <button
              key={mod.title}
              className={`bg-gray-100 rounded-2xl shadow-md p-4 md:p-6 flex flex-col justify-between w-full h-56 md:h-60 relative transition group ${mod.bgHover} focus:outline-none`}
              onClick={() => handleCardClick(mod)}
            >
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <div className="text-gray-700 group-hover:text-white font-semibold text-base md:text-lg leading-tight whitespace-pre-line text-left">{mod.title}</div>
                <img src={mod.icon} alt="Module Icon" className="h-10 w-10 md:h-12 md:w-12" />
              </div>
              <div className="flex justify-between items-end h-full">
                <span className={`${mod.arrowColor} text-3xl md:text-4xl font-bold`}>⟶</span>
                <img src={mod.textImg} alt="Module Text" className="h-16 md:h-20 w-auto" />
              </div>
            </button>
          ))}
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
    </div>
  );
} 