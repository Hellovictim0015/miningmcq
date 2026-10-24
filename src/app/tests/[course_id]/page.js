"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, Clock, Users, ArrowLeft, PlayCircle, Trophy, AlertCircle, Download, Lock } from "lucide-react";

export default function TestsPage() {
  const { course_id } = useParams();
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [downloadingTest, setDownloadingTest] = useState(null);
  const [userId, setUserId] = useState(null);
  const [testAttempts, setTestAttempts] = useState({});

  // Get user ID from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("authid");
    if (savedToken) {
      setUserId(savedToken);
      console.log("User id from token:", savedToken);
    }
  }, []);

  // Fetch tests
  useEffect(() => {
    if (!course_id) return;

    const fetchTests = async () => {
      try {
        const res = await fetch(`/api/tests/${course_id}`);
        const data = await res.json();

        if (data.success) {
          setTests(data.data);
          setCourseName(data.courseName || `Course ${course_id}`);
        } else {
          setError(data.message || "Failed to fetch tests");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [course_id]);

  // Check attempts for all tests
  useEffect(() => {
    if (!userId || tests.length === 0) return;

    const checkAllAttempts = async () => {
      const token = localStorage.getItem('authToken');
      const attemptPromises = tests.map(async (test) => {
        try {
          const response = await fetch('/api/check_attempt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              test_id: test.id
            })
          });
          
          const data = await response.json();
          
          return {
            testId: test.id,
            attempts: data.attempts || 0,
            maxReached: data.attempts >= 3
          };
        } catch (error) {
          console.error(`Failed to check attempts for test ${test.id}:`, error);
          return {
            testId: test.id,
            attempts: 0,
            maxReached: false
          };
        }
      });

      const results = await Promise.all(attemptPromises);
      
      const attemptsMap = {};
      results.forEach(result => {
        attemptsMap[result.testId] = result;
      });
      
      setTestAttempts(attemptsMap);
    };

    checkAllAttempts();
  }, [userId, tests]);

  const handleStartTest = (testId) => {
    router.push(`/mcq/${testId}`);
  };

  const handleDownloadTest = async (testId, testName) => {
    setDownloadingTest(testId);
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/get_all_mcq_by_test/${testId}`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : undefined,
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch test data");
      }

      const mcqData = data.data;
      
      let content = `${testName || `Test ${testId}`}\n`;
      content += `Course: ${courseName}\n`;
      content += `Generated on: ${new Date().toLocaleDateString()}\n`;
      content += `Total Questions: ${mcqData.length}\n`;
      content += `\n${"=".repeat(50)}\n\n`;

      mcqData.forEach((question, index) => {
        content += `Question ${index + 1}: ${question.question_text}\n`;
        
        if (question.question_image) {
          content += `[Image: ${question.question_image}]\n`;
        }
        
        content += `\nOptions:\n`;
        question.options.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          content += `${letter}. ${option.option_text}\n`;
          if (option.option_image) {
            content += `   [Image: ${option.option_image}]\n`;
          }
        });
        
        content += `\n${"-".repeat(30)}\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${testName || `Test_${testId}`}_MCQs.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to download test: ${error.message}`);
    } finally {
      setDownloadingTest(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Error</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{courseName}</h1>
              </div>
            </div>
            <div className="flex items-center bg-indigo-50 px-4 py-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-indigo-700 font-medium">{tests.length} Tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tests.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tests available</h3>
            <p className="text-gray-500 mb-6">There are no tests found for this course yet.</p>
            <button
              onClick={() => router.back()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Browse Other Courses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test, index) => {
              const attemptInfo = testAttempts[test.id];
              const isMaxAttempts = attemptInfo?.maxReached || false;
              const attemptCount = attemptInfo?.attempts || 0;

              return (
                <div
                  key={test.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {test.test_name || `Test ${index + 1}`}
                          </h3>
                        </div>
                        
                        {/* Attempt Counter */}
                        <div className="mt-2">
                          <span className={`text-sm font-medium ${
                            isMaxAttempts ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            Attempts: {attemptCount}/3
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {isMaxAttempts ? (
                          <div className="bg-gray-100 text-gray-600 font-medium py-2 px-4 rounded-md flex items-center">
                            <Lock className="h-4 w-4 mr-1" />
                            Max Attempts Reached
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartTest(test.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center"
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Start Test
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}