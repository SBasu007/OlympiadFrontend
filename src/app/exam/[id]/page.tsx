"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import ReExamModal from "@/app/components/ReExamModal";
import { useAuth } from "@/app/contexts/AuthContext";

interface Exam {
  exam_id: number;
  subject_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  fees?: number;
  num_of_ques?: number;
  type?: string;
  study_mat_url?: string;
  duration?: number;
  ques_mark?: number;
}

interface EnrollmentStatus {
  enrolled: boolean;
  status?: string;
}

interface ExamAccess {
  hasAccess: boolean;
  exam_access_id?: number;
  user_id?: string;
  exam_id?: number;
  status?: string;
  attempted?: string;
}

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const examId = params.id as string;
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>({ enrolled: false });
  const [examAccess, setExamAccess] = useState<ExamAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReExamModal, setShowReExamModal] = useState(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch exam details
        const examResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}admin/exam/${examId}`
        );
        if (examResponse.ok) {
          const examData = await examResponse.json();
          setExam(examData);
        }

        // Check enrollment status if user is authenticated
        if (isAuthenticated && user?.user_id) {
          const enrollmentResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}student/enrollment/${examId}/${user.user_id}`
          );
          if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json();

            // If approved, check exam access
            if (enrollmentData.status === 'approved') {
              const accessResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}admin/exam-access/${user.user_id}?exam_id=${examId}`
              );
              if (accessResponse.ok) {
                const data = await accessResponse.json();
                setExamAccess(data);
              }
            }
            setEnrollmentStatus(enrollmentData);
          }
        }
      } catch (error) {
        console.error("Error fetching exam details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExamDetails();
    }
  }, [examId, isAuthenticated, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isExpired = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return now > end;
  };

  const handleAppearForExam = () => {
    // Navigate to exam taking page
    router.push(`/exam/${examId}/take`);
  };

  const handleReExamClick = () => {
    setShowReExamModal(true);
  };

  const handleResumeExamClick = () => {
    // Navigate to exam taking page with resume mode
    router.push(`/exam/${examId}/take?mode=resume`);
  };

  const handleDownloadCertificate = async () => {
    if (!user?.user_id || !examId) {
      setCertificateError("Unable to generate certificate. Please try again.");
      return;
    }

    try {
      setCertificateError(null);
      const certificateUrl = `${process.env.NEXT_PUBLIC_API_BASE}student/certificate/${user.user_id}/${examId}`;
      
      const response = await fetch(certificateUrl);

      if (!response.ok) {
        const errorData = await response.json();
        setCertificateError(errorData.message || "Failed to generate certificate");
        return;
      }

      // Open the PDF in a new tab
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Certificate error:", error);
      setCertificateError("An error occurred while generating the certificate");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Exam Not Found</h3>
            <p className="text-gray-600 mb-6">The exam you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const expired = isExpired(exam.end_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <ReExamModal
        isOpen={showReExamModal}
        onClose={() => setShowReExamModal(false)}
        examId={examId}
        userId={user?.user_id?.toString() || ""}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Exam Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-8">
            {/* Exam Name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {exam.name}
            </h1>

            {/* Description */}
            {exam.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {exam.description}
              </p>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Fees */}
              {exam.fees !== undefined && exam.fees !== null && (
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Registration Fee</p>
                    <p className="text-lg font-bold text-gray-900">₹{exam.fees}</p>
                  </div>
                </div>
              )}

              {/* Duration */}
              {exam.duration && (
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Duration</p>
                    <p className="text-lg font-bold text-gray-900">{exam.duration} mins</p>
                  </div>
                </div>
              )}

              {/* Number of Questions */}
              {exam.num_of_ques && (
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Questions</p>
                    <p className="text-lg font-bold text-gray-900">{exam.num_of_ques}</p>
                  </div>
                </div>
              )}

              {/* Type */}
              {exam.type && (
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Type</p>
                    <p className="text-lg font-bold text-gray-900">{exam.type}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 text-gray-600 mb-5 p-3 bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">
                <span className="font-medium">Registration:</span> {formatDate(exam.start_date)} - {formatDate(exam.end_date)}
              </span>
            </div>

            {/* Study Material Link */}
            {exam.study_mat_url && (
              <div className="mb-5">
                <a
                  href={exam.study_mat_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Download Study Material
                </a>
              </div>
            )}

            {/* Certificate Error Message */}
            {certificateError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Certificate Not Available</p>
                  <p className="text-red-700 text-sm mt-1">{certificateError}</p>
                </div>
                <button
                  onClick={() => setCertificateError(null)}
                  className="text-red-600 hover:text-red-800 flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-3">
              {!isAuthenticated ? (
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
                >
                  Login to Continue
                </button>
              ) : expired ? (
                <>
                  {/* Show certificate even if exam is expired */}
                {!examAccess || !examAccess.hasAccess ? (
                    // No access record yet
                    <></>
                  ) : examAccess.attempted === 'submitted' ? (
                    // Exam submitted
                    <button
                      onClick={handleDownloadCertificate}
                      className="w-full px-6 py-3 mb-3 bg-[#ff8a00] hover:bg-[#e67d00] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Download Certificate
                    </button>
                  ):null}
                <button
                  disabled
                  className="w-full px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed opacity-75"
                >
                  Exam Registration Expired
                </button>
                </>
              ) : !enrollmentStatus.enrolled ? (
                <button
                  onClick={() => router.push(`/exam/${examId}/apply`)}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Apply for Exam
                </button>
              ) : enrollmentStatus.status === 'pending' ? (
                <button
                  disabled
                  className="w-full px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg cursor-not-allowed"
                >
                  Waiting for Verification
                </button>
              ) : enrollmentStatus.status === 'declined' ? (
                <button
                  disabled
                  className="w-full px-6 py-3 bg-red-500 text-white font-semibold rounded-lg cursor-not-allowed"
                >
                  Approval Declined
                </button>
              ) : enrollmentStatus.status === 'approved' ? (
                <>
                  {!examAccess || !examAccess.hasAccess ? (
                    // No access record yet
                    <button
                      onClick={handleAppearForExam}
                      className="w-full px-6 py-3 bg-[#ff8a00] hover:bg-[#e67d00] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Appear for Exam
                    </button>
                  ) : examAccess.attempted === 'unsubmitted' ? (
                    // Exam not yet submitted
                    <button
                      onClick={handleAppearForExam}
                      className="w-full px-6 py-3 bg-[#ff8a00] hover:bg-[#e67d00] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Appear for Exam
                    </button>
                  ) : examAccess.attempted === 'submitted' ? (
                    // Already appeared
                    <button
                      disabled
                      className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg cursor-not-allowed"
                    >
                      Already Appeared for Exam
                    </button>
                  ) : examAccess.attempted === 'ended' ? (
                    // Can request re-exam
                    <button
                      onClick={handleReExamClick}
                      className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Request Re-exam
                    </button>
                  ) : examAccess.attempted === 'reexam' ? (
                    // Can request re-exam
                    <button
                      onClick={handleResumeExamClick}
                      className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Resume Exam
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
