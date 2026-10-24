"use client";
import { useState, useEffect, useCallback, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "../../../adminFetch";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Search,
  Clock,
  BookOpen,
  ChevronRight
} from "lucide-react";

export default function CourseTestsPage({ params }) {
  const { id: course_id } = usePromise(params);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testName, setTestName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ---------------- FETCH TESTS BY COURSE ----------------
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/tests?course_id=${course_id}`);
      const data = await res.json();
      setTests(data);
    } catch (err) {
      console.error("Error fetching tests:", err);
      showNotification("Failed to fetch tests", "error");
    } finally {
      setLoading(false);
    }
  }, [course_id]);

  // ---------------- ADD TEST ----------------
  const addTest = async (e) => {
    e.preventDefault();
    if (!testName.trim()) return;

    try {
      const res = await adminFetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id, test_name: testName }),
      });
      const data = await res.json();
      
      setTestName("");
      setShowAddForm(false);
      fetchTests();
      showNotification("Test added successfully!");
    } catch (err) {
      console.error("Error adding test:", err);
      showNotification("Failed to add test", "error");
    }
  };

  // ---------------- UPDATE TEST ----------------
  const updateTest = async (e) => {
    e.preventDefault();
    if (!editingTest || !editingTest.test_name.trim()) return;

    try {
      const res = await adminFetch(`/api/admin/tests?id=${editingTest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_name: editingTest.test_name, course_id }),
      });
      const data = await res.json();
      
      setEditingTest(null);
      fetchTests();
      showNotification("Test updated successfully!");
    } catch (err) {
      console.error("Error updating test:", err);
      showNotification("Failed to update test", "error");
    }
  };

  // ---------------- DELETE TEST ----------------
  const deleteTest = async () => {
    if (!deleteConfirm) return;

    try {
      const res = await adminFetch(`/api/admin/tests?id=${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      
      setDeleteConfirm(null);
      fetchTests();
      showNotification("Test deleted successfully!");
    } catch (err) {
      console.error("Error deleting test:", err);
      showNotification("Failed to delete test", "error");
    }
  };

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const goToQuestions = (testId) => {
    router.push(`/admin/mcq/${testId}`);
  };

  // Filter tests based on search
  const filteredTests = tests.filter(test =>
    test.test_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
          notification.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}>
          {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Courses</span>
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Tests</h1>
              <p className="text-gray-600">Manage tests for Course ID: {course_id}</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Test</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tests</p>
                <h3 className="text-2xl font-bold text-gray-900">{tests.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Tests</p>
                <h3 className="text-2xl font-bold text-gray-900">{tests.length}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Course ID</p>
                <h3 className="text-2xl font-bold text-gray-900">{course_id}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Test Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Test</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Name *</label>
                <input
                  type="text"
                  placeholder="Enter test name (e.g., Chapter 1 Quiz)"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={addTest}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Test</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Edit Modal */}
        {editingTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Test</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Name *</label>
                  <input
                    type="text"
                    value={editingTest.test_name}
                    onChange={(e) => setEditingTest({ ...editingTest, test_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={updateTest}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTest(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Test</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>“{deleteConfirm.test_name}”</strong>? All questions in this test will also be deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={deleteTest}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Tests List */}
        {!loading && filteredTests.length > 0 && (
          <div className="space-y-4">
            {filteredTests.map((test, index) => (
              <div
                key={test.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div 
                      onClick={() => goToQuestions(test.id)}
                      className="flex items-start gap-4 flex-1 cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {test.test_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Created recently</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>MCQ Test</span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors hidden sm:block" />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTest(test);
                        }}
                        className="flex-1 sm:flex-none bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(test);
                        }}
                        className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTests.length === 0 && tests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first test</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add First Test</span>
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && filteredTests.length === 0 && tests.length > 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
}