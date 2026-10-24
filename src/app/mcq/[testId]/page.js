"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  normalizeType,
  parseMsqAnswer,
  formatCorrectAnswer,
  isAttempted,
  isCorrectAnswer,
  marksForAnswer,
  totalMarks,
  round2,
} from '../../lib/questionTypes';

const TYPE_LABELS = {
  MCQ: 'Multiple Choice (single correct)',
  MSQ: 'Multiple Select (one or more correct)',
  NAT: 'Numerical Answer',
};

export default function MCQTest() {
  const { testId } = useParams();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [marksObtained, setMarksObtained] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [userid, setUserId] = useState(null);

  // Load user ID from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("authid");
    if (savedToken) {
      setUserId(savedToken);
      console.log("User id from token:", savedToken);
    } else {
      console.warn("No user ID found in localStorage");
      // Optionally redirect to login
      // router.push('/login');
    }
  }, []);

  useEffect(() => {
    if (!testId) return;

    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`/api/get_mcqwithanswe/${testId}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : undefined,
        });
        const data = await response.json();

        if (data.success) {
          setQuestions(data.data);
        } else {
          setError(data.message || "Failed to fetch questions");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [testId]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && questions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, questions.length]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionText) => {
    const type = normalizeType(questions[currentQuestion]?.question_type);
    setAnswers(prev => {
      if (type === 'MSQ') {
        const selected = Array.isArray(prev[currentQuestion]) ? prev[currentQuestion] : [];
        const next = selected.includes(optionText)
          ? selected.filter(o => o !== optionText)
          : [...selected, optionText];
        return { ...prev, [currentQuestion]: next };
      }
      return { ...prev, [currentQuestion]: optionText };
    });
  };

  const handleNatChange = (value) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
  };

  const clearAnswer = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQuestion];
      return next;
    });
  };

  const isOptionSelected = (index, optionText) => {
    const ans = answers[index];
    return Array.isArray(ans) ? ans.includes(optionText) : ans === optionText;
  };

  const attemptedCount = questions.filter((q, i) => isAttempted(q, answers[i])).length;
  const maxMarks = totalMarks(questions);

  const handleQuestionNavigation = (questionIndex) => {
    setCurrentQuestion(questionIndex);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Marks-based scoring: +marks for correct, -negative_marks for attempted & wrong.
  // Returns the percentage of total marks (can go below 0 with negative marking).
  const calculateScore = () => {
    const obtained = round2(
      questions.reduce((sum, question, index) => sum + marksForAnswer(question, answers[index]), 0)
    );
    setMarksObtained(obtained);
    return maxMarks > 0 ? Math.round((obtained / maxMarks) * 100) : 0;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('User not authenticated. Please login again.');
      return;
    }

    setSubmitting(true);

    try {
      const score = calculateScore();

      // Updated API call to /api/results
      const submitResponse = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          test_id: parseInt(testId),
          score: score
        }),
      });

      const submitData = await submitResponse.json();

      if (submitData.success || submitResponse.ok) {
        setFinalScore(score);
        setIsSubmitted(true);
        setShowResults(true);
      } else {
        throw new Error(submitData.message || "Failed to submit test");
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Failed to submit test: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Generate and download PDF
  const downloadResultsPDF = () => {
    setDownloadingPDF(true);

    try {
      const correctAnswers = questions.filter((q, i) => isCorrectAnswer(q, answers[i])).length;
      const incorrectAnswers = questions.filter((q, i) => isAttempted(q, answers[i]) && !isCorrectAnswer(q, answers[i])).length;
      const unanswered = questions.length - attemptedCount;

      // Create HTML content for PDF
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Results - Test ${testId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #6366f1;
            }
            .header h1 { 
              color: #6366f1; 
              font-size: 32px;
              margin-bottom: 10px;
            }
            .score-box {
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
              color: white;
              padding: 30px;
              border-radius: 15px;
              text-align: center;
              margin: 30px 0;
            }
            .score-box .score {
              font-size: 60px;
              font-weight: bold;
              margin: 10px 0;
            }
            .stats {
              display: flex;
              justify-space-around;
              margin: 30px 0;
              padding: 20px;
              background: #f3f4f6;
              border-radius: 10px;
            }
            .stat-item {
              text-align: center;
            }
            .stat-item .number {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .stat-item.correct .number { color: #10b981; }
            .stat-item.incorrect .number { color: #ef4444; }
            .stat-item.unanswered .number { color: #f59e0b; }
            .question {
              margin: 30px 0;
              padding: 25px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              page-break-inside: avoid;
            }
            .question-header {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
            }
            .question-number {
              background: #6366f1;
              color: white;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              margin-right: 15px;
            }
            .question-status {
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
            }
            .status-correct {
              background: #d1fae5;
              color: #065f46;
            }
            .status-incorrect {
              background: #fee2e2;
              color: #991b1b;
            }
            .status-unanswered {
              background: #fef3c7;
              color: #92400e;
            }
            .question-text {
              font-size: 18px;
              font-weight: 600;
              margin: 15px 0;
              color: #1f2937;
            }
            .options {
              margin: 20px 0;
            }
            .option {
              padding: 15px;
              margin: 10px 0;
              border: 2px solid #e5e7eb;
              border-radius: 10px;
              display: flex;
              align-items: center;
            }
            .option.correct {
              background: #d1fae5;
              border-color: #10b981;
            }
            .option.incorrect {
              background: #fee2e2;
              border-color: #ef4444;
            }
            .option-label {
              font-weight: bold;
              margin-right: 10px;
              min-width: 30px;
            }
            .option-badge {
              margin-left: auto;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
            }
            .badge-correct {
              background: #10b981;
              color: white;
            }
            .badge-incorrect {
              background: #ef4444;
              color: white;
            }
            .explanation {
              background: #dbeafe;
              border: 2px solid #3b82f6;
              border-radius: 10px;
              padding: 15px;
              margin-top: 15px;
            }
            .explanation-title {
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 8px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            @media print {
              body { padding: 20px; }
              .question { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📝 Test Results Report</h1>
            <p style="font-size: 18px; color: #6b7280;">Test ID: ${testId} | User ID: ${userid}</p>
            <p style="font-size: 14px; color: #9ca3af;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>

          <div class="score-box">
            <div style="font-size: 18px;">Your Final Score</div>
            <div class="score">${finalScore}%</div>
            <div style="font-size: 16px;">
              ${marksObtained} / ${maxMarks} marks &middot; ${correctAnswers} out of ${questions.length} questions correct
            </div>
          </div>

          <div class="stats">
            <div class="stat-item correct">
              <div class="number">${correctAnswers}</div>
              <div>Correct</div>
            </div>
            <div class="stat-item incorrect">
              <div class="number">${incorrectAnswers}</div>
              <div>Incorrect</div>
            </div>
            <div class="stat-item unanswered">
              <div class="number">${unanswered}</div>
              <div>Unanswered</div>
            </div>
          </div>

          <h2 style="margin: 40px 0 20px 0; color: #1f2937; font-size: 24px;">📋 Detailed Results</h2>
      `;

      // Add each question
      questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const qType = normalizeType(question.question_type);
        const correctList = qType === 'MSQ' ? parseMsqAnswer(question.answer.correct_answer) : [question.answer.correct_answer];
        const isCorrect = isCorrectAnswer(question, userAnswer);
        const isUnanswered = !isAttempted(question, userAnswer);
        const earned = marksForAnswer(question, userAnswer);

        let statusClass = isUnanswered ? 'status-unanswered' : isCorrect ? 'status-correct' : 'status-incorrect';
        let statusText = isUnanswered ? 'Unanswered' : isCorrect ? 'Correct' : 'Incorrect';

        htmlContent += `
          <div class="question">
            <div class="question-header">
              <div class="question-number">${index + 1}</div>
              <div class="question-status ${statusClass}">${statusText} (${earned > 0 ? '+' : ''}${earned})</div>
            </div>
            <div class="question-text">${question.question_text.replace(/<[^>]*>/g, '')}</div>
            <div class="options">
        `;

        if (qType === 'NAT') {
          htmlContent += `
            <div class="option correct"><span>Correct answer: ${formatCorrectAnswer(question)}</span></div>
            <div class="option ${isCorrect ? 'correct' : isUnanswered ? '' : 'incorrect'}"><span>Your answer: ${isUnanswered ? '-' : userAnswer}</span></div>
          `;
        }

        question.options.forEach((option, optIndex) => {
          const isUserAnswer = isOptionSelected(index, option.option_text);
          const isCorrectOption = correctList.includes(option.option_text);

          let optionClass = '';
          let badge = '';

          if (isCorrectOption) {
            optionClass = 'correct';
            if (isUserAnswer) {
              badge = '<span class="option-badge badge-correct">✓ Your Answer (Correct)</span>';
            } else {
              badge = '<span class="option-badge badge-correct">✓ Correct Answer</span>';
            }
          } else if (isUserAnswer) {
            optionClass = 'incorrect';
            badge = '<span class="option-badge badge-incorrect">✗ Your Answer</span>';
          }

          htmlContent += `
            <div class="option ${optionClass}">
              <span class="option-label">${String.fromCharCode(65 + optIndex)}.</span>
              <span>${option.option_text}</span>
              ${badge}
            </div>
          `;
        });

        htmlContent += `</div>`;

        if (question.answer.about_answer) {
          htmlContent += `
            <div class="explanation">
              <div class="explanation-title">💡 Explanation:</div>
              <div>${question.answer.about_answer}</div>
            </div>
          `;
        }

        if (isUnanswered) {
          htmlContent += `
            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 15px; margin-top: 15px; color: #92400e;">
              ⚠️ You did not answer this question
            </div>
          `;
        }

        htmlContent += `</div>`;
      });

      htmlContent += `
          <div class="footer">
            <p><strong>Test Platform</strong> - Your Learning Partner</p>
            <p>This report is generated automatically. Keep practicing to improve your score!</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Test_${testId}_Results_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      setTimeout(() => {
        alert('✅ Results downloaded! Open the HTML file in your browser and use Print > Save as PDF to create a PDF.');
        setDownloadingPDF(false);
      }, 500);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download results. Please try again.');
      setDownloadingPDF(false);
    }
  };

  const getQuestionStatus = (index) => {
    if (questions[index] && isAttempted(questions[index], answers[index])) return 'answered';
    if (index === currentQuestion) return 'current';
    return 'unanswered';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white border-green-500';
      case 'current': return 'bg-indigo-500 text-white border-indigo-500';
      default: return 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading test questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Error Loading Test</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Results Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Test Completed!</h2>
            <div className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {finalScore}%
            </div>
            <p className="text-gray-600 mb-6">
              You scored <strong>{marksObtained}</strong> out of <strong>{maxMarks}</strong> marks
              ({questions.filter((q, i) => isCorrectAnswer(q, answers[i])).length} of {questions.length} questions correct)
            </p>
            <div className="flex justify-center space-x-4 flex-wrap gap-2">
              <button
                onClick={downloadResultsPDF}
                disabled={downloadingPDF}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Download PDF</span>
                  </>
                )}
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Back to Tests
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Retake Test
              </button>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Detailed Results</h3>

            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const qType = normalizeType(question.question_type);
              const correctList = qType === 'MSQ' ? parseMsqAnswer(question.answer.correct_answer) : [question.answer.correct_answer];
              const isCorrect = isCorrectAnswer(question, userAnswer);
              const attempted = isAttempted(question, userAnswer);
              const earned = marksForAnswer(question, userAnswer);

              return (
                <div key={question.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <span className="text-lg font-bold text-gray-700 mr-3">
                          Question {index + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-800' : attempted ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {isCorrect ? 'Correct' : attempted ? 'Incorrect' : 'Not answered'}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">{qType}</span>
                        <span className={`ml-auto text-sm font-bold ${earned > 0 ? 'text-green-600' : earned < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {earned > 0 ? '+' : ''}{earned} marks
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium mb-4">
                        <div dangerouslySetInnerHTML={{ __html: question.question_text }} />
                      </p>
                      {question.question_image && (
                        <div className="mb-4">
                          <img src={question.question_image} alt="Question" className="max-w-full h-auto rounded shadow" />
                        </div>
                      )}
                    </div>
                  </div>

                  {qType === 'NAT' && (
                    <div className="space-y-2 mb-4">
                      <div className="p-4 border-2 rounded-xl bg-green-100 border-green-500 text-green-800">
                        Correct answer: <strong>{formatCorrectAnswer(question)}</strong>
                      </div>
                      <div className={`p-4 border-2 rounded-xl ${isCorrect ? 'bg-green-50 border-green-300 text-green-800' : attempted ? 'bg-red-100 border-red-500 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                        Your answer: <strong>{attempted ? userAnswer : '-'}</strong>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 mb-4">
                    {question.options.map((option, optIndex) => {
                      const isUserAnswer = isOptionSelected(index, option.option_text);
                      const isCorrectOption = correctList.includes(option.option_text);

                      let optionClass = 'p-4 border-2 rounded-xl ';

                      if (isCorrectOption) {
                        optionClass += 'bg-green-100 border-green-500 text-green-800';
                      } else if (isUserAnswer && !isCorrectOption) {
                        optionClass += 'bg-red-100 border-red-500 text-red-800';
                      } else {
                        optionClass += 'bg-gray-50 border-gray-200 text-gray-600';
                      }

                      return (
                        <div key={option.id} className={optionClass}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="font-bold mr-3">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span>{option.option_text}</span>
                              {option.option_image && (
                                <span className="ml-2 text-xs italic">[Image: {option.option_image}]</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {isCorrectOption && (
                                <span className="text-green-600 font-medium text-sm">✓ Correct</span>
                              )}
                              {isUserAnswer && !isCorrectOption && (
                                <span className="text-red-600 font-medium text-sm">✗ Your Answer</span>
                              )}
                              {isUserAnswer && isCorrectOption && (
                                <span className="text-green-600 font-medium text-sm">✓ Your Answer</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {question.answer.about_answer && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-bold text-blue-800 mb-2">Explanation:</h4>
                      <p className="text-blue-700">{question.answer.about_answer}</p>
                    </div>
                  )}

                  {!attempted && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-yellow-700 font-medium">⚠️ You did not answer this question</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing Results...</h2>
          <p className="text-gray-600">
            Please wait while we calculate your score and prepare your results.
          </p>
        </div>
      </div>
    );
  }

  const progress = questions.length > 0 ? (attemptedCount / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Test {testId}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Time Remaining</div>
                <div className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-indigo-600'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {questions.length > 0 && (
                <>
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {currentQuestion + 1}
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {TYPE_LABELS[normalizeType(questions[currentQuestion].question_type)]}
                      </span>
                      <span className="ml-2 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                        +{questions[currentQuestion].marks ?? 1}
                      </span>
                      {Number(questions[currentQuestion].negative_marks) > 0 && (
                        <span className="ml-2 text-sm font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full">
                          −{questions[currentQuestion].negative_marks}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: questions[currentQuestion].question_text }} />
                    </h2>
                    {questions[currentQuestion].question_image && (
                      <div className="mt-4">
                        <img src={questions[currentQuestion].question_image} alt="Question" className="max-w-full h-auto rounded-md" />
                      </div>
                    )}
                  </div>

                  {normalizeType(questions[currentQuestion].question_type) === 'NAT' && (
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apna numerical answer likhein</label>
                      <input
                        type="number"
                        step="any"
                        inputMode="decimal"
                        value={answers[currentQuestion] ?? ''}
                        onChange={(e) => handleNatChange(e.target.value)}
                        placeholder="e.g. 12.5"
                        className="w-full max-w-xs p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-3 mb-8">
                    {questions[currentQuestion].options.map((option, index) => (
                      <label
                        key={option.id}
                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                          isOptionSelected(currentQuestion, option.option_text)
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type={normalizeType(questions[currentQuestion].question_type) === 'MSQ' ? 'checkbox' : 'radio'}
                            name={`question-${currentQuestion}`}
                            value={option.option_text}
                            checked={isOptionSelected(currentQuestion, option.option_text)}
                            onChange={() => handleAnswerSelect(option.option_text)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 border-2 flex items-center justify-center mr-4 ${
                            normalizeType(questions[currentQuestion].question_type) === 'MSQ' ? 'rounded' : 'rounded-full'
                          } ${
                            isOptionSelected(currentQuestion, option.option_text)
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-gray-300'
                          }`}>
                            {isOptionSelected(currentQuestion, option.option_text) && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-gray-700 font-medium">
                              {String.fromCharCode(65 + index)}. {option.option_text}
                            </span>
                            {option.option_image && (
                              <div className="mt-2">
                                <img
                                  src={option.option_image}
                                  alt="Option"
                                  className="max-w-[80px] h-auto object-contain rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {isAttempted(questions[currentQuestion], answers[currentQuestion]) && (
                    <button
                      onClick={clearAnswer}
                      className="mb-6 text-sm text-gray-500 hover:text-red-600 underline"
                    >
                      Clear response
                    </button>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Previous
                    </button>

                    {currentQuestion === questions.length - 1 ? (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium transition-all duration-200 hover:from-green-600 hover:to-green-700 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Test
                            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium transition-all duration-200 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 shadow-lg"
                      >
                        Next
                        <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Question Navigator</h3>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span>Answered: {attemptedCount}</span>
                    <span>Remaining: {questions.length - attemptedCount}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`w-10 h-10 rounded-lg border-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${getStatusColor(getQuestionStatus(index))}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-500 rounded mr-2"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                    <span>Not Answered</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || attemptedCount === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Submit Test'
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {attemptedCount}/{questions.length} questions answered · Total {maxMarks} marks
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}