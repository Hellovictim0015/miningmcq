"use client";
import { useState, useEffect } from 'react';

export default function ShowResults() {
  const [token, setToken] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load auth token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch results once the token is available
  useEffect(() => {
    if (!token) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/showresults`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setResults(data.results);
          console.log("Fetched results:", data.results);
        } else {
          setError("Failed to fetch results");
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [token]);

  // Download Certificate Function
  const downloadCertificate = (result) => {
    // Only allow certificate download for passing scores (e.g., >= 50)
    if (result.score < 50) {
      alert("Certificate is only available for scores 50 and above.");
      return;
    }

    // Create certificate HTML
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 40px;
            font-family: 'Georgia', serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .certificate {
            width: 800px;
            padding: 60px;
            background: white;
            border: 20px solid #d4af37;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
          }
          .certificate h1 {
            font-size: 48px;
            color: #2c3e50;
            margin: 0 0 10px 0;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .certificate .subtitle {
            font-size: 20px;
            color: #7f8c8d;
            margin-bottom: 30px;
            font-style: italic;
          }
          .certificate .awarded {
            font-size: 18px;
            color: #34495e;
            margin-bottom: 20px;
          }
          .certificate .name {
            font-size: 36px;
            color: #2980b9;
            font-weight: bold;
            margin: 20px 0;
            border-bottom: 2px solid #d4af37;
            display: inline-block;
            padding: 10px 40px;
            text-transform: capitalize;
          }
          .certificate .achievement {
            font-size: 18px;
            color: #34495e;
            margin: 30px 0;
            line-height: 1.6;
          }
          .certificate .course-info {
            font-size: 16px;
            color: #555;
            margin: 15px 0;
            font-style: italic;
          }
          .certificate .score {
            font-size: 32px;
            color: #27ae60;
            font-weight: bold;
            margin: 20px 0;
          }
          .certificate .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
            display: flex;
            justify-content: space-around;
          }
          .certificate .signature {
            font-size: 14px;
            color: #7f8c8d;
          }
          .certificate .signature .line {
            border-top: 1px solid #34495e;
            margin-bottom: 5px;
            width: 200px;
          }
          .seal {
            width: 80px;
            height: 80px;
            border: 4px solid #d4af37;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: #d4af37;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>CERTIFICATE</h1>
          <p class="subtitle">of Achievement</p>
          
          <p class="awarded">This is to certify that</p>
          
          <div class="name">${result.username}</div>
          
          <p class="achievement">
            Has successfully completed <strong>${result.test_name}</strong><br>
            with outstanding performance
          </p>
          
          ${result.course_name ? `<p class="course-info">Course: ${result.course_name}</p>` : ''}
          
          <div class="seal">★ VERIFIED ★</div>
          
          <div class="score">Score: ${result.score}%</div>
          
          <p style="color: #7f8c8d; font-size: 14px;">
            Rank: #${result.rank} | Test ID: ${result.test_id}
          </p>
          
          <div class="footer">
            <div class="signature">
              <div class="line"></div>
              <div>Director</div>
            </div>
            <div class="signature">
              <div class="line"></div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate_${result.username}_${result.test_name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get badge color based on score
  const getBadgeColor = (score) => {
    if (score >= 90) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (score >= 75) return 'bg-gradient-to-r from-green-400 to-green-600';
    if (score >= 50) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    return 'bg-gradient-to-r from-gray-400 to-gray-600';
  };

  // Get performance label
  const getPerformanceLabel = (score) => {
    if (score >= 90) return { label: 'Excellent', icon: '🏆' };
    if (score >= 75) return { label: 'Good', icon: '🌟' };
    if (score >= 50) return { label: 'Pass', icon: '✓' };
    return { label: 'Needs Improvement', icon: '📚' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Your Test Results
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome, <span className="font-semibold text-purple-600">{results[0]?.username || 'User'}</span>
          </p>
          <div className="mt-4 inline-block bg-white rounded-full px-6 py-2 shadow-md">
            <span className="text-gray-600">Total Tests: </span>
            <span className="font-bold text-purple-600 text-xl">{results.length}</span>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Results Yet</h2>
            <p className="text-gray-500">Take your first test to see results here!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => {
              const performance = getPerformanceLabel(result.score);
              return (
                <div 
                  key={result.id}
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                >
                  {/* Card Header */}
                  <div className={`${getBadgeColor(result.score)} p-6 text-white`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm opacity-90 mb-1">Rank</div>
                        <div className="text-4xl font-bold">#{result.rank}</div>
                      </div>
                      <div className="text-4xl">{performance.icon}</div>
                    </div>
                    <div className="text-lg font-semibold">{performance.label}</div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">Test Name</div>
                      <div className="text-xl font-bold text-gray-800">{result.test_name}</div>
                    </div>

                    {result.course_name && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-1">Course</div>
                        <div className="text-md text-gray-700">{result.course_name}</div>
                      </div>
                    )}

                    <div className="mb-4 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-500">Test ID</div>
                        <div className="text-sm font-semibold text-gray-600">#{result.test_id}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Result ID</div>
                        <div className="text-sm font-semibold text-gray-600">#{result.id}</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-sm text-gray-500 mb-2">Score</div>
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl font-bold text-gray-800">{result.score}%</span>
                        </div>
                        <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
                          <div 
                            style={{ width: `${result.score}%` }}
                            className={`${getBadgeColor(result.score)} shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500`}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Download Certificate Button */}
                    <button
                      onClick={() => downloadCertificate(result)}
                      disabled={result.score < 50}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        result.score >= 50
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-xl">📜</span>
                      {result.score >= 50 ? 'Download Certificate' : 'Certificate Unavailable'}
                    </button>
                    {result.score < 50 && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Score must be 50% or higher
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {results.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Performance Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {Math.max(...results.map(r => r.score))}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Highest Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {results.filter(r => r.score >= 50).length}
                </div>
                <div className="text-sm text-gray-500 mt-1">Tests Passed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {results.filter(r => r.score >= 90).length}
                </div>
                <div className="text-sm text-gray-500 mt-1">Excellent Scores</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}