'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  PlayCircle,
  Clock,
  Video,
  Star,
  ArrowLeft,
  Loader2,
  Users,
  Award,
  BookOpen,
  Shield,
  CheckCircle,
  X,
  CreditCard,
  Lock
} from 'lucide-react';

export default function CourseDetails() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
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

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

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

  useEffect(() => {
    if (!slug) return;

    const fetchCourse = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/get-course_video/${slug}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const result = await res.json();
        if (result.success && result.data) {
          setCourse(result.data);
          console.log('Course data:', result.data);
        } else {
          throw new Error(result.message || 'Course not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  // Check course purchase status on page load/reload
  useEffect(() => {
    if (!course) return;

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
            course_id: course.id,
            product_type: 'video_course'
          })
        });

        console.log('Unlock API status:', unlockRes.status);

        if (unlockRes.ok) {
          const unlockData = await unlockRes.json();
          console.log('Unlock API response:', unlockData);

          // Check multiple possible response structures
          const isUnlocked =
            unlockData === true || // Direct boolean true
            unlockData.unlock === true || // {unlock: true} - YOUR API FORMAT
            unlockData.success === true ||
            unlockData.isPurchased === true ||
            unlockData.unlocked === true ||
            unlockData.status === 'unlocked' ||
            unlockData.message === 'Course already unlocked' ||
            unlockData.purchased === true;

          console.log('Is course unlocked?', isUnlocked);
          setIsPurchased(isUnlocked);
        } else {
          console.log('Unlock API failed with status:', unlockRes.status);
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
  }, [course]);

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
        setPaymentLoading(false);
        return;
      }

      // Step 1: Create order (amount is looked up server-side from course_id)
      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: course.id,
          product_type: "video_course"
        })
      });

      if (!orderRes.ok) {
        throw new Error(`Order creation failed: ${orderRes.status}`);
      }

      const orderData = await orderRes.json();
      const order = orderData.order || orderData;
      if (!order || !order.id) {
        throw new Error("Order creation failed - no order ID returned");
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "EduPlatform",
        description: course.course_name,
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
            console.log('Payment verification response:', verifyData);

            if (verifyData.success) {
              // Payment verified successfully, update the UI immediately
              setIsPurchased(true);
              alert("🎉 Payment successful! Course unlocked. You can now access the full video content.");
            } else {
              throw new Error(verifyData.message || "Payment verification failed");
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            alert("Payment verification failed. Please contact support if payment was deducted.");
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#EF4444"
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

  const handleVideoPlay = () => {
    if (isPurchased) {
      setShowVideo(true);
    } else {
      alert('Please purchase the course to watch the full video.');
    }
  };

  // Manual refresh function to check purchase status again
  const refreshPurchaseStatus = async () => {
    if (!course) return;

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
          course_id: course.id,
          product_type: 'video_course'
        })
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Refresh check response:', data);

        const isUnlocked =
          data === true ||
          data.unlock === true || // {unlock: true} - YOUR API FORMAT
          data.success === true ||
          data.isPurchased === true ||
          data.unlocked === true ||
          data.status === 'unlocked' ||
          data.message === 'Course already unlocked' ||
          data.purchased === true;

        setIsPurchased(isUnlocked);

        if (isUnlocked) {
          alert('✅ Course is unlocked! You can now watch the full video.');
        } else {
          alert('ℹ️ Course is still locked. Please complete the purchase.');
        }
      } else {
        alert('❌ Failed to check purchase status. Please try again.');
      }
    } catch (err) {
      console.error('Error refreshing purchase status:', err);
      alert('❌ Error checking purchase status. Please try again.');
    } finally {
      setCheckingPurchase(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <Loader2 className="h-12 w-12 text-red-500 animate-spin mb-4 mx-auto" />
          <p className="text-gray-600 font-medium">Loading course details...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md mx-auto">
          <p className="text-yellow-600 font-semibold">Course not found</p>
        </div>
      </section>
    );
  }

  const videoId = getYouTubeVideoId(course.video_url);
  const discountedPrice = Math.round(course.course_price / 0.6);
  const discountPercentage = Math.round((1 - course.course_price / discountedPrice) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Video Modal */}
      {showVideo && videoId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {course.course_name}
              </h3>
              <button
                onClick={() => setShowVideo(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&fs=1&showinfo=0`}
                title={course.course_name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

            </div>
          </div>
        </div>
      )}

      {/* Payment Loading Overlay */}
      {paymentLoading && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-red-500 animate-spin mb-3" />
            <p className="text-gray-700 font-medium">Processing payment...</p>
            <p className="text-sm text-gray-500 mt-1">Please don't close this window</p>
          </div>
        </div>
      )}

      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-red-500 mb-8 bg-white px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Preview */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                <div className="relative">
                  <img
                    src={course.img_url}
                    alt={course.course_name}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 cursor-pointer transition-all group"
                    onClick={handleVideoPlay}
                  >
                    <div className="text-center">
                      <PlayCircle className="h-16 w-16 text-white mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-white text-sm font-medium">
                        {isPurchased ? 'Watch Full Video' : 'Preview Available'}
                      </p>
                    </div>
                  </div>
                  {!isPurchased && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Lock className="h-4 w-4 mr-1" />
                      Premium
                    </div>
                  )}
                </div>
              </div>

              {/* Course Info */}
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                  {course.course_name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                  <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 mr-2" /> {course.duration}
                  </span>
                  <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <Video className="h-4 w-4 mr-2" /> {course.language}
                  </span>
                  <span className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" /> 4.8 Rating
                  </span>
                  <span className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                    <Users className="h-4 w-4 text-blue-500 mr-2" /> 1,234+ Students
                  </span>
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">About This Course</h3>
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>
              </div>

              {/* What You'll Learn */}
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  What You'll Learn
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Master the fundamentals and core concepts',
                    'Hands-on practical exercises and projects',
                    'Real-world case studies and examples',
                    'Industry best practices and techniques',
                    'Expert guidance and mentorship',
                    'Lifetime access to course content'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Purchase Card */}
              <div className="bg-white rounded-2xl p-6 shadow-xl sticky top-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <span className="text-3xl font-bold text-gray-800">
                      ₹{course.course_price.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{discountedPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium inline-block">
                    {discountPercentage}% OFF - Limited Time
                  </div>
                </div>

                {checkingPurchase ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Checking purchase status...</p>
                  </div>
                ) : isPurchased ? (
                  <div className="text-center space-y-3">
                    <div className="bg-green-100 text-green-800 px-4 py-3 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Course Purchased Successfully!</span>
                    </div>
                    <button
                      onClick={handleVideoPlay}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <PlayCircle className="h-5 w-5" />
                      <span>Watch Full Course</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleEnrollment}
                      disabled={paymentLoading}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          <span>Enroll Now - Pay Securely</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleVideoPlay}
                      className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <PlayCircle className="h-5 w-5" />
                      <span>Preview Video Course</span>
                    </button>
                    <button
                      onClick={refreshPurchaseStatus}
                      disabled={checkingPurchase}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 py-2 transition-colors disabled:opacity-50"
                    >
                      {checkingPurchase ? 'Checking...' : 'Refresh Purchase Status'}
                    </button>
                    <div className="text-xs text-gray-500 text-center">
                      🔒 Secure payment powered by Razorpay
                    </div>
                  </div>
                )}
              </div>

              {/* Course Features */}
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Features</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Language</span>
                    <span className="font-medium">{course.language}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Access</span>
                    <span className="font-medium text-green-600">Lifetime</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Certificate</span>
                    <span className="font-medium text-blue-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Support</span>
                    <span className="font-medium text-purple-600">24/7</span>
                  </div>
                </div>
              </div>

              {/* Money Back Guarantee */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center mb-3">
                  <Shield className="h-6 w-6 text-green-500 mr-2" />
                  <h3 className="font-semibold text-gray-800">30-Day Money Back Guarantee</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Not satisfied with the course? Get a full refund within 30 days, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}