"use client";
import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Replace this with your actual API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Thank you for contacting us! We will get back to you within 24 hours.'
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again or email us directly at helpminingshiksha@gmail.com'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 text-gray-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-4">
            <Sparkles className="h-12 w-12 text-yellow-900 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Contact Us</h1>
          <p className="text-xl text-gray-800">We&apos;re here to help! Reach out to us anytime.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-700 mb-6">
                Have a question or need assistance? Send us an email and our team will respond within 24 hours.
              </p>
            </div>

            {/* Email Support Card */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-6 border-2 border-yellow-300 hover:shadow-2xl transition-all transform hover:scale-105">
              <div className="flex items-start space-x-4">
                <div className="bg-white/90 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-gray-800 mb-3">Our support team is ready to help</p>
                  <a 
                    href="mailto:helpminingshiksha@gmail.com"
                    className="text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg font-semibold inline-flex items-center space-x-2 group transition-all"
                  >
                    <span>helpminingshiksha@gmail.com</span>
                    <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <p className="text-sm text-gray-800 mt-3 font-medium">⚡ Response time: Within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">💡</span>
                <span>Before You Contact Us</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  <span>Check our FAQ section for quick answers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  <span>Include order/course details for faster support</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  <span>Be as specific as possible about your issue</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  <span>Check your spam folder for our replies</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-yellow-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            
            {status.message && (
              <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                status.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-2 border-green-300' 
                  : 'bg-red-50 text-red-800 border-2 border-red-300'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 text-gray-900 py-3 rounded-lg font-bold hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-600 mt-4 text-center">
              By submitting this form, you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>

        {/* Quick Contact Banner */}
        <div className="mt-12 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-2xl p-8 text-gray-900 text-center shadow-2xl border-2 border-yellow-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative z-10">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">Need Immediate Assistance?</h3>
            <p className="text-gray-800 mb-4 font-medium">
              Email us directly for urgent queries
            </p>
            <a 
              href="mailto:helpminingshiksha@gmail.com"
              className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 hover:shadow-xl transform hover:scale-105 transition-all"
            >
              helpminingshiksha@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;