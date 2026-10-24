"use client";
import React, { useState, useMemo } from 'react';
import { BookOpen, Download, FileText, Video, Users, Star, Menu, X, Search, Filter, Grid, List, ChevronDown, SlidersHorizontal } from 'lucide-react';

export default function ViewAllMaterials() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 12;

  // Extended study materials data
  const allMaterials = [
    {
      id: 1,
      title: "Advanced Mathematics Notes",
      type: "PDF",
      subject: "Mathematics",
      downloads: 2547,
      rating: 4.8,
      pages: 156,
      author: "Dr. Sarah Johnson",
      uploadDate: "2024-01-15",
      size: "12.4 MB",
      thumbnail: "bg-gradient-to-br from-blue-400 to-blue-600",
      difficulty: "Advanced",
      description: "Comprehensive calculus and linear algebra notes with solved examples and practice problems."
    },
    {
      id: 2,
      title: "Physics Fundamentals",
      type: "PDF",
      subject: "Physics",
      downloads: 1823,
      rating: 4.6,
      pages: 203,
      author: "Prof. Michael Chen",
      uploadDate: "2024-01-10",
      size: "18.7 MB",
      thumbnail: "bg-gradient-to-br from-purple-400 to-purple-600",
      difficulty: "Intermediate",
      description: "Classical mechanics, thermodynamics, and electromagnetism fundamentals."
    },
    {
      id: 3,
      title: "Chemistry Lab Manual",
      type: "PDF",
      subject: "Chemistry",
      downloads: 1234,
      rating: 4.7,
      pages: 89,
      author: "Dr. Emma Wilson",
      uploadDate: "2024-01-08",
      size: "8.9 MB",
      thumbnail: "bg-gradient-to-br from-green-400 to-green-600",
      difficulty: "Beginner",
      description: "Step-by-step laboratory procedures and safety guidelines."
    },
    {
      id: 4,
      title: "Biology Lecture Series",
      type: "Video",
      subject: "Biology",
      downloads: 3156,
      rating: 4.9,
      duration: "2h 45m",
      author: "Dr. Lisa Zhang",
      uploadDate: "2024-01-12",
      size: "1.2 GB",
      thumbnail: "bg-gradient-to-br from-red-400 to-red-600",
      difficulty: "Intermediate",
      description: "Complete video series on molecular biology and genetics."
    },
    {
      id: 5,
      title: "Computer Science Basics",
      type: "PDF",
      subject: "Computer Science",
      downloads: 4267,
      rating: 4.8,
      pages: 312,
      author: "Dr. Alex Rodriguez",
      uploadDate: "2024-01-20",
      size: "25.3 MB",
      thumbnail: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      difficulty: "Beginner",
      description: "Programming fundamentals, data structures, and algorithms."
    },
    {
      id: 6,
      title: "English Grammar Guide",
      type: "PDF",
      subject: "English",
      downloads: 2134,
      rating: 4.5,
      pages: 178,
      author: "Prof. James Parker",
      uploadDate: "2024-01-05",
      size: "9.8 MB",
      thumbnail: "bg-gradient-to-br from-orange-400 to-orange-600",
      difficulty: "All Levels",
      description: "Complete grammar rules with examples and exercises."
    },
    {
      id: 7,
      title: "Organic Chemistry Reactions",
      type: "Video",
      subject: "Chemistry",
      downloads: 1876,
      rating: 4.7,
      duration: "3h 20m",
      author: "Dr. Emma Wilson",
      uploadDate: "2024-01-18",
      size: "2.1 GB",
      thumbnail: "bg-gradient-to-br from-teal-400 to-teal-600",
      difficulty: "Advanced",
      description: "Comprehensive video guide to organic reaction mechanisms."
    },
    {
      id: 8,
      title: "History World Wars",
      type: "PDF",
      subject: "History",
      downloads: 1654,
      rating: 4.4,
      pages: 245,
      author: "Prof. Robert Smith",
      uploadDate: "2024-01-03",
      size: "15.6 MB",
      thumbnail: "bg-gradient-to-br from-amber-400 to-amber-600",
      difficulty: "Intermediate",
      description: "Detailed analysis of World War I and II with timeline and maps."
    },
    {
      id: 9,
      title: "Statistics and Probability",
      type: "PDF",
      subject: "Mathematics",
      downloads: 2987,
      rating: 4.6,
      pages: 198,
      author: "Dr. Maria Garcia",
      uploadDate: "2024-01-14",
      size: "11.2 MB",
      thumbnail: "bg-gradient-to-br from-cyan-400 to-cyan-600",
      difficulty: "Intermediate",
      description: "Statistical analysis methods and probability theory with examples."
    },
    {
      id: 10,
      title: "Python Programming Tutorial",
      type: "Video",
      subject: "Computer Science",
      downloads: 5432,
      rating: 4.9,
      duration: "4h 15m",
      author: "Dr. Alex Rodriguez",
      uploadDate: "2024-01-22",
      size: "3.2 GB",
      thumbnail: "bg-gradient-to-br from-yellow-400 to-yellow-600",
      difficulty: "Beginner",
      description: "Complete Python course from basics to advanced topics."
    },
    {
      id: 11,
      title: "Cell Biology Research",
      type: "PDF",
      subject: "Biology",
      downloads: 1543,
      rating: 4.8,
      pages: 167,
      author: "Dr. Lisa Zhang",
      uploadDate: "2024-01-11",
      size: "13.4 MB",
      thumbnail: "bg-gradient-to-br from-pink-400 to-pink-600",
      difficulty: "Advanced",
      description: "Latest research in cell biology and molecular mechanisms."
    },
    {
      id: 12,
      title: "Economics Principles",
      type: "PDF",
      subject: "Economics",
      downloads: 2165,
      rating: 4.5,
      pages: 234,
      author: "Prof. David Lee",
      uploadDate: "2024-01-07",
      size: "16.8 MB",
      thumbnail: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      difficulty: "Intermediate",
      description: "Microeconomics and macroeconomics fundamentals with case studies."
    },
    {
      id: 13,
      title: "Quantum Physics Lectures",
      type: "Video",
      subject: "Physics",
      downloads: 2876,
      rating: 4.7,
      duration: "5h 30m",
      author: "Prof. Michael Chen",
      uploadDate: "2024-01-19",
      size: "4.1 GB",
      thumbnail: "bg-gradient-to-br from-violet-400 to-violet-600",
      difficulty: "Advanced",
      description: "Introduction to quantum mechanics and wave-particle duality."
    },
    {
      id: 14,
      title: "Shakespeare Complete Works",
      type: "PDF",
      subject: "English",
      downloads: 3245,
      rating: 4.6,
      pages: 456,
      author: "Prof. James Parker",
      uploadDate: "2024-01-02",
      size: "28.9 MB",
      thumbnail: "bg-gradient-to-br from-rose-400 to-rose-600",
      difficulty: "Advanced",
      description: "Complete collection of Shakespeare's plays and sonnets with analysis."
    },
    {
      id: 15,
      title: "Calculus Problem Sets",
      type: "PDF",
      subject: "Mathematics",
      downloads: 1987,
      rating: 4.4,
      pages: 134,
      author: "Dr. Sarah Johnson",
      uploadDate: "2024-01-16",
      size: "7.3 MB",
      thumbnail: "bg-gradient-to-br from-slate-400 to-slate-600",
      difficulty: "Intermediate",
      description: "Practice problems for differential and integral calculus."
    }
  ];

  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Economics'];
  const types = ['All', 'PDF', 'Video'];
  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'title', label: 'Title A-Z' }
  ];

  // Filter and sort materials
  const filteredMaterials = useMemo(() => {
    let filtered = allMaterials.filter(material => {
      const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           material.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           material.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || material.subject === selectedSubject;
      const matchesType = selectedType === 'All' || material.type === selectedType;
      
      return matchesSearch && matchesSubject && matchesType;
    });

    // Sort materials
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedSubject, selectedType, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Study Materials</h1>
              <p className="text-gray-600 mt-1">
                {filteredMaterials.length} materials found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className={`grid md:grid-cols-12 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            {/* Search */}
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search materials, authors, subjects..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Grid/List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {paginatedMaterials.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No materials found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedMaterials.map((material) => (
                  <div key={material.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all overflow-hidden group">
                    {/* Thumbnail */}
                    <div className={`h-48 ${material.thumbnail} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
                      {material.type === 'Video' ? (
                        <Video className="h-16 w-16 text-white z-10" />
                      ) : (
                        <FileText className="h-16 w-16 text-white z-10" />
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 text-gray-800 px-2 py-1 rounded-lg text-xs font-medium">
                        {material.type}
                      </div>
                      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded-lg text-xs">
                        {material.difficulty}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-600 font-medium">{material.subject}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{material.rating}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {material.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {material.description}
                      </p>

                      <p className="text-sm text-gray-500 mb-3">by {material.author}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{material.pages ? `${material.pages} pages` : material.duration}</span>
                        <div className="flex items-center space-x-1">
                          <Download className="h-4 w-4" />
                          <span>{material.downloads.toLocaleString()}</span>
                        </div>
                      </div>

                      <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedMaterials.map((material) => (
                  <div key={material.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-start space-x-6">
                      {/* Thumbnail */}
                      <div className={`w-24 h-24 ${material.thumbnail} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        {material.type === 'Video' ? (
                          <Video className="h-8 w-8 text-white" />
                        ) : (
                          <FileText className="h-8 w-8 text-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm text-blue-600 font-medium">{material.subject}</span>
                              <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">{material.type}</span>
                              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">{material.difficulty}</span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                              {material.title}
                            </h3>
                            
                            <p className="text-gray-600 mb-2 line-clamp-2">
                              {material.description}
                            </p>

                            <p className="text-sm text-gray-500 mb-2">by {material.author}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span>{material.rating}</span>
                              </div>
                              <span>{material.pages ? `${material.pages} pages` : material.duration}</span>
                              <div className="flex items-center space-x-1">
                                <Download className="h-4 w-4" />
                                <span>{material.downloads.toLocaleString()} downloads</span>
                              </div>
                              <span>{material.size}</span>
                            </div>
                          </div>

                          <button className="ml-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}