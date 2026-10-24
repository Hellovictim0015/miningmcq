"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "../lib/AuthGuard";
import {
  User,
  Trophy,
  Info,
  Phone,
  LogOut,
  ChevronRight,
  Mail,
  Trash2,
  X,
} from "lucide-react";

function ProfileContent() {
  const router = useRouter();
  const [email, setEmail] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/checkauth", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEmail(data.user?.email || null);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authid");
    router.replace("/login");
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm.");
      return;
    }
    setIsDeleting(true);
    setDeleteError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.message || "Failed to delete account.");
        return;
      }
      localStorage.removeItem("authToken");
      localStorage.removeItem("authid");
      router.replace("/");
    } catch (err) {
      setDeleteError("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const menuItems = [
    { name: "My Results", description: "See your test scores and rank", href: "/results", icon: Trophy },
    { name: "About Us", description: "Learn more about Mining Shiksha", href: "/about", icon: Info },
    { name: "Contact", description: "Get in touch with support", href: "/contact", icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {email && (
            <p className="text-gray-500 flex items-center justify-center gap-2 mt-2">
              <Mail className="w-4 h-4" /> {email}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden divide-y divide-gray-100">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-6 py-5 hover:bg-orange-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border border-red-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Account</h2>
          <p className="text-sm text-gray-500 mb-3">
            Deleting your account is permanent and cannot be undone. This will:
          </p>
          <ul className="text-sm text-gray-500 list-disc list-inside space-y-1 mb-4">
            <li>Permanently remove your profile and login access</li>
            <li>Delete your test results and score history</li>
            <li>Delete your purchase/payment records tied to this account</li>
          </ul>
          <p className="text-sm text-gray-500 mb-4">
            To delete your account, click the button below and confirm with your password.
            If you no longer have access to this account, contact support from the{" "}
            <Link href="/contact" className="text-orange-600 font-semibold hover:underline">
              Contact page
            </Link>{" "}
            with your registered email and we will delete it for you.
          </p>
          <button
            onClick={() => {
              setDeleteError("");
              setDeletePassword("");
              setShowDeleteModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-semibold transition-all"
          >
            <Trash2 className="w-5 h-5" />
            Delete My Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Account Deletion</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter your password to permanently delete your account. This action cannot be undone.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-3 rounded-xl font-semibold transition-all"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
