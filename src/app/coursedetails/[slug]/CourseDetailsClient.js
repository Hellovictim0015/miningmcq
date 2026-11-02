"use client";
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Star, 
  Clock, 
  Users, 
  Award, 
  Download, 
  Share2, 
  Heart, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  PlayCircle,
  FileText,
  Code,
  MessageCircle,
  Globe,
  Calendar,
  Shield,
  Smartphone,
  Trophy,
  Target,
  Brain,
  BarChart3,
  PenTool,
  HelpCircle,
  ClipboardCheck,
  Timer,
  Loader,
  CreditCard,
  Lock,
  X,
  Loader2
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { getCheckoutPrefill } from '../../lib/checkoutPrefill';

export default function MCQCourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModule, setExpandedModule] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Payment-related state
  const [isPurchased, setIsPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
 const [userid, setUserId] = useState(null);


    useEffect(() => {
    // Get token from localStorage when component mounts
    const savedToken = localStorage.getItem("authid");
    if (savedToken) {
      setUserId(savedToken);
      console.log("User id to token:", savedToken);
    }
  }, []);


  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Fetch course data from API
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/get-mcq-course/${slug}`);
        const result = await response.json();
        
        if (result.success) {
          setCourseData(result.data);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Failed to fetch course data');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  // Check course purchase status - FIXED: Changed 'course' to 'courseData'
  useEffect(() => {
    if (!courseData) return;

    const checkPurchaseStatus = async () => {
      setCheckingPurchase(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsPurchased(false);
        setCheckingPurchase(false);
        return;
      }
      try {
        const unlockRes = await fetch('/api/payment/unlock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            course_id: courseData.id,
            product_type: 'mcq_course'
          })
        });

        if (unlockRes.ok) {
          const unlockData = await unlockRes.json();
          console.log('Unlock check response:', unlockData.unlock);
          
          // Handle various possible response structures from unlock endpoint
          if (unlockData.unlock === true || 
              unlockData.isPurchased === true || 
              unlockData.unlocked === true ||
              unlockData.message === 'Course already unlocked' ||
              unlockData.status === 'unlocked') {
            setIsPurchased(true);
          } else {
            setIsPurchased(false);
          }
        } else {
          // If unlock endpoint also fails, default to not purchased
          console.log('Unlock endpoint failed with status:', unlockRes.status);
          setIsPurchased(false);
        }
      } catch (err) {
        console.error('Error checking purchase status:', err);
        setIsPurchased(false);
      } finally {
        setCheckingPurchase(false);
      }
    };

    checkPurchaseStatus();
  }, [courseData]); // FIXED: This dependency was correct

  // Handle payment enrollment
  const handleEnrollment = async () => {
    setPaymentLoading(true);

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please log in to enroll in this course.');
      setPaymentLoading(false);
      return;
    }

    try {
      // Load Razorpay script first
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

      // Transform API data to match component structure
      const course = getCourseFromApi(courseData);

      // Step 1: Create order (amount is looked up server-side from course_id)
      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: course.id,
          product_type: "mcq_course"
        })
      });

      if (!orderRes.ok) {
        throw new Error(`Order creation failed: ${orderRes.status}`);
      }
      
      const orderData = await orderRes.json();
      const order = orderData.order || orderData;
      if (!order) {
        throw new Error("Order creation failed - no order returned");
      }

      // Step 2: Open Razorpay checkout
      const prefill = await getCheckoutPrefill(token);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "EduPlatform",
        description: course.title,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Step 3: Verify payment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              })
            });
            
            if (!verifyRes.ok) {
              throw new Error(`Payment verification failed: ${verifyRes.status}`);
            }
            
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setIsPurchased(true);
              alert("🎉 Payment successful! MCQ Course unlocked. You can now access all tests and study materials.");
            } else {
              throw new Error(verifyData.message || "Payment verification failed");
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            alert("Payment received but we could not confirm it yet. Please wait a minute and use \"Refresh Purchase Status\" or reload the page; contact support if it is still locked.");
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
          }
        },
        prefill,
        theme: {
          color: "#6366F1"
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setPaymentLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Enrollment error:", error);
      alert(`Something went wrong: ${error.message}`);
      setPaymentLoading(false);
    }
  };

  // Handle test access
  const handleStartTest = () => {
    if (isPurchased) {
      router.push(`/tests/${courseData.id}`);
    } else {
      alert('Please purchase the course to access all tests and study materials.');
    }
  };

  // Manual refresh function to check purchase status again
  const refreshPurchaseStatus = async () => {
    if (!courseData) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    setCheckingPurchase(true);
    try {
      const res = await fetch('/api/payment/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: courseData.id,
          product_type: 'mcq_course'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setIsPurchased(data.unlock === true);
      }
    } catch (err) {
      console.error('Error refreshing purchase status:', err);
    } finally {
      setCheckingPurchase(false);
    }
  };

  // Transform API data to match component structure
  const getCourseFromApi = (apiData) => {
    if (!apiData) return null;

    return {
      id: apiData.id,
      title: apiData.course_name,
      subtitle: apiData.description || "Master concepts through comprehensive MCQ tests with detailed explanations and study materials",
      instructor: {
        name: "Expert Instructor",
        title: "Subject Matter Expert",
        avatar: "bg-gradient-to-br from-blue-400 to-blue-600",
        rating: 4.9,
        students: "15,000+",
        courses: 5,
        experience: "10+ years in education and training"
      },
      price: apiData.course_price,
      originalPrice: Math.round(apiData.course_price * 1.5),
      discount: Math.round(((apiData.course_price * 1.5 - apiData.course_price) / (apiData.course_price * 1.5)) * 100),
      rating: 4.8,
      reviews: 1250,
      students: 5000,
      duration: `${apiData.duration} hours`,
      totalTests: courseData.totaltest,
      totalQuestions: 750,
      level: "Beginner to Advanced",
      language: apiData.language,
      certificate: true,
      lastUpdated: "February 2024",
      thumbnail: apiData.img_url ? `url(${apiData.img_url})` : "bg-gradient-to-br from-indigo-500 to-purple-600",
      previewVideo: "Available",
      features: [
        "comprehensive MCQ tests",
        " carefully crafted questions", 
        "Detailed explanations for each answer",
        "Downloadable PDF study guides",
        "Performance analytics dashboard",
        "Certificate of completion",
        "Lifetime access to all tests",
        "Mobile-friendly test interface",
        "Timed and practice modes",
        "All India ranking system"
      ],
      whatYouLearn: [
        `Master ${apiData.course_name} fundamentals through targeted MCQs`,
        "Test knowledge of advanced concepts and applications", 
        "Practice problem-solving techniques",
        "Assess understanding of core principles",
        "Evaluate theoretical and practical knowledge",
        "Identify strengths and weaknesses in subject areas",
        "Prepare for competitive exams and certifications",
        "Build confidence through progressive difficulty levels"
      ],
      requirements: [
        "Basic understanding of the subject matter",
        "Interest in learning and improving skills",
        "Computer or mobile device with internet access",
        "Commitment to regular practice and learning",
        "No prior testing experience needed"
      ]
    };
  };

  // Sample test series data
  const sampleTestSeries = [
    {
      id: 1,
      title: "Fundamentals & Basic Concepts",
      difficulty: "Beginner",
      questions: 50,
      duration: "45 minutes",
      topics: [
        "Core Concepts",
        "Basic Principles", 
        "Foundation Topics",
        "Essential Knowledge",
        "Key Definitions"
      ],
      pdfGuide: "Fundamentals-Study-Guide.pdf",
      completed: false
    },
    {
      id: 2,
      title: "Intermediate Level Assessment",
      difficulty: "Intermediate",
      questions: 60,
      duration: "50 minutes",
      topics: [
        "Advanced Concepts",
        "Practical Applications",
        "Problem Solving",
        "Case Studies",
        "Real-world Scenarios"
      ],
      pdfGuide: "Intermediate-Study-Guide.pdf",
      completed: false
    },
    {
      id: 3,
      title: "Advanced Topics & Applications",
      difficulty: "Advanced",
      questions: 75,
      duration: "60 minutes",
      topics: [
        "Expert Level Topics",
        "Complex Applications",
        "Advanced Problem Solving",
        "Professional Practice",
        "Industry Standards"
      ],
      pdfGuide: "Advanced-Study-Guide.pdf",
      completed: false
    },
    {
      id: 4,
      title: "Comprehensive Mock Test 1",
      difficulty: "Mixed",
      questions: 100,
      duration: "90 minutes",
      topics: [
        "All Topics Combined",
        "Mixed Difficulty",
        "Exam Simulation",
        "Time Management",
        "Performance Analysis"
      ],
      pdfGuide: "Mock-Test-1-Guide.pdf",
      completed: false
    },
    {
      id: 5,
      title: "Final Assessment Test",
      difficulty: "Advanced",
      questions: 80,
      duration: "75 minutes",
      topics: [
        "Complete Syllabus",
        "Final Evaluation",
        "Certification Prep",
        "Expert Assessment",
        "Career Readiness"
      ],
      pdfGuide: "Final-Assessment-Guide.pdf",
      completed: false
    }
  ];

  const sampleReviews = [
    {
      id: 1,
      name: "Priya Sharma",
      rating: 5,
      date: "1 week ago",
      comment: "Excellent MCQ collection! The explanations are detailed and really help understand the concepts. The study materials are comprehensive and perfect for revision.",
      helpful: 67,
      avatar: "bg-gradient-to-br from-green-400 to-green-600"
    },
    {
      id: 2,
      name: "Rahul Gupta",
      rating: 5,
      date: "2 weeks ago", 
      comment: "Best test series I ve found for this subject. The progressive difficulty and variety of questions make it perfect for exam preparation. Highly recommended!",
      helpful: 52,
      avatar: "bg-gradient-to-br from-purple-400 to-purple-600"
    },
    {
      id: 3,
      name: "Sneha Patel",
      rating: 4,
      date: "1 month ago",
      comment: "Great course structure and well-organized tests. The performance analytics help track progress effectively. Very helpful for competitive exam preparation.",
      helpful: 38,
      avatar: "bg-gradient-to-br from-orange-400 to-orange-600"
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tests', label: 'Test Series' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: 'Reviews' }
  ];

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'mixed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
            <p className="text-lg font-semibold">{error || 'Course not found'}</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const course = getCourseFromApi(courseData);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment Loading Overlay */}
      {paymentLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-gray-700 font-medium">Processing payment...</p>
            <p className="text-sm text-gray-500 mt-1">Please don&apos;t close this window</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  MCQ Test Series
                </span>
                {isPurchased && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium ml-2">
                    ✓ Purchased
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-300 mb-6">
                {course.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(course.rating)}
                  </div>
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-300">({course.reviews.toLocaleString()} reviews)</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Users className="h-5 w-5" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>

                <div className="flex items-center space-x-1">
                  <HelpCircle className="h-5 w-5" />
                  <span>{course.totalQuestions}+ questions</span>
                </div>

                <div className="flex items-center space-x-1">
                  <ClipboardCheck className="h-5 w-5" />
                  <span>{course.totalTests} tests</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${course.instructor.avatar} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-semibold">
                      {course.instructor.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{course.instructor.name}</p>
                    <p className="text-gray-300 text-sm">{course.instructor.title}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Globe className="h-4 w-4" />
                <span>{course.language}</span>
                <span>•</span>
                <Calendar className="h-4 w-4" />
                <span>Last updated {course.lastUpdated}</span>
                <span>•</span>
                <Timer className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
            </div>

            {/* Course Preview */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden sticky top-4">
                {/* Preview */}
                <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: course.thumbnail.startsWith('url(') ? course.thumbnail : undefined }}>
                  {!course.thumbnail.startsWith('url(') && (
                    <div className={`h-full ${course.thumbnail} flex items-center justify-center relative`}>
                      <div className="absolute inset-0 bg-black/30"></div>
                      <div className="z-10 text-center text-white">
                        <HelpCircle className="h-16 w-16 mx-auto mb-2" />
                        <p className="text-lg font-semibold">{course.totalTests} MCQ Tests</p>
                        {/* <p className="text-sm opacity-90">{course.totalQuestions}+ Questions</p>   */}
                      </div>
                    </div>
                  )}
                  {course.thumbnail.startsWith('url(') && (
                    <>
                      <div className="absolute inset-0 bg-black/30"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <HelpCircle className="h-16 w-16 mx-auto mb-2" />
                          <p className="text-lg font-semibold">{course.totalTests} MCQ Tests</p>
                          {/* <p className="text-sm opacity-90">{course.totalQuestions}+ Questions</p> */}
                        </div>
                      </div>
                    </>
                  )}
                  {!isPurchased && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Premium
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Price */}
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl font-bold text-gray-800">₹{course.price}</span>
                    <span className="text-lg text-gray-400 line-through">₹{course.originalPrice}</span>
                    <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full font-medium">
                      {course.discount}% OFF
                    </span>
                  </div>

                  {checkingPurchase ? (
                    <div className="text-center py-4 mb-6">
                      <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Checking purchase status...</p>
                    </div>
                  ) : isPurchased ? (
                    <div className="space-y-3 mb-6">
                      <div className="bg-green-100 text-green-800 px-4 py-3 rounded-xl flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="font-medium">Course Purchased Successfully!</span>
                      </div>
                      <button
                        onClick={handleStartTest}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                      >
                        <Play className="h-5 w-5" />
                        <span>Access All Tests</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6">
                      <button
                        onClick={handleEnrollment}
                        disabled={paymentLoading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5" />
                        <span>Enroll Now</span>

                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => alert('Please purchase the course to access all features.')}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Preview Tests
                      </button>
                      <button
                        onClick={refreshPurchaseStatus}
                        disabled={checkingPurchase}
                        className="w-full text-sm text-indigo-600 hover:text-indigo-700 py-2 transition-colors disabled:opacity-50"
                      >
                        {checkingPurchase ? 'Checking...' : 'Refresh Purchase Status'}
                      </button>
                      <div className="text-xs text-gray-500 text-center">
                        🔒 Secure payment powered by Razorpay
                      </div>
                    </div>
                  )}

                  {/* Course Includes */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">This course includes:</h4>
                    <div className="space-y-2">
                      {course.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Share & Wishlist */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                    <button 
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`flex items-center space-x-2 ${isWishlisted ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                      <span>Wishlist</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="md:col-span-2">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-medium whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* What You'll Learn */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">What you ll master</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {course.whatYouLearn.map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <Target className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Prerequisites</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((req, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Course Features */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Course Features</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {course.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-indigo-500" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Test Series Tab */}
                {activeTab === 'tests' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">Complete Test Series</h3>
                      <div className="text-sm text-gray-600">
                        {course.totalTests} tests • {course.totalQuestions}+ questions
                      </div>
                    </div>

                    <div className="space-y-4">
                      {sampleTestSeries.map((test) => (
                        <div key={test.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-800">{test.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                                  {test.difficulty}
                                </span>
                                {!isPurchased && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Premium
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                                <div className="flex items-center space-x-1">
                                  <HelpCircle className="h-4 w-4" />
                                  <span>{test.questions} questions</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{test.duration}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={isPurchased ? () => router.push(`/test/${test.id}`) : () => alert('Please purchase the course to access this test.')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                  isPurchased 
                                    ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={!isPurchased}
                              >
                                <Play className="h-4 w-4" />
                                <span>{isPurchased ? 'Start Test' : 'Locked'}</span>
                              </button>
                              <button 
                                onClick={isPurchased ? () => window.open(`/pdfs/${test.pdfGuide}`, '_blank') : () => alert('Please purchase the course to access study materials.')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                  isPurchased 
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!isPurchased}
                              >
                                <Download className="h-4 w-4" />
                                <span>PDF Guide</span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3">
                            <p className="text-sm text-gray-600 mb-2">Topics Covered:</p>
                            <div className="flex flex-wrap gap-2">
                              {test.topics.map((topic, index) => (
                                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructor Tab */}
                {activeTab === 'instructor' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">About Your Instructor</h3>
                    
                    <div className="flex items-start space-x-6 mb-6">
                      <div className={`w-24 h-24 ${course.instructor.avatar} rounded-full flex items-center justify-center text-2xl font-bold text-white`}>
                        {course.instructor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-800 mb-2">{course.instructor.name}</h4>
                        <p className="text-gray-600 mb-4">{course.instructor.title}</p>
                        <p className="text-gray-700 mb-4">{course.instructor.experience}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600">{course.instructor.rating}</div>
                            <div className="text-sm text-gray-600">Instructor Rating</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600">{course.reviews.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Reviews</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600">{course.instructor.students}</div>
                            <div className="text-sm text-gray-600">Students</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600">{course.instructor.courses}</div>
                            <div className="text-sm text-gray-600">Courses</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">Student Reviews</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {renderStars(course.rating)}
                        </div>
                        <span className="font-semibold">{course.rating}</span>
                        <span className="text-gray-600">({course.reviews.toLocaleString()} reviews)</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {sampleReviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 ${review.avatar} rounded-full flex items-center justify-center text-white font-semibold`}>
                              {review.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-gray-800">{review.name}</h4>
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                              <p className="text-gray-700 mb-3">{review.comment}</p>
                              <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700">
                                <span>Helpful ({review.helpful})</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="space-y-6">
              {/* Test Statistics */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Test Statistics</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Tests</span>
                    <span className="font-medium">{course.totalTests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Questions</span>
                    <span className="font-medium">{course.totalQuestions}+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Skill Level</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Language</span>
                    <span className="font-medium">{course.language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Students Enrolled</span>
                    <span className="font-medium">{course.students.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Test Features */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Test Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-gray-700">Detailed explanations for each answer</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-700">Performance analytics dashboard</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Timer className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-gray-700">Timed and practice modes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Download className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">Downloadable PDF study guides</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-700">All India ranking system</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm text-gray-700">Mobile-friendly interface</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Our Guarantees</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-700">Lifetime access to all tests</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-gray-700">Certificate of completion</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-gray-700">Direct instructor support</span>
                  </div>
                </div>
              </div>

              {/* Download All PDFs */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
                <div className="text-center">
                  <Download className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Complete Study Package</h4>
                  <p className="text-sm text-gray-600 mb-4">Get all PDF study guides covering every topic</p>
                  <button 
                    onClick={isPurchased ? () => window.open('/pdfs/complete-study-package.zip', '_blank') : () => alert('Please purchase the course to access study materials.')}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                      isPurchased 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!isPurchased}
                  >
                    {isPurchased ? 'Download All PDFs' : 'Purchase Required'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    {/* Sticky Bottom Bar */}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9999]">
  <div className="max-w-7xl mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      
      {/* Course Info */}
      <div className="flex items-center space-x-4">
        <div 
          className="relative w-16 h-12 bg-cover bg-center rounded-lg flex items-center justify-center overflow-hidden" 
          style={{ backgroundImage: course.thumbnail.startsWith('url(') ? course.thumbnail : undefined }}
        >
          {!course.thumbnail.startsWith('url(') && (
            <div className={`w-full h-full ${course.thumbnail} rounded-lg flex items-center justify-center`}>
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
          )}
          {course.thumbnail.startsWith('url(') && (
            <>
              <div className="absolute inset-0 bg-black/30 rounded-lg pointer-events-none"></div>
              <HelpCircle className="h-6 w-6 text-white relative z-10" />
            </>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg leading-tight">{course.title}</h3>
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium">{course.rating}</span>
            </div>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{course.totalTests} tests</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{course.totalQuestions}+ questions</span>
            {isPurchased && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-green-600 font-medium">✓ Purchased</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Price and Actions */}
      <div className="flex items-center space-x-4">
        {!isPurchased && (
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">₹{course.price}</span>
              <span className="text-lg text-gray-400 line-through">₹{course.originalPrice}</span>
            </div>
            <div className="text-sm text-green-600 font-medium">{course.discount}% OFF - Limited Time</div>
          </div>
        )}

        <div className="flex space-x-3">
          {/* Wishlist */}
          <button 
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-3 rounded-lg border transition-colors ${
              isWishlisted 
                ? 'bg-red-50 border-red-200 text-red-600' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          
          {/* Add to Cart */}
          {!isPurchased && (
            <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
              Add to Cart
            </button>
          )}
          
          {/* Main CTA */}
          <button 
            onClick={!paymentLoading ? (isPurchased ? handleStartTest : handleEnrollment) : undefined}
            className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 disabled:opacity-50 ${
              isPurchased 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:scale-105'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {paymentLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isPurchased ? (
              <>
                <Play className="h-5 w-5" />
                <span>Start Testing</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Enroll Now</span>
              </>
            )}
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Bottom Padding for Sticky Bar */}
      <div className="h-20"></div>
    </div>
  );
}