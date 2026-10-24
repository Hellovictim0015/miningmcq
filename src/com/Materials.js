"use client";
import { BookOpen, Download, FileText, Video, Users, Star, Menu, X, Search, PlayCircle, Lock, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Materials({ limit, viewAllHref = '/navlinkmaterials', category }) {
  const router = useRouter();
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedMaterials, setPurchasedMaterials] = useState(new Set());
  const [checkingPurchases, setCheckingPurchases] = useState(new Set());
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [downloadingMaterial, setDownloadingMaterial] = useState(null);
  const [userid, setUserId] = useState(null);

  const filteredMaterials = studyMaterials;

  // Load user ID first (only needed to check what's already purchased — browsing works without it)
  useEffect(() => {
    const savedToken = localStorage.getItem("authid");
    if (savedToken) {
      setUserId(savedToken);
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

  // Fetch study materials from API — browsing works for everyone, purchase status
  // is layered on top once we know who's logged in.
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const categoryParam = category ? `&category=${category}` : '';
        const res = await fetch(`/api/study-materials_getall?limit=${limit || 100}${categoryParam}`);
        const result = await res.json();
        const data = result.data || [];
        setStudyMaterials(data);

        if (userid && data.length > 0) {
          checkBulkPurchaseStatus(data.filter(material => parseFloat(material.price) > 0));
        }
      } catch (err) {
        console.error("❌ Error fetching study materials:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [userid, limit, category]);

  // Check purchase status for multiple materials
  const checkBulkPurchaseStatus = async (paidMaterials) => {
    if (!userid) {
      console.log("User ID not available yet");
      return;
    }

    const materialIds = paidMaterials.map(m => m.id);
    setCheckingPurchases(new Set(materialIds));
    
    try {
      const purchasePromises = paidMaterials.map(async (material) => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) return null;

          const res = await fetch('/api/payment/unlock', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              course_id: material.id,
              product_type: 'study_material'
            })
          });

          if (res.ok) {
            const data = await res.json();

            if (data.unlock === true) {
              return material.id;
            }
          }
        } catch (err) {
          console.error(`Error checking purchase for material ${material.id}:`, err);
        }
        return null;
      });

      const purchasedIds = (await Promise.all(purchasePromises)).filter(id => id !== null);
      console.log('Purchased material IDs:', purchasedIds);
      setPurchasedMaterials(new Set(purchasedIds));
    } catch (err) {
      console.error('Error checking bulk purchase status:', err);
    } finally {
      setCheckingPurchases(new Set());
    }
  };

  // Download PDF function
  const downloadPDF = async (pdfUrl, fileName) => {
    try {
      setDownloadingMaterial(fileName);
      
      const response = await fetch(pdfUrl);
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloadingMaterial(null);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF. Opening in new tab instead...');
      window.open(pdfUrl, '_blank');
      setDownloadingMaterial(null);
    }
  };

  // Handle material purchase
  const handlePurchase = async (material) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Please log in to purchase materials.");
      return;
    }

    setPaymentLoading(material.id);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        setPaymentLoading(null);
        return;
      }

      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: material.id,
          product_type: "study_material"
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

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Mining Exam Platform",
        description: material.title,
        order_id: order.id,
        handler: async function (response) {
          try {
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
              setPurchasedMaterials(prev => new Set([...prev, material.id]));
              alert("🎉 Payment successful! Study material unlocked. You can now download it.");
            } else {
              throw new Error(verifyData.message || "Payment verification failed");
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            alert("Payment verification failed. Please contact support if payment was deducted.");
          } finally {
            setPaymentLoading(null);
          }
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(null);
          }
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#EAB308"
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
        setPaymentLoading(null);
      });

      rzp.open();
    } catch (error) {
      console.error("Purchase error:", error);
      alert(`Something went wrong: ${error.message}`);
      setPaymentLoading(null);
    }
  };

  // Handle download/purchase action
  const handleAction = (material) => {
    const materialPrice = parseFloat(material.price);
    
    if (materialPrice === 0) {
      downloadPDF(material.pdf_url, material.title);
    } else if (purchasedMaterials.has(material.id)) {
      downloadPDF(material.pdf_url, material.title);
    } else {
      handlePurchase(material);
    }
  };

  // Check individual purchase status
  const refreshPurchaseStatus = async (materialId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Please log in to check purchase status.");
      return;
    }

    setCheckingPurchases(prev => new Set([...prev, materialId]));

    try {
      const res = await fetch('/api/payment/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: materialId,
          product_type: 'study_material'
        })
      });

      if (res.ok) {
        const data = await res.json();

        if (data.unlock === true) {
          setPurchasedMaterials(prev => new Set([...prev, materialId]));
          alert('✅ Material is unlocked! You can now download it.');
        } else {
          alert('ℹ️ Material is still locked. Please complete the purchase.');
        }
      } else {
        alert('❌ Failed to check purchase status. Please try again.');
      }
    } catch (err) {
      console.error('Error refreshing purchase status:', err);
      alert('❌ Error checking purchase status. Please try again.');
    } finally {
      setCheckingPurchases(prev => {
        const newSet = new Set(prev);
        newSet.delete(materialId);
        return newSet;
      });
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Study Materials</h2>
          <p className="text-xl text-gray-600">Download high-quality PDFs, notes, and video lectures for mining exams</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-yellow-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading materials...</p>
          </div>
        ) : (
          <>
            {/* Materials Grid */}
            {filteredMaterials.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMaterials.map((material) => {
                  const materialPrice = parseFloat(material.price);
                  const isPurchased = purchasedMaterials.has(material.id);
                  const isCheckingPurchase = checkingPurchases.has(material.id);
                  const isPaymentLoading = paymentLoading === material.id;
                  const isDownloading = downloadingMaterial === material.title;
                  const isFree = materialPrice === 0;

                  return (
                    <div
                      key={material.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all overflow-hidden group relative"
                    >
                      {(isPaymentLoading || isDownloading) && (
                        <div className="absolute inset-0 bg-white/90 z-20 flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-6 w-6 text-yellow-500 animate-spin mx-auto mb-2" />
                            <p className="text-xs text-gray-600">
                              {isPaymentLoading ? 'Processing...' : 'Downloading...'}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="h-32 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
                        {material.type === "Video" ? (
                          <PlayCircle className="h-12 w-12 text-white z-10" />
                        ) : (
                          <FileText className="h-12 w-12 text-white z-10" />
                        )}
                        <div className="absolute top-2 right-2 bg-white/90 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">
                          {material.type || "PDF"}
                        </div>
                        
                        <div className="absolute top-2 left-2">
                          {isFree && (
                            <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                              FREE
                            </span>
                          )}
                          {!isFree && isPurchased && (
                            <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center">
                              <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                              PURCHASED
                            </span>
                          )}
                          {!isFree && !isPurchased && (
                            <span className="bg-yellow-600 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center">
                              <Lock className="h-2.5 w-2.5 mr-0.5" />
                              PREMIUM
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-yellow-600 font-medium">{material.subject}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{material.rating || "4.5"}</span>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                          {material.title}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>{material.pages ? `${material.pages} pages` : material.duration || "N/A"}</span>
                          <div className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{material.downloads || "0"}</span>
                          </div>
                        </div>

                        {!isFree && (
                          <div className="mb-3">
                            <div className="flex items-center space-x-1">
                              <span className="text-lg font-bold text-gray-800">₹{materialPrice.toFixed(2)}</span>
                              {material.originalPrice && parseFloat(material.originalPrice) > materialPrice && (
                                <>
                                  <span className="text-xs text-gray-400 line-through">₹{parseFloat(material.originalPrice).toFixed(2)}</span>
                                  <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                    {Math.round(((parseFloat(material.originalPrice) - materialPrice) / parseFloat(material.originalPrice)) * 100)}% OFF
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <button
                            onClick={() => handleAction(material)}
                            disabled={isPaymentLoading || isCheckingPurchase || isDownloading}
                            className={`w-full py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                              isFree
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-md transform hover:scale-105'
                                : isPurchased
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:shadow-md transform hover:scale-105'
                                : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-md transform hover:scale-105'
                            }`}
                          >
                            {isPaymentLoading ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : isDownloading ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Downloading...</span>
                              </>
                            ) : isCheckingPurchase ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Checking...</span>
                              </>
                            ) : isFree ? (
                              <>
                                <Download className="h-3.5 w-3.5" />
                                <span>Download Free</span>
                              </>
                            ) : isPurchased ? (
                              <>
                                <Download className="h-3.5 w-3.5" />
                                <span>Download Now</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-3.5 w-3.5" />
                                <span>Buy ₹{materialPrice.toFixed(2)}</span>
                              </>
                            )}
                          </button>

                          {!isFree && !isPurchased && (
                            <button
                              onClick={() => refreshPurchaseStatus(material.id)}
                              disabled={isCheckingPurchase}
                              className="w-full text-xs text-yellow-600 hover:text-yellow-700 py-1 transition-colors disabled:opacity-50"
                            >
                              {isCheckingPurchase ? 'Checking...' : 'Already purchased? Refresh'}
                            </button>
                          )}
                        </div>

                        {!isFree && !isPurchased && (
                          <div className="mt-2 text-xs text-gray-500 text-center">
                            🔒 Secure payment
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {studyMaterials.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No study materials available at the moment.</p>
          </div>
        )}

        {limit && filteredMaterials.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => router.push(viewAllHref)}
              className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-500 hover:shadow-lg transform hover:scale-105 transition-all"
            >
              View All Materials
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Materials;