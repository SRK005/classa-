"use client";
import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
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
    const [hrefPath, hrefQuery] = href.split('?');

    if (pathname !== hrefPath) {
        return false;
    }

    const currentQuery = searchParams.toString();

    if (!hrefQuery) {
        return currentQuery === '';
    }

    return currentQuery === hrefQuery;
  };

  const isParentActive = (item: NavItem) => {
    if (isActiveItem(item.href)) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => isActiveItem(subItem.href));
    }
    return false;
  };

  return (
    <aside className="flex flex-col justify-between bg-white w-64 min-h-screen px-4 py-8 border-r border-gray-200 shadow-sm">
      <div>
        <div className="flex items-center justify-left mb-4">
          <img
            src="/assets/images/classa logo.png"
            alt="Classa Logo"
            className="object-contain h-22 w-46"
          />
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Learning Management</h2>
          <p className="text-sm text-gray-600">Manage subjects, lessons, and content</p>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <div key={item.name}>
              <div
                className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl transition font-medium text-base cursor-pointer ${
                  isParentActive(item)
                    ? "bg-blue-50 text-[#007dc6] font-bold"
                    : "text-gray-700 hover:bg-blue-50 hover:text-[#007dc6]"
                }`}
                onClick={() => {
                  if (item.subItems) {
                    toggleExpanded(item.name);
                  } else {
                    router.push(item.href);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <FontAwesomeIcon icon={item.icon} className="text-lg" />
                  {item.name}
                </div>
                {item.subItems && (
                  <FontAwesomeIcon
                    icon={expandedItems.includes(item.name) ? faChevronDown : faChevronRight}
                    className={`text-xs transition-transform duration-200`}
                  />
                )}
              </div>

              {item.subItems && (
                <div className={`overflow-hidden transition-all duration-300 ${
                  expandedItems.includes(item.name) ? "max-h-96 mt-2" : "max-h-0"
                }`}>
                  <div className="ml-8 flex flex-col gap-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition font-normal text-sm ${
                          isActiveItem(subItem.href)
                            ? "bg-blue-50 text-[#007dc6]"
                            : "text-gray-600 hover:bg-blue-50 hover:text-[#007dc6]"
                        }`}
                      >
                        <FontAwesomeIcon icon={subItem.icon} className="text-base" />
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
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