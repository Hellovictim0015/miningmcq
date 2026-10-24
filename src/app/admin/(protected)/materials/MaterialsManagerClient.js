"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Edit2, Trash2, X, FileText, DollarSign, Tag, Upload, Search } from "lucide-react";
import { adminFetch } from "../../adminFetch";

export default function StudyMaterialsManager() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [price, setPrice] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await adminFetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch all study materials
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/materials");
      const data = await res.json();
      if (data.success) {
        setMaterials(data.data);
        setFilteredMaterials(data.data);
      } else {
        alert("Failed to fetch study materials");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching study materials");
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    const filtered = materials.filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMaterials(filtered);
  }, [searchQuery, materials]);

  // Add or Update material
  const handleSubmit = async () => {
    if (!title || !subject) {
      alert("Title and Subject are required");
      return;
    }

    try {
      setAdding(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("price", price || 0);
      if (categoryId) formData.append("category_id", categoryId);
      if (pdfFile) formData.append("pdf_url", pdfFile);

      let url = "/api/admin/materials";
      let method = "POST";

      if (editingId) {
        formData.append("id", editingId);
        method = "PUT";
      }

      const res = await adminFetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(editingId ? "Updated successfully!" : "Added successfully!");
        resetForm();
        fetchMaterials();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save study material");
    } finally {
      setAdding(false);
    }
  };

  // Delete material
  const deleteMaterial = async (id) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      const res = await adminFetch(`/api/admin/materials?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchMaterials();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  // Edit material (prefill form)
  const editMaterial = (material) => {
    setEditingId(material.id);
    setTitle(material.title);
    setSubject(material.subject);
    setPrice(material.price);
    setPdfFile(null);
    setFileName("");
    setCategoryId(material.category_id || "");
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSubject("");
    setPrice("");
    setPdfFile(null);
    setFileName("");
    setCategoryId("");
    setShowForm(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setFileName(file.name);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Study Materials Manager
            </h1>
          </div>
          <p className="text-gray-600 ml-16">Organize and manage your educational resources</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search materials by title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? "Close Form" : "Add New Material"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              {editingId ? (
                <>
                  <Edit2 className="w-6 h-6 text-blue-600" />
                  Edit Study Material
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 text-blue-600" />
                  Add New Study Material
                </>
              )}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter material title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF Document
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {fileName || "Choose PDF file"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={adding}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? "Saving..." : editingId ? "Update Material" : "Add Material"}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Materials Grid */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Study Materials ({filteredMaterials.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery ? "No materials found matching your search" : "No study materials found"}
              </p>
              {!showForm && !searchQuery && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add your first material
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((m) => (
                <div
                  key={m.id}
                  className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      ₹{m.price}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">
                    {m.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {m.subject}
                  </p>

                  {m.pdf_url && (
                    <a
                      href={m.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mb-4"
                    >
                      <FileText className="w-4 h-4" />
                      View PDF
                    </a>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-300">
                    <button
                      onClick={() => editMaterial(m)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium border border-blue-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMaterial(m.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium border border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}