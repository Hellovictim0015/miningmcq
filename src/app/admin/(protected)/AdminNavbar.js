"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, Video, FileText, LogOut, ShieldCheck, Tag } from "lucide-react";

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { name: "Courses", icon: BookOpen, href: "/admin" },
    { name: "Video Courses", icon: Video, href: "/admin/video" },
    { name: "Materials", icon: FileText, href: "/admin/materials" },
    { name: "Categories", icon: Tag, href: "/admin/categories" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.replace("/admin/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Admin Panel</span>
          </div>

          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{link.name}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
