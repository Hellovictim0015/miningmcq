"use client";
import React from 'react';
import Materials from '@/com/Materials';
import AllMCQCoursesPage from '@/com/MCqCourses';
import VideoCourses from '@/com/VideoCourses';
import Hero from '@/com/Hero';
import CategoriesSection from '@/com/CategoriesSection';

export default function EducationHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <Hero />

      {/* Categories */}
      <CategoriesSection />

      {/* MCQ Courses preview */}
      <AllMCQCoursesPage limit={5} />

      {/* Video Courses preview */}
      <VideoCourses limit={5} />

      {/* Study Materials preview */}
      <Materials limit={5} />
    </div>
  );
}
