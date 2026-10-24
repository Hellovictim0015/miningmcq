import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Mining Shiksha</span>
              </div>
              <p className="text-gray-400">India&apos;s trusted learning platform for DGMS, Mining Statutory & Competitive Exams.</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-gray-400 hover:text-white transition-colors">Home</Link>
                <Link href="/navlinkmcq" className="block text-gray-400 hover:text-white transition-colors">MCQ Courses</Link>
                <Link href="/navlinkvideo" className="block text-gray-400 hover:text-white transition-colors">Video Courses</Link>
                <Link href="/navlinkmaterials" className="block text-gray-400 hover:text-white transition-colors">Study Materials</Link>
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">About</Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacyandpolicy" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/termsandconditions" className="block text-gray-400 hover:text-white transition-colors">Terms and Conditions</Link>
                <Link href="/results" className="block text-gray-400 hover:text-white transition-colors">My Results</Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact</Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>Email: helpminingshiksha@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Mining Shiksha. All rights reserved.</p>
          </div>
        </div>
      </footer>
  )
}

export default Footer
