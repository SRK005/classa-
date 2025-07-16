"use client";
import React, { useState } from "react";
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
  faChevronDown,
  faChevronRight,
  faLayerGroup,
  faGraduationCap,
  faList,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebaseClient";

interface SubNavItem {
  name: string;
  icon: any;
  href: string;
  badge?: number;
}

interface NavItem {
  name: string;
  icon: any;
  href: string;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", icon: faThLarge, href: "/learning-management" },
  { 
    name: "Subject Management", 
    icon: faBookOpen, 
    href: "/learning-management/subjects",
    subItems: [
      { name: "View Subjects", icon: faList, href: "/learning-management/subjects" },
      { name: "Add Subject", icon: faPlus, href: "/learning-management/subjects?action=add" },
    ]
  },
  { 
    name: "Chapter Management", 
    icon: faBookmark, 
    href: "/learning-management/chapters",
    subItems: [
      { name: "View Chapters", icon: faList, href: "/learning-management/chapters" },
      { name: "Add Chapter", icon: faPlus, href: "/learning-management/chapters?action=add" },
    ]
  },
  { 
    name: "Lesson Management", 
    icon: faBook, 
    href: "/learning-management/lessons",
    subItems: [
      { name: "View Lessons", icon: faList, href: "/learning-management/lessons" },
      { name: "Add Lesson", icon: faPlus, href: "/learning-management/lessons?action=add" },
    ]
  },
  { name: "Assignment Management", icon: faClipboardList, href: "/learning-management/assignments" },
  { name: "Diary Management", icon: faCalendarAlt, href: "/learning-management/diary" },
  { name: "Discussion Management", icon: faComments, href: "/learning-management/discussions" },
];

export default function LearningManagementSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActiveItem = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isParentActive = (item: NavItem) => {
    if (isActiveItem(item.href)) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => isActiveItem(subItem.href));
    }
    return false;
  };

  return (
    <aside className="h-screen w-72 bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faGraduationCap} className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Learning</h2>
              <p className="text-slate-400 text-sm">Management</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/classaScreen")}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
            title="Back to Main"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item) => (
            <div key={item.name} className="group">
              <div
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isParentActive(item)
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
                onClick={() => {
                  if (item.subItems) {
                    toggleExpanded(item.name);
                  } else {
                    router.push(item.href);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isParentActive(item) 
                      ? "bg-blue-500 text-white" 
                      : "bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-white"
                  }`}>
                    <FontAwesomeIcon icon={item.icon} className="text-sm" />
                  </div>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                
                {item.subItems && (
                  <FontAwesomeIcon
                    icon={expandedItems.includes(item.name) ? faChevronDown : faChevronRight}
                    className={`text-xs transition-transform duration-200 ${
                      expandedItems.includes(item.name) ? "rotate-0" : "rotate-0"
                    }`}
                  />
                )}
              </div>

              {/* Sub Items */}
              {item.subItems && (
                <div className={`overflow-hidden transition-all duration-300 ${
                  expandedItems.includes(item.name) 
                    ? "max-h-96 opacity-100 mt-2" 
                    : "max-h-0 opacity-0"
                }`}>
                  <div className="ml-6 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-sm ${
                          isActiveItem(subItem.href)
                            ? "bg-blue-500 text-white shadow-md"
                            : "text-slate-400 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          isActiveItem(subItem.href)
                            ? "bg-blue-400"
                            : "bg-slate-600"
                        }`}>
                          <FontAwesomeIcon icon={subItem.icon} className="text-xs" />
                        </div>
                        <span>{subItem.name}</span>
                        {subItem.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all duration-200"
        >
          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faSignOutAlt} className="text-sm" />
          </div>
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
} 