import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Content Management", href: "/content-management" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-screen w-56 bg-gray-100 border-r flex flex-col py-8 px-4">
      <div className="mb-8 text-2xl font-bold text-blue-700">Edueron</div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`px-4 py-2 rounded-lg font-medium text-base transition ${
              pathname === item.href
                ? "bg-white text-blue-700 shadow"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
} 