"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MCQTest() {
  const { testId } = useParams();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Fetch questions from API
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

  // Timer effect
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
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionText
    }));
  };

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

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.answer.correct_answer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
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

      // Submit to API
      const submitResponse = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          test_id: testId,
          score: score
        }),
      });

      const submitData = await submitResponse.json();

      if (submitData.success) {
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

  const getQuestionStatus = (index) => {
    if (answers[index] !== undefined) return 'answered';
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

  const getAnswerStatusColor = (questionIndex, optionText) => {
    const userAnswer = answers[questionIndex];
    const correctAnswer = questions[questionIndex].answer.correct_answer;

    if (optionText === correctAnswer) {
      return 'bg-green-100 border-green-500 text-green-700'; // Correct answer
    } else if (optionText === userAnswer && optionText !== correctAnswer) {
      return 'bg-red-100 border-red-500 text-red-700'; // Wrong user answer
    } else if (optionText === userAnswer) {
      return 'bg-green-100 border-green-500 text-green-700'; // Correct user answer
    }
    return 'bg-gray-50 border-gray-200 text-gray-600'; // Not selected
  };

  // Removed duplicate progress declaration

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
            <p className="text-gray-600 mb-4">
              You scored {Math.round((finalScore / 100) * questions.length)} out of {questions.length} questions correctly
            </p>
            <div className="flex justify-center space-x-4">
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
              const correctAnswer = question.answer.correct_answer;
              const isCorrect = userAnswer === correctAnswer;

              return (
                <div key={question.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <span className="text-lg font-bold text-gray-700 mr-3">
                          Question {index + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium mb-4">{question.question_text}</p>
                      {question.question_image && (
                        <div className="mb-4 text-sm text-gray-500 italic">
                          [Image: {question.question_image}]
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Options with results */}
                  <div className="space-y-3 mb-4">
                    {question.options.map((option, optIndex) => {
                      const isUserAnswer = userAnswer === option.option_text;
                      const isCorrectOption = option.option_text === correctAnswer;

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

                  {/* Answer Explanation */}
                  {question.answer.about_answer && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-bold text-blue-800 mb-2">Explanation:</h4>
                      <p className="text-blue-700">{question.answer.about_answer}</p>
                    </div>
                  )}

                  {/* User didn't answer */}
                  {userAnswer === undefined && (
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

  const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;

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

          {/* Progress Bar */}
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
          {/* Question Panel - Left Side */}
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
                        Multiple Choice
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                      {questions[currentQuestion].question_text}
                    </h2>
                    {questions[currentQuestion].question_image && (
                      <div className="mt-4">
                        <img
                          src={questions[currentQuestion].question_image}
                          alt="Question"
                          className="max-20 h-20 rounded-md"
                        />
                      </div>
                    )}

                  </div>

                  <div className="space-y-3 mb-8">
                    {questions[currentQuestion].options.map((option, index) => (
                      <label
                        key={option.id}
                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${answers[currentQuestion] === option.option_text
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-indigo-300'
                          }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name={`question-${currentQuestion}`}
                            value={option.option_text}
                            checked={answers[currentQuestion] === option.option_text}
                            onChange={() => handleAnswerSelect(option.option_text)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${answers[currentQuestion] === option.option_text
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-gray-300'
                            }`}>
                            {answers[currentQuestion] === option.option_text && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-gray-700 font-medium">
                              {String.fromCharCode(65 + index)}. {option.option_text}
                            </span>
                            {option.option_image && (
                              <div className="mt-1">
                                <img
                                  src={option.option_image}
                                  alt="Option"
                                  width={80}
                                  height={80}
                                  className="object-contain rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

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

          {/* Question Navigator - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Question Navigator</h3>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span>Answered: {Object.keys(answers).length}</span>
                    <span>Remaining: {questions.length - Object.keys(answers).length}</span>
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

              {/* Submit Button in Sidebar */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                    </>
                  ) : (
                    'Submit Test'
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {Object.keys(answers).length}/{questions.length} questions answered
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}