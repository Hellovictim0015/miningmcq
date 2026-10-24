"use client";;
import { useState } from 'react';

export default function TestPage() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [tests] = useState([
    {
      id: 1,
      name: "JavaScript Fundamentals",
      description: "Test your knowledge of basic JavaScript concepts",
      duration: "30 minutes",
      questions: 25
    },
    {
      id: 2,
      name: "React Components",
      description: "Assessment of React component creation and lifecycle",
      duration: "45 minutes",
      questions: 30
    },
    {
      id: 3,
      name: "CSS Styling",
      description: "Evaluate your CSS and responsive design skills",
      duration: "20 minutes",
      questions: 20
    },
    {
      id: 4,
      name: "Node.js Backend",
      description: "Server-side JavaScript and API development",
      duration: "50 minutes",
      questions: 35
    },
    {
      id: 5,
      name: "Database Operations",
      description: "SQL queries and database management",
      duration: "40 minutes",
      questions: 28
    }
  ]);

  const handleStartTest = (testId, testName) => {
    alert(`Starting test: ${testName}`);
    // Here you would typically navigate to the test or call an API
    console.log(`Starting test with ID: ${testId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Available Tests
          </h1>
          <p className="text-gray-600 text-lg">
            Choose a test to begin your assessment
          </p>
        </div>

        {/* View Toggle Options */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-1 border border-gray-200">
            <div className="flex space-x-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center w-12 h-10 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center w-12 h-10 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {tests.map((test) => (
            <div
              key={test.id}
              className={`bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                viewMode === 'grid' 
                  ? 'p-6' 
                  : 'p-4 flex items-center justify-between'
              }`}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mr-3"></div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {test.name}
                      </h2>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {test.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <span className="text-indigo-500 mr-1">⏱️</span>
                        <span>{test.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-purple-500 mr-1">❓</span>
                        <span>{test.questions} questions</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStartTest(test.id, test.name)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md"
                  >
                    Start Test →
                  </button>
                </>
              ) : (
                // List View
                <>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mr-3"></div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {test.name}
                      </h2>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {test.description}
                    </p>
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <span className="text-indigo-500 mr-1">⏱️</span>
                        {test.duration}
                      </span>
                      <span className="flex items-center">
                        <span className="text-purple-500 mr-1">❓</span>
                        {test.questions} questions
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStartTest(test.id, test.name)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md ml-4"
                  >
                    Start →
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Test Instructions
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-600 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Make sure you have a stable internet connection</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Each test has a time limit that will be enforced</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>You cannot pause once the test begins</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Results will be available immediately after completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}