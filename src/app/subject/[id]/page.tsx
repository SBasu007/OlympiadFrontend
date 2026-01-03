"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
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
  certificate_bg?: string;
}

interface Subject {
  subject_id: number;
  subcategory_id: number;
  name: string;
}

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated, logout } = useAuth();
  const subjectId = params.id as string;
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subject details
        const subjectResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}admin/subject/${subjectId}`
        );
        if (subjectResponse.ok) {
          const subjectData = await subjectResponse.json();
          setSubject(subjectData);
        }

        // Fetch exams for this subject
        const examsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}admin/exam?subjectId=${subjectId}`
        );
        if (examsResponse.ok) {
          const examsData = await examsResponse.json();
          setExams(examsData);
          
          // Check enrollment status for each exam if user is authenticated
          if (isAuthenticated && user?.user_id) {
            const statusPromises = examsData.map(async (exam: Exam) => {
              try {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE}student/enrollment/${exam.exam_id}/${user.user_id}`
                );
                if (response.ok) {
                  const data = await response.json();
                  return { exam_id: exam.exam_id, enrolled: data.enrolled };
                }
                return { exam_id: exam.exam_id, enrolled: false };
              } catch (err) {
                console.error(`Error checking enrollment for exam ${exam.exam_id}:`, err);
                return { exam_id: exam.exam_id, enrolled: false };
              }
            });
            
            const statusResults = await Promise.all(statusPromises);
            const statusMap = statusResults.reduce((acc, { exam_id, enrolled }) => {
              acc[exam_id] = enrolled;
              return acc;
            }, {} as Record<number, boolean>);
            
            setEnrollmentStatus(statusMap);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchData();
    }
  }, [subjectId, isAuthenticated, user]);

  const isExpired = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return now > end;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
const handleApplyClick = (examId: number) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    } else {
      // Redirect to payment page with exam_id
      router.push(`/exam/${examId}/apply`);
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        {/* <nav className="mb-6 flex items-center space-x-2 text-sm">
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            Home
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600">{subject?.name || "Loading..."}</span>
        </nav> */}

        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {subject?.name || "Loading..."}
          </h1>
          <p className="text-gray-600">Available Exams</p>
        </div> */}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Exams List */}
        {!loading && exams.length > 0 && (
          <div className="space-y-4">
            {exams.map((exam) => {
              const expired = isExpired(exam.end_date);
              
              return (
                <div
                  key={exam.exam_id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      {/* Left Section - Content */}
                      <div className="flex-1 space-y-3">
                        {/* Exam Name */}
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {exam.name}
                        </h2>

                        {/* Description */}
                        {exam.description && (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {exam.description}
                          </p>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
                        <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            <span className="font-medium">Registration:</span> {formatDate(exam.start_date)} - {formatDate(exam.end_date)}
                          </span>
                        </div>

                        {/* Study Material Link */}
                        {exam.study_mat_url && (
                          <div className="pt-2">
                            <a
                              href={exam.study_mat_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              Study Material
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Right Section - CTA Button */}
                      <div className="flex-shrink-0 lg:w-48">
                        {expired ? (
                          <button
                            disabled
                            className="w-full px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed opacity-75"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm">Expired on</span>
                              <span className="text-xs">{formatDate(exam.end_date)}</span>
                            </div>
                          </button>
                        ) : enrollmentStatus[exam.exam_id] ? (
                          <button
                            disabled
                            className="w-full px-6 py-3 bg-[#007bff] text-white font-semibold rounded-lg cursor-not-allowed"
                          >
                            Already Enrolled
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApplyClick(exam.exam_id)}
                            className="w-full px-6 py-3 bg-[#ff8a00] hover:bg-[#e67d00] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                          >
                            {isAuthenticated ? 'Apply Now' : 'Login to Apply'}
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

        {/* Empty State */}
        {!loading && exams.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg 
                className="w-8 h-8 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exams Available</h3>
            <p className="text-gray-600 mb-6">There are no exams for this subject yet.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
