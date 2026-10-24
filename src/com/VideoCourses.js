"use client"
import React, { useState, useEffect } from 'react'
import { BookOpen, Download, FileText, Video, Users, Star, Menu, X, Search, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function VideoCourses({ limit, viewAllHref = '/navlinkvideo', category }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const categoryParam = category ? `&category=${category}` : '';
        const response = await fetch(`/api/get_all_course?limit=${limit || 100}${categoryParam}`);
        const result = await response.json();

        if (result.success) {
          setCourses(result.data);
        } else {
          setError('Failed to fetch courses');
        }
      } catch (err) {
        setError('Error fetching courses: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [limit, category]);

  const filteredCourses = courses;

  // Function to get badge based on course data
  const getBadge = (course, index) => {
    if (course.average_rating >= 4.8) return 'Bestseller';
    if (index < 2) return 'Popular';
    if (course.course_id > 10) return 'New';
    return 'Limited Offer';
  };

  // Function to get badge styling
  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'Bestseller':
        return 'bg-yellow-400 text-yellow-900';
      case 'Popular':
        return 'bg-green-400 text-green-900';
      case 'New':
        return 'bg-blue-400 text-blue-900';
      default:
        return 'bg-red-400 text-red-900';
    }
  };

  // Function to get gradient background
  const getGradientBg = (index) => {
    const gradients = [
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-green-500 to-emerald-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500',
      'bg-gradient-to-br from-red-500 to-orange-500',
      'bg-gradient-to-br from-amber-500 to-orange-500'
    ];
    return gradients[index % gradients.length];
  };

  // Calculate discount percentage (assuming 40% standard discount)
  const getOriginalPrice = (price) => Math.round(price / 0.6);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Premium Video Courses</h2>
          <p className="text-xl text-gray-600">Comprehensive courses designed by experts to accelerate your learning</p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => {
            const badge = getBadge(course, index);
            const originalPrice = getOriginalPrice(course.course_price);
            const discount = Math.round((1 - course.course_price / originalPrice) * 100);

            return (
              <div key={course.course_id} className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all overflow-hidden group">
                {/* Course Thumbnail */}
                <div className={`h-48 ${getGradientBg(index)} flex items-center justify-center relative overflow-hidden`}>
                  {/* If you want to use the actual image from API */}
                  <img 
                    src={course.img_url} 
                    alt={course.course_name}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
                  
                  {/* Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeStyle(badge)}`}>
                    {badge}
                  </div>

                  {/* Duration */}
                  <div className="absolute top-4 right-4 bg-white/90 text-gray-800 px-2 py-1 rounded-lg text-xs font-medium">
                    {course.duration} weeks
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  {/* Course Title & Rating */}
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {course.course_name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(course.average_rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {course.average_rating || '4.5'}
                      </span>
                      <span className="text-sm text-gray-500">(New Course)</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Course Details */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>⏱️ {course.duration} weeks</span>
                      <span>📚 Expert content</span>
                    </div>
                  </div>

                  {/* Price & Purchase */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-800">₹{course.course_price}</span>
                      <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        {discount}% OFF
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/coursevideo/${course.slug}`)}
                    className="w-full mt-2 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Enroll Now
                  </button>

                </div>
              </div>
            );
          })}
        </div>

        {/* View All Courses Button */}
        {limit && filteredCourses.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => router.push(viewAllHref)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              View All Courses →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default VideoCourses;