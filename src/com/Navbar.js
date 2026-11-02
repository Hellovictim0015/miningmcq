"use client";

import { BookOpen, Menu, X, User, Bell, Home, FileText, ClipboardList, Video } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";
import Link from 'next/link';
import Image from 'next/image';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Navigation Links
const navLinks = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Mcq', path: '/navlinkmcq', icon: ClipboardList },
  { name: 'Video', path: '/navlinkvideo', icon: Video },
  { name: 'Materials', path: '/navlinkmaterials', icon: FileText },
];

  // ✅ Check login state on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setIsLoggedIn(true);

    // The JWT expires after 7 days. Without this check the site keeps showing
    // the user as logged in while every API call fails, which looks like their
    // purchases disappeared. Only a definite 401 logs out; network errors don't.
    fetch("/api/auth/checkauth", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("authid");
          setIsLoggedIn(false);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-orange-100">
      {/* Top strip */}
      <div className="bg-gray-900 py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-gray-300 text-xs">
          <span className="flex items-center">
            <Bell className="h-3.5 w-3.5 mr-1.5 text-orange-400" />
            Prepare for DGMS, Coal India & Mining Statutory Exams
          </span>
          <div className="hidden md:flex">
            <span>✉️ helpminingshiksha@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-2">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Image
              src="/Frame 1000003961.png"
              alt="Mining Shiksha Logo"
              width={64}
              height={64}
              priority
              className="w-16 h-16 object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* User Auth Section - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            {isLoggedIn ? (
              <button
                onClick={handleProfile}
                className={`flex items-center px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  pathname === '/profile'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-700 border border-orange-200 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-orange-50 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-orange-100 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {link.name}
                  </Link>
                );
              })}

              {/* Mobile Auth Button */}
              <div className="pt-4 border-t border-orange-100">
                {isLoggedIn ? (
                  <button
                    onClick={() => { setIsMenuOpen(false); handleProfile(); }}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </button>
                ) : (
                  <button
                    onClick={() => { setIsMenuOpen(false); handleLogin(); }}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;