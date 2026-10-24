import { PlayCircle, BookOpen, GraduationCap, Award, FileText, Video, Users, TrendingUp, CheckCircle, Search } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// import img from '../../public/Yellow and Black Corporate Mining Industry Strategy Deck Presentation.png'

function Hero() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Background images for mining exam theme
const backgroundImages = [
  './local.png',
  './local1.png',
];


  // Mining exam features
  const examFeatures = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "10,000+ MCQs",
      description: "Practice questions for all mining exams"
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "HD Video Courses",
      description: "Expert lectures on mining subjects"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Study Materials",
      description: "Comprehensive PDFs & notes"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Mock Tests",
      description: "Exam pattern practice tests"
    }
  ];

  // Auto-scroll effect for background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[auto] py-10 md:py-14 flex items-center overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
          {/* Left Side - Text Content */}
          <div className="text-center md:text-left">
            <div className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm mb-4">
              🎯 India&apos;s #1 Mining Exam Platform
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
              Crack Your
              <span className="block text-yellow-400">Mining Exam</span>
            </h1>
            <p className="text-base md:text-lg text-gray-200 mb-4">
              Master mining engineering with 10,000+ MCQs, comprehensive video courses, and expert study materials. Prepare for Coal India, DGMS, and other mining exams.
            </p>

            <form onSubmit={handleSearch} className="mb-4 max-w-xl mx-auto md:mx-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, videos, materials..."
                  className="w-full pl-12 pr-28 py-4 rounded-xl bg-white/95 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => router.push('/navlinkmcq')}
                className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <PlayCircle className="h-5 w-5" />
                <span>Start Learning Free</span>
              </button>
              <button
                onClick={() => router.push('/navlinkvideo')}
                className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Explore Courses
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 mt-4 justify-center md:justify-start">
              <div className="flex items-center space-x-2 text-white">
                <CheckCircle className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">Free MCQs</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <CheckCircle className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">HD Videos</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <CheckCircle className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">Expert Faculty</span>
              </div>
            </div>
          </div>

        {/* Right Side - Single Image */}
<div className="hidden md:flex items-center justify-center">
    <img
      src="/WhatsApp_Image_2025-10-23_at_5.48.49_PM-removebg-preview.png"
      alt="Feature Image"
      className="max-h-[420px] w-auto object-contain rounded-xl"
    />
</div>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 md:p-4 border border-white/20 text-center hover:bg-white/20 hover:border-yellow-400/50 transform hover:scale-105 transition-all">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">10k+</div>
            <div className="text-gray-200 font-medium">MCQ Questions</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 md:p-4 border border-white/20 text-center hover:bg-white/20 hover:border-yellow-400/50 transform hover:scale-105 transition-all">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">500+</div>
            <div className="text-gray-200 font-medium">Video Lectures</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 md:p-4 border border-white/20 text-center hover:bg-white/20 hover:border-yellow-400/50 transform hover:scale-105 transition-all">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">50k+</div>
            <div className="text-gray-200 font-medium">Students</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 md:p-4 border border-white/20 text-center hover:bg-white/20 hover:border-yellow-400/50 transform hover:scale-105 transition-all">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">95%</div>
            <div className="text-gray-200 font-medium">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-yellow-400'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Animated Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-40 right-10 w-32 h-32 bg-yellow-400/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
    </section>
  )
}

export default Hero