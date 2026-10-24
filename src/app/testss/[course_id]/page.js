"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  Users,
  ArrowLeft,
  Trophy,
  AlertCircle,
  PlusCircle,
} from "lucide-react";

export default function TestsPage() {
  const { course_id } = useParams();
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseName, setCourseName] = useState("");

  // ✅ For Add Test Modal
  const [newTestName, setNewTestName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!course_id) return;

    const fetchTests = async () => {
      try {
        const res = await fetch(`/api/tests/${course_id}`);
        const data = await res.json();

        if (data.success) {
          setTests(data.data);
          setCourseName(data.courseName || `Course ${course_id}`);
        } else {
          setError(data.message || "Failed to fetch tests");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [course_id]);

  const handleAddMCQ = (testId) => {
    router.push(`/admin/addmcq/${testId}`);
  };

  // ✅ Create new test
  const handleAddTest = async () => {
    if (!newTestName.trim()) return;

    setAdding(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/admin_api/add_test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          course_id: course_id,
          test_name: newTestName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTests([...tests, data.test]); // append new test
        setNewTestName("");
      } else {
        alert(data.message || "Failed to create test");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading tests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{courseName}</h1>
              <p className="text-gray-600 mt-1">Available Tests & Quizzes</p>
            </div>
          </div>
          <div className="flex items-center bg-indigo-50 px-4 py-2 rounded-lg">
            <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
            <span className="text-indigo-700 font-medium">
              {tests.length} Tests
            </span>
          </div>
        </div>
      </div>

      {/* Add Test Input */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Enter test name"
            value={newTestName}
            onChange={(e) => setNewTestName(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleAddTest}
            disabled={adding}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {adding ? "Adding..." : "Add Test"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tests.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No tests available
            </h3>
            <p className="text-gray-500 mb-6">
              There are no tests found for this course yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div
                key={test.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {test.test_name || `Test ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {test.total_questions || 50} questions •{" "}
                      {test.duration || 45} minutes
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddMCQ(test.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add MCQ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
