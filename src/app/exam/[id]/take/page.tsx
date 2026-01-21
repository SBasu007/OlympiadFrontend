"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

interface Question {
  question_id: number;
  exam_id: number;
  question: string;
  image_url?: string | null;
  options: string[];
}

interface QuestionStatus {
  answered: boolean;
  markedForReview: boolean;
  selectedOption: string | null;
  savedAt?: number | null; // timestamp in seconds
  locked?: boolean; // for resume mode - prevents changes to already attempted questions
}

interface Exam {
  exam_id: number;
  name: string;
  duration: number;
  num_of_ques: number;
}

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const examId = params.id as string;
  const isResumeMode = searchParams.get('mode') === 'resume';

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, QuestionStatus>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);

  // Fetch exam details and questions
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch exam details
        const examData = await apiFetch<Exam>(`admin/exam/${examId}`);
        setExam(examData);

        // Fetch questions
        const questionsData = await apiFetch<Question[]>(`student/exam/${examId}/questions`);
        setQuestions(questionsData);

        // Initialize question statuses
        const initialStatuses: Record<number, QuestionStatus> = {};
        questionsData.forEach(q => {
          initialStatuses[q.question_id] = {
            answered: false,
            markedForReview: false,
            selectedOption: null,
            locked: false
          };
        });

        // If resume mode, fetch previous attempts and prepopulate
        if (isResumeMode && user?.user_id) {
          try {
            // Fetch previous result to get time_taken
            const previousResult = await apiFetch<any>(
              `student/exam/${examId}/result/${user.user_id}`
            );

            // Fetch previous attempts
            const previousAttempts = await apiFetch<any>(
              `student/exam/${examId}/attempts/${user.user_id}`
            );

            // Prepopulate locked answers
            if (previousAttempts && previousAttempts.length > 0) {
              previousAttempts.forEach((attempt: any) => {
                if (initialStatuses[attempt.question_id]) {
                  initialStatuses[attempt.question_id] = {
                    answered: true,
                    markedForReview: false,
                    selectedOption: attempt.selected_option,
                    savedAt: attempt.saved_at,
                    locked: true // Lock this question
                  };
                }
              });
            }

            // Set timer to continue from where it left off
            const timeTaken = previousResult?.time_taken || 0;
            const remainingTime = (examData.duration * 60) - timeTaken;
            setTimeRemaining(Math.max(0, remainingTime));
          } catch (error) {
            console.error("Error fetching previous attempts:", error);
            // If fetching previous data fails, start fresh
            setTimeRemaining(examData.duration * 60);
          }
        } else {
          // Normal mode - set full timer
          setTimeRemaining(examData.duration * 60);
        }

        setQuestionStatuses(initialStatuses);

      } catch (error) {
        console.error("Error fetching exam data:", error);
        alert("Failed to load exam. Please try again.");
        router.push(`/exam/${examId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, isAuthenticated, isResumeMode, user?.user_id, router]);

  // Define handleSubmit before using it in effects
  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (!autoSubmit && !window.confirm("Are you sure you want to submit the exam?")) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare answers object with savedAt
      const answers: Record<number, { question: string; selectedOption: string; savedAt: number | null }> = {};
      Object.entries(questionStatuses).forEach(([questionId, status]) => {
        const question = questions.find(q => q.question_id === parseInt(questionId));
        if (status.answered && status.selectedOption && question) {
          answers[parseInt(questionId)] = {
            question: question.question,
            selectedOption: status.selectedOption,
            savedAt: status.savedAt ?? null
          };
        }
      });

      // Calculate time taken
      const timeTaken = exam ? (exam.duration * 60) - timeRemaining : 0;

      // Determine submission status
      const submissionStatus = autoSubmit ? 'ended' : 'submitted';

      // Submit to backend
      const result = await apiFetch<{
        result_id: number;
        exam_name: string;
        exam_type: string;
        score: number;
        total: number;
        correct: number;
        incorrect: number;
        total_questions: number;
        percentage: string;
        passed: boolean;
      }>('student/exam/submit', {
        method: 'POST',
        body: JSON.stringify({
          exam_id: parseInt(examId),
          user_id: user?.user_id,
          answers,
          time_taken: timeTaken,
          submission_status: submissionStatus
        })
      });

      // Store result in localStorage to display on result page
      if (result) {
        localStorage.setItem('exam_result', JSON.stringify(result));
      }

      // Redirect to result page
      router.push(`/exam/${examId}/result?result_id=${result.result_id}`);

    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Failed to submit exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [examId, user?.user_id, questionStatuses, exam, timeRemaining, router, questions]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || loading) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setAutoSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, loading]);

  // Handle page unload/close - auto-submit exam
  useEffect(() => {
    let hasSubmitted = false; // Flag to prevent duplicate submissions

    const submitExamOnClose = () => {
      if (hasSubmitted) {
        console.log('[⚠️ Already submitted, skipping duplicate]');
        return;
      }
      
      hasSubmitted = true;

      // Prepare answers
      const answers: Record<number, { question: string; selectedOption: string; savedAt: number | null }> = {};
      Object.entries(questionStatuses).forEach(([questionId, status]) => {
        const question = questions.find(q => q.question_id === parseInt(questionId));
        if (status.answered && status.selectedOption && question) {
          answers[parseInt(questionId)] = {
            question: question.question,
            selectedOption: status.selectedOption,
            savedAt: status.savedAt ?? null
          };
        }
      });

      const timeTaken = exam ? (exam.duration * 60) - timeRemaining : 0;
      
      const payload = {
        exam_id: parseInt(examId),
        user_id: user?.user_id,
        answers,
        time_taken: timeTaken,
        submission_status: 'ended'
      };

      // Use sendBeacon for reliable submission on page unload
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || 'http://localhost:3000/api';
      const submitUrl = `${apiUrl}/student/exam/submit`;
      
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(submitUrl, blob);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitting) {
        submitExamOnClose();
        // Show browser confirmation dialog
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examId, user, questionStatuses, timeRemaining, exam, submitting, questions, autoSubmit]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (option: string) => {
    if (!currentQuestion) return;

    // Prevent changing locked questions in resume mode
    if (questionStatuses[currentQuestion.question_id]?.locked) {
      return;
    }

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion.question_id]: {
        ...prev[currentQuestion.question_id],
        selectedOption: option
      }
    }));
  };

  const handleSaveAndNext = () => {
    if (!currentQuestion) return;

    // Prevent saving locked questions in resume mode
    if (questionStatuses[currentQuestion.question_id]?.locked) {
      alert("This question was already answered and cannot be changed.");
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      return;
    }

    const selectedOption = questionStatuses[currentQuestion.question_id]?.selectedOption;
    
    if (!selectedOption) {
      alert("Please select an option before saving.");
      return;
    }

    // Log the time (in seconds since exam start) when the answer is saved
    const timeTaken = exam ? (exam.duration * 60) - timeRemaining : 0;

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion.question_id]: {
        ...prev[currentQuestion.question_id],
        answered: true,
        markedForReview: false,
        savedAt: timeTaken
      }
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion.question_id]: {
        ...prev[currentQuestion.question_id],
        markedForReview: !prev[currentQuestion.question_id]?.markedForReview
      }
    }));
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const getQuestionBoxColor = (questionId: number) => {
    const status = questionStatuses[questionId];
    if (!status) return "bg-gray-300 text-gray-700"; // Unvisited
    if (status.locked) return "bg-blue-500 text-white"; // Locked (already answered)
    if (status.markedForReview) return "bg-yellow-400 text-white"; // Marked for review
    if (status.answered) return "bg-green-500 text-white"; // Answered
    return "bg-gray-300 text-gray-700"; // Not answered
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h3>
          <p className="text-gray-600 mb-6">This exam has no questions.</p>
          <button
            onClick={() => router.push(`/exam/${examId}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.name}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-6 py-3 rounded-lg font-mono text-2xl font-bold ${
                timeRemaining < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                ⏰ {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Resume Mode Banner */}
        {isResumeMode && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-blue-900">Resume Mode</p>
                <p className="text-sm text-blue-700">
                  Your previously answered questions are locked and highlighted in blue. You can only attempt the remaining questions.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Section - Question Area (Main) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              {/* Question Text */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {currentQuestionIndex + 1}
                  </span>
                  <p className="text-lg font-medium text-gray-900 flex-1">
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Question Image */}
                {currentQuestion.image_url && (
                  <div className="mt-4 mb-6">
                    <Image
                      src={currentQuestion.image_url}
                      alt="Question"
                      width={800}
                      height={600}
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {questionStatuses[currentQuestion.question_id]?.locked && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      This question was already answered in your previous attempt and is locked.
                    </span>
                  </div>
                )}
                {currentQuestion.options.map((option, index) => {
                  const isSelected = questionStatuses[currentQuestion.question_id]?.selectedOption === option;
                  const isLocked = questionStatuses[currentQuestion.question_id]?.locked;
                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      disabled={isLocked}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      } ${isLocked ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className={`text-base ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                          {option}
                        </span>
                        {isLocked && isSelected && (
                          <svg className="w-5 h-5 text-blue-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleMarkForReview}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
                    questionStatuses[currentQuestion.question_id]?.markedForReview
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  {questionStatuses[currentQuestion.question_id]?.markedForReview ? '⭐ Marked' : '☆ Mark for Review'}
                </button>

                <button
                  onClick={handleSaveAndNext}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  💾 Save & Next
                </button>

                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Next →
                </button>

                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-2.5 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors"
                  >
                    ← Previous
                  </button>
                )}
              </div>

              {/* Finish Exam Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? '⏳ Submitting...' : ' Finish Exam'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Section - Question Palette */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Question Palette</h3>

              {/* Legend */}
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-500 rounded"></span>
                  <span className="text-gray-700">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-300 rounded"></span>
                  <span className="text-gray-700">Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-yellow-400 rounded"></span>
                  <span className="text-gray-700">Marked for Review</span>
                </div>
                {isResumeMode && (
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 rounded"></span>
                    <span className="text-gray-700">Locked (Previously Answered)</span>
                  </div>
                )}
              </div>

              {/* Question Numbers Grid */}
              <div className="grid grid-cols-6 gap-1">
                {questions.map((question, index) => (
                  <button
                    key={question.question_id}
                    onClick={() => handleQuestionJump(index)}
                    className={`w-7 h-7 rounded-md font-semibold text-xs transition-all hover:scale-105 ${
                      getQuestionBoxColor(question.question_id)
                    } ${
                      currentQuestionIndex === index ? 'ring-2 ring-blue-300' : ''
                    }`}
                    style={{ minWidth: '1.75rem', minHeight: '1.75rem', padding: 0 }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-semibold text-gray-900">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-semibold text-green-600">
                    {Object.values(questionStatuses).filter(s => s.answered).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Marked for Review:</span>
                  <span className="font-semibold text-yellow-600">
                    {Object.values(questionStatuses).filter(s => s.markedForReview).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Not Answered:</span>
                  <span className="font-semibold text-gray-600">
                    {Object.values(questionStatuses).filter(s => !s.answered).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
