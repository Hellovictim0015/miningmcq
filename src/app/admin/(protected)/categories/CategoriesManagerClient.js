"use client";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Tag } from "lucide-react";
import { adminFetch } from "../../adminFetch";

export default function CategoriesManagerClient() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setFile(null);
    setPreviewUrl(null);
    setShowAddForm(false);
    setEditingCategory(null);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (file) formData.append("image", file);

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await adminFetch(url, { method, body: formData });
      if (res.ok) {
        resetForm();
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save category");
      }
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setPreviewUrl(category.image_url);
    setFile(null);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await adminFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete category");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">Group courses, video courses and materials by exam/company (e.g. SAIL, Coal India)</p>
          </div>
          <button
            onClick={() => (showAddForm ? resetForm() : setShowAddForm(true))}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Category
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SAIL, Coal India"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-md" />
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingCategory ? "Update" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Tag className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <p className="text-gray-600">No categories yet. Add your first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <Tag className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-gray-900 truncate">{category.name}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => startEdit(category)}
                      className="flex-1 text-blue-600 hover:text-blue-900 text-sm py-1 rounded bg-blue-50 hover:bg-blue-100"
                    >
                      <Edit2 size={14} className="inline mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category)}
                      className="flex-1 text-red-600 hover:text-red-900 text-sm py-1 rounded bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 size={14} className="inline mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Category</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete &quot;{deleteConfirm.name}&quot;? Courses using it will keep showing, just without a category.
              </p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg">
                  Delete
                </button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
