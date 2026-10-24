"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Clock, 
  Users, 
  Play, 
  Award,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  Heart,
  ShoppingCart,
  Zap,
  CheckCircle,
  Loader2,
  AlertCircle,
  FileText,
  Target,
  Brain
} from 'lucide-react';

export default function AllMCQCoursesPage({ limit, viewAllHref = '/navlinkmcq', category }) {
  const router = useRouter();
  const isPreview = Boolean(limit);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistedCourses, setWishlistedCourses] = useState(new Set());
  const itemsPerPage = 12;

  // Fetch MCQ courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const categoryParam = category ? `&category=${category}` : '';
        const response = await fetch(`/api/Get_all_mcq?limit=${limit || 100}${categoryParam}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          const validCourses = result.data
            .filter(course => course.course_name && course.course_name.trim())
            .map(course => ({
              ...course,
              originalPrice: Math.round(course.course_price * 1.5),
              rating: 4.5 + Math.random() * 0.4,
              reviews: Math.floor(Math.random() * 1000) + 100,
              students: Math.floor(Math.random() * 5000) + 500,
              lessons: Math.floor(Math.random() * 100) + 20,
              instructor: "Expert Instructor",
              lastUpdated: "January 2024",
              certificate: true,
              level: "All Levels",
              subject: "MCQ Practice",
              difficulty: "intermediate"
            }));
          
          setAllCourses(validCourses);
        } else {
          throw new Error(result.message || 'Failed to fetch courses');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [limit, category]);

  const languages = ['All', ...new Set(allCourses.map(course => course.language).filter(Boolean))];
  const prices = ['All', '$0-$50', '$50-$100', '$100+'];
  const durations = ['All', '0-2 hours', '2-5 hours', '5+ hours'];
  
  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'students', label: 'Most Students' }
  ];

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = allCourses.filter(course => {
      const matchesLanguage = selectedLanguage === 'All' || course.language === selectedLanguage;

      let matchesPrice = true;
      if (selectedPrice === '$0-$50') matchesPrice = course.course_price <= 50;
      else if (selectedPrice === '$50-$100') matchesPrice = course.course_price > 50 && course.course_price <= 100;
      else if (selectedPrice === '$100+') matchesPrice = course.course_price > 100;

      let matchesDuration = true;
      const duration = parseFloat(course.duration) || 0;
      if (selectedDuration === '0-2 hours') matchesDuration = duration <= 2;
      else if (selectedDuration === '2-5 hours') matchesDuration = duration > 2 && duration <= 5;
      else if (selectedDuration === '5+ hours') matchesDuration = duration > 5;

      return matchesLanguage && matchesPrice && matchesDuration;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.students - a.students;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        case 'price-low':
          return a.course_price - b.course_price;
        case 'price-high':
          return b.course_price - a.course_price;
        case 'students':
          return b.students - a.students;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allCourses, selectedLanguage, selectedPrice, selectedDuration, sortBy]);

  // Pagination (preview mode shows the first `limit` courses with no pager)
  const totalPages = isPreview ? 1 : Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = isPreview
    ? filteredCourses.slice(0, limit)
    : filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleWishlist = (courseId) => {
    const newWishlisted = new Set(wishlistedCourses);
    if (newWishlisted.has(courseId)) {
      newWishlisted.delete(courseId);
    } else {
      newWishlisted.add(courseId);
    }
    setWishlistedCourses(newWishlisted);
  };

  const handleCourseClick = (courseSlug) => {
    router.push(`/coursedetails/${courseSlug}`);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getBadgeColor = (index) => {
    const badges = [
      { text: 'Popular', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'Bestseller', color: 'bg-violet-100 text-violet-800' },
      { text: 'New', color: 'bg-cyan-100 text-cyan-800' },
      { text: 'Hot', color: 'bg-rose-100 text-rose-800' },
      { text: 'Trending', color: 'bg-fuchsia-100 text-fuchsia-800' },
    ];
    return badges[index % badges.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading MCQ courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Courses</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={isPreview ? '' : 'min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'}>
      {/* Header */}
      <div className={isPreview ? '' : 'bg-white shadow-sm border-b'}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center space-x-3">
              <Brain className="h-10 w-10 text-orange-600" />
              <span>MCQ Practice Courses</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master your subjects with comprehensive MCQ practice tests and detailed explanations
            </p>
          </div>

          {!isPreview && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-600">
                    Showing {filteredCourses.length} of {allCourses.length} MCQ courses
                  </p>
                </div>

                <div className="flex items-center space-x-4">
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

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filters</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className={`grid lg:grid-cols-3 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
                <div>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      setSelectedLanguage(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {languages.map(language => (
                      <option key={language} value={language}>
                        {language === 'All' ? 'All Languages' : language}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedPrice}
                    onChange={(e) => {
                      setSelectedPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {prices.map(price => (
                      <option key={price} value={price}>{price}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Courses Grid/List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {paginatedCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No MCQ courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedCourses.map((course, index) => {
                  const badge = getBadgeColor(index);
                  const discountPercentage = Math.round((1 - course.course_price / course.originalPrice) * 100);
                  
                  return (
                    <div key={course.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all overflow-hidden group cursor-pointer">
                      <div 
                        onClick={() => handleCourseClick(course.slug)}
                        className="h-48 relative overflow-hidden group cursor-pointer rounded-xl"
                      >
                        <img
                          src={course.img_url}
                          alt={course.course_name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 to-amber-900/40 group-hover:from-orange-900/60 group-hover:to-amber-900/60 transition-all"></div>

                        <div className="text-center z-10 relative">
                          <p className="text-white text-sm font-medium">{course.course_name}</p>
                        </div>

                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                          {badge.text}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(course.id);
                          }}
                          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                            wishlistedCourses.has(course.id)
                              ? "bg-rose-500 text-white"
                              : "bg-white/80 text-gray-600 hover:bg-white"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              wishlistedCourses.has(course.id) ? "fill-current" : ""
                            }`}
                          />
                        </button>

                        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded-lg text-xs">
                          {course.language}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-3">
                          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                            {course.course_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center">
                              {renderStars(course.rating)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{course.rating?.toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({course.reviews?.toLocaleString()})</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>3h</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{course.totaltest} MCQs Tests</span>
                            </div>
                          </div>
                        </div>  
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                             
                               {course.language}
                            </div>
                          
                          </div>
                        </div>  

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-800">₹{course.course_price}</span>
                            <span className="text-sm text-gray-400 line-through">₹{course.originalPrice}</span>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
                            {discountPercentage}% OFF
                          </span>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/coursedetails/${course.slug}`);
                            }}
                            className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Enroll Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedCourses.map((course, index) => {
                  const badge = getBadgeColor(index);
                  const discountPercentage = Math.round((1 - course.course_price / course.originalPrice) * 100);
                  
                  return (
                    <div key={course.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer">
                      <div 
                        onClick={() => handleCourseClick(course.slug)}
                        className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-full md:w-64 h-48 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="text-center z-10">
                              <Target className="h-12 w-12 text-white mx-auto mb-2" />
                              <p className="text-white text-sm font-medium">MCQ Practice</p>
                            </div>
                            
                            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                              {badge.text}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(course.id);
                              }}
                              className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                                wishlistedCourses.has(course.id)
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-white/80 text-gray-600 hover:bg-white'
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${wishlistedCourses.has(course.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="flex-1 mb-4 md:mb-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm text-orange-600 font-medium">MCQ Practice</span>
                                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">{course.language}</span>
                              </div>
                              
                              <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-orange-600 transition-colors">
                                {course.course_name}
                              </h3>
                              
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {course.description}
                              </p>

                              <p className="text-sm text-gray-500 mb-3">by {course.instructor}</p>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center space-x-1">
                                  <div className="flex items-center">
                                    {renderStars(course.rating)}
                                  </div>
                                  <span className="font-medium text-gray-700">{course.rating?.toFixed(1)}</span>
                                  <span>({course.reviews?.toLocaleString()})</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4" />
                                  <span>{course.students?.toLocaleString()} students</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{course.duration}h duration</span>
                                </div>
                                <span>Updated {course.lastUpdated}</span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                                  {course.lessons} MCQs
                                </span>
                                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full flex items-center space-x-1">
                                  <Award className="h-3 w-3" />
                                  <span>Certificate</span>
                                </span>
                                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                                  Instant Results
                                </span>
                              </div>
                            </div>

                            <div className="md:ml-6 md:text-right">
                              <div className="mb-4">
                                <div className="flex items-center justify-start md:justify-end space-x-2 mb-1">
                                  <span className="text-2xl font-bold text-gray-800">₹{course.course_price}</span>
                                  <span className="text-lg text-gray-400 line-through">₹{course.originalPrice}</span>
                                </div>
                                <div className="text-sm text-emerald-600 font-medium">
                                  {discountPercentage}% OFF
                                </div>
                              </div>

                              <div className="space-y-2">
                                <button className="w-full md:w-40 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
                                  Start Practice
                                </button>
                                <button className="w-full md:w-40 bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                                  <ShoppingCart className="h-4 w-4" />
                                  <span>Add to Cart</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                            ? 'bg-orange-600 text-white'
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

        {isPreview && paginatedCourses.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => router.push(viewAllHref)}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              View All MCQ Courses →
            </button>
          </div>
        )}
      </div>

      {/* MCQ Practice Benefits Section */}
      {/* <div className="bg-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Our MCQ Practice?</h2>
            <p className="text-xl text-gray-600">Master your subjects with comprehensive practice tests</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: <Target className="h-8 w-8 text-orange-600" />, 
                title: 'Targeted Practice', 
                description: 'Focus on specific topics and weak areas with curated question sets' 
              },
              { 
                icon: <Brain className="h-8 w-8 text-amber-600" />, 
                title: 'Smart Analytics', 
                description: 'Track your progress with detailed performance analytics and insights' 
              },
              { 
                icon: <CheckCircle className="h-8 w-8 text-emerald-600" />, 
                title: 'Instant Feedback', 
                description: 'Get immediate results with detailed explanations for every answer' 
              },
              { 
                icon: <Award className="h-8 w-8 text-amber-500" />, 
                title: 'Certification', 
                description: 'Earn certificates upon completion to showcase your achievements' 
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Popular Categories Section */}
        {/* <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Popular MCQ Categories</h2>
              <p className="text-xl text-gray-600">Practice across different subjects and skill levels</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { name: 'Mining Engineering', icon: '⛏️', courses: 12, color: 'bg-orange-100 text-orange-800' },
                { name: 'Safety Management', icon: '🛡️', courses: 8, color: 'bg-emerald-100 text-emerald-800' },
                { name: 'Technical Skills', icon: '🔧', courses: 15, color: 'bg-amber-100 text-amber-800' },
                { name: 'General Knowledge', icon: '📚', courses: 20, color: 'bg-cyan-100 text-cyan-800' },
                { name: 'Aptitude Tests', icon: '🧠', courses: 10, color: 'bg-fuchsia-100 text-fuchsia-800' },
                { name: 'English', icon: '🔤', courses: 6, color: 'bg-violet-100 text-violet-800' }
              ].map((category, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                  <h3 className="font-semibold text-gray-800 mb-2">{category.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${category.color}`}>
                    {category.courses} courses
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div> */}

      {/* Newsletter Section */}
    
    </div>
  );
}