"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThLarge,
  faBookOpen,
  faBookmark,
  faBook,
  faClipboardList,
  faCalendarAlt,
  faComments,
  faSignOutAlt,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebaseClient";

const navItems = [
  { name: "Dashboard", icon: faThLarge, href: "/learning-management" },
  { name: "Subject Management", icon: faBookOpen, href: "/learning-management/subjects" },
  { name: "Chapter Management", icon: faBookmark, href: "/learning-management/chapters" },
  { name: "Lesson Management", icon: faBook, href: "/learning-management/lessons" },
  { name: "Assignment Management", icon: faClipboardList, href: "/learning-management/assignments" },
  { name: "Diary Management", icon: faCalendarAlt, href: "/learning-management/diary" },
  { name: "Discussion Management", icon: faComments, href: "/learning-management/discussions" },
];

export default function LearningManagementSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <aside className="flex flex-col justify-between bg-white w-64 min-h-screen px-4 py-8 border-r border-gray-200 shadow-sm">
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/classaScreen")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span className="text-sm">Back to Main</span>
          </button>
        </div>
        
        <div className="flex items-center justify-center mb-8">
          <img
            src="/assets/images/edueronLogo.png"
            alt="Edueron Logo"
            className="object-contain h-16 w-32"
          />
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Learning Management</h2>
          <p className="text-sm text-gray-600">Manage subjects, chapters, lessons, and more</p>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition font-medium text-base ${
                pathname === item.href
                  ? "bg-blue-50 text-[#007dc6] font-bold"
                  : "text-gray-700 hover:bg-blue-50 hover:text-[#007dc6]"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="text-lg" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-[#007dc6] hover:bg-blue-50 transition font-medium text-base"
      >
        <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
        Sign Out
      </button>
    </aside>
  );
} 