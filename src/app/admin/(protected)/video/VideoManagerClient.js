"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "../../adminFetch";
import {
  Video,
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Upload, 
  Globe, 
  DollarSign, 
  Clock, 
  FileText,
  Link,
  Search,
  Play,
  Image,
  Save
} from "lucide-react";

export default function VideoCoursesManager() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseName, setCourseName] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [language, setLanguage] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [slug, setSlug] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [imgFileName, setImgFileName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  // Edit modal state
  const [editingCourse, setEditingCourse] = useState(null);
  const [editImgFile, setEditImgFile] = useState(null);
  const [editImgPreview, setEditImgPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await adminFetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/video");
      const data = await res.json();
      if (data.success) {
        setCourses(data.data);
        setFilteredCourses(data.data);
      } else {
        alert("Failed to fetch courses");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = courses.filter(
      (c) =>
        c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  const deleteCourse = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await adminFetch(`/api/admin/video?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchCourses();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete course");
    }
  };

const handleAddCourse = async () => {
  if (!courseName || !coursePrice || !language) {
    alert("Course name, price, and language are required");
    return;
  }

  try {
    setAdding(true);

    // ✅ Auto-generate slug from courseName
    const generatedSlug = courseName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .replace(/\s+/g, "-"); // replace spaces with '-'

    const formData = new FormData();
    formData.append("course_name", courseName);
    formData.append("course_price", coursePrice);
    formData.append("language", language);
    formData.append("description", description);
    formData.append("duration", duration);
    formData.append("slug", generatedSlug); // ✅ use generated slug
    if (categoryId) formData.append("category_id", categoryId);
    if (imgFile) formData.append("img_url", imgFile);
    if (videoUrl) formData.append("video_url", videoUrl);

    const res = await adminFetch("/api/admin/video", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert("Course added successfully!");
      resetForm();
      fetchCourses();
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to add course");
  } finally {
    setAdding(false);
  }
};


  const resetForm = () => {
    setCourseName("");
    setCoursePrice("");
    setLanguage("");
    setDescription("");
    setDuration("");
    setSlug("");
    setImgFile(null);
    setImgFileName("");
    setVideoUrl("");
    setCategoryId("");
    setShowForm(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImgFile(file);
      setImgFileName(file.name);
    }
  };

  const startEditCourse = (course) => {
    setEditingCourse({ ...course });
    setEditImgFile(null);
    setEditImgPreview(course.img_url);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImgFile(file);
      setEditImgPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    if (!editingCourse.course_name || !editingCourse.course_price || !editingCourse.language) {
      alert("Course name, price, and language are required");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("id", editingCourse.id);
      formData.append("course_name", editingCourse.course_name);
      formData.append("course_price", editingCourse.course_price);
      formData.append("language", editingCourse.language);
      formData.append("description", editingCourse.description || "");
      formData.append("duration", editingCourse.duration || "");
      formData.append("slug", editingCourse.slug || "");
      formData.append("category_id", editingCourse.category_id || "");
      formData.append("video_url", editingCourse.video_url || "");
      if (editImgFile) formData.append("img_url", editImgFile);

      const res = await adminFetch("/api/admin/video", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Course updated successfully!");
        setEditingCourse(null);
        setEditImgFile(null);
        setEditImgPreview(null);
        fetchCourses();
      } else {
        alert(data.error || "Failed to update course");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Video Courses Manager
            </h1>
          </div>
          <p className="text-gray-600 ml-16">Create and manage your online video courses</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses by name, language, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? "Close Form" : "Add New Course"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <Plus className="w-6 h-6 text-purple-600" />
              Add New Course
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter course name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    placeholder="0"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="e.g., English, Hindi"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="e.g., 10 hours"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="course-url-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div> */}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    placeholder="Enter course description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="img-upload"
                />
                <label
                  htmlFor="img-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <Image className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 text-sm">{imgFileName || "Choose image file"}</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <div className="relative">
                  <Play className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="https://example.com/video.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddCourse}
                disabled={adding}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? "Adding Course..." : "Add Course"}
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

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Video Courses ({filteredCourses.length})</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery ? "No courses found matching your search" : "No video courses found"}
              </p>
              {!showForm && !searchQuery && (
                <button onClick={() => setShowForm(true)} className="mt-4 text-purple-600 hover:text-purple-700 font-medium">
                  Add your first course
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                    {course.img_url ? (
                      <img src={course.img_url} alt={course.course_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Video className="w-16 h-16 text-purple-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ₹{course.course_price}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{course.course_name}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4 text-purple-500" />
                        {course.language}
                      </div>
                      {course.duration && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-purple-500" />
                          {course.duration}
                        </div>
                      )}
                    </div>

                    {course.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                    )}

                    {course.video_url && (
                      <div className="mb-4 rounded-lg overflow-hidden bg-black">
                        <video controls className="w-full" style={{ maxHeight: "200px" }}>
                          <source src={course.video_url} type="video/mp4" />
                        </video>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => startEditCourse(course)}
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors font-medium border border-purple-200"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Video Course</h2>
              <button onClick={() => setEditingCourse(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                  <input
                    type="text"
                    value={editingCourse.course_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
                      setEditingCourse({ ...editingCourse, course_name: name, slug });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={editingCourse.course_price}
                    onChange={(e) => setEditingCourse({ ...editingCourse, course_price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language *</label>
                  <input
                    type="text"
                    value={editingCourse.language}
                    onChange={(e) => setEditingCourse({ ...editingCourse, language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={editingCourse.duration || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editingCourse.category_id || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                  <input
                    type="text"
                    value={editingCourse.video_url || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, video_url: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  {editImgPreview && (
                    <img src={editImgPreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingCourse.description || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}