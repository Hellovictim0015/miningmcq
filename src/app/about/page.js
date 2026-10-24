import React from 'react';
import { Target, Eye, Award, Users, BookOpen, TrendingUp, CheckCircle, Sparkles, GraduationCap, Zap, Heart, Shield } from 'lucide-react';

export const metadata = {
  title: "About Us",
  description:
    "Learn about Mining Shiksha's mission to deliver quality DGMS and mining statutory exam preparation through MCQ tests, video courses and study materials.",
  alternates: {
    canonical: "/about",
  },
};

function AboutPage() {
  const stats = [
    { number: '10,000+', label: 'Students Enrolled', icon: Users },
    { number: '50+', label: 'Expert Courses', icon: BookOpen },
    { number: '95%', label: 'Success Rate', icon: TrendingUp },
    { number: '4.8/5', label: 'Average Rating', icon: Award }
  ];

  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for excellence in every course, ensuring top-quality education for mining professionals.'
    },
    {
      icon: Heart,
      title: 'Student Success',
      description: 'Your success is our priority. We provide comprehensive support throughout your learning journey.'
    },
    {
      icon: Shield,
      title: 'Industry Standards',
      description: 'Our courses meet and exceed industry standards, preparing you for real-world challenges.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We continuously update our content with the latest mining technologies and best practices.'
    }
  ];

  const features = [
    'Expert-created video courses',
    'Comprehensive study materials',
    'Real-world case studies',
    'Industry-recognized certifications',
    'Flexible learning schedules',
    'Lifetime course access',
    'Interactive assessments',
    'Career guidance support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 text-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-4">
            <GraduationCap className="h-16 w-16 text-gray-900 animate-bounce" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">About Mining Shiksha</h1>
          <p className="text-xl md:text-2xl text-gray-800 max-w-3xl mx-auto font-medium">
            Empowering Mining Professionals with World-Class Education and Training
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:scale-105 transition-all border-2 border-yellow-200">
                <Icon className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 shadow-2xl border-2 border-yellow-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10">
              <Target className="h-12 w-12 text-gray-900 mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-800 text-lg leading-relaxed">
                To provide accessible, high-quality education and training to mining professionals worldwide, 
                helping them advance their careers and contribute to a safer, more efficient mining industry.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-yellow-200">
            <Eye className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              To become the leading online learning platform for mining education, recognized globally for 
              excellence in course content, innovative teaching methods, and outstanding student success rates.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-yellow-200">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-10 w-10 text-yellow-500" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-6">Our Story</h2>
          <div className="max-w-4xl mx-auto space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Mining Shiksha was founded with a simple yet powerful vision: to make quality mining education 
              accessible to professionals across India and beyond. We recognized the growing need for 
              specialized training in the mining sector and the challenges faced by working professionals 
              in accessing traditional education.
            </p>
            <p>
              Our platform brings together industry experts, experienced educators, and cutting-edge technology 
              to deliver comprehensive courses that are both practical and theoretical. We understand the unique 
              demands of the mining industry and have designed our curriculum to meet those specific needs.
            </p>
            <p>
              Today, we serve thousands of students across the country, from aspiring mining engineers to 
              seasoned professionals looking to upskill. Our commitment to quality, accessibility, and 
              student success remains unwavering as we continue to grow and evolve.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
          <p className="text-xl text-gray-600">The principles that guide everything we do</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-yellow-200">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <Icon className="h-7 w-7 text-gray-900" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* What We Offer Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-2xl p-8 md:p-12 shadow-2xl border-2 border-yellow-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-8">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white/90 rounded-lg p-4 hover:bg-white transition-all">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Mining Shiksha?</h2>
          <p className="text-xl text-gray-600">We&apos;re committed to your success</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-200">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Instructors</h3>
            <p className="text-gray-600">Learn from industry veterans with decades of real-world mining experience.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-200">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Career Support</h3>
            <p className="text-gray-600">Get guidance on career advancement and job opportunities in the mining sector.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-200">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Always Updated</h3>
            <p className="text-gray-600">Course content regularly updated to reflect the latest industry standards and practices.</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-2xl p-12 text-center shadow-2xl border-2 border-yellow-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
              Join thousands of mining professionals who have transformed their careers with Mining Shiksha
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 hover:shadow-xl transform hover:scale-105 transition-all">
                Browse Courses
              </button>
              <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all border-2 border-gray-900">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;