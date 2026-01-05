"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/app/contexts/AuthContext";

interface ResultData {
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
}

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const examId = params.id as string;
  const resultId = searchParams.get('result_id');

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!resultId) {
      alert("No result found");
      router.push(`/exam/${examId}`);
      return;
    }

    // Retrieve the result from localStorage (stored during submission)
    const storedResult = localStorage.getItem('exam_result');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
      localStorage.removeItem('exam_result'); // Clean up
    }
    setLoading(false);
  }, [isAuthenticated, router, examId, resultId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading result...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Result Not Found</h3>
          <p className="text-gray-600 mb-6">Unable to load exam result.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <p className="text-center text-gray-700 text-lg">
            Exam is Over. Thank you for Participating in the <span className="font-bold text-blue-600">TALENT SEARCH OLYMPIAD</span>.<br/>
            All participants will get a <span className="font-semibold">Performance Report Cum Certificate in PDF</span> (take a print out).<br/>
            Candidate Scoring 80% marks will get a Medal.<br/>
            Candidate Scoring 90% marks will be selected for NATIONAL LEVEL COMPETITION.
          </p>
        </div>

        {/* Result Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Left Column */}
            <div className="space-y-2">
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-0.5">Exam Name</p>
                <p className="text-base font-semibold text-gray-900">{result.exam_name}</p>
              </div>

              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-0.5">Exam Type</p>
                <p className="text-base font-semibold text-gray-900">{result.exam_type}</p>
              </div>

              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-0.5">Total Marks</p>
                <p className="text-base font-semibold text-gray-900">{result.total}</p>
              </div>

              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-0.5">Total Obtained Marks</p>
                <p className="text-xl font-bold text-blue-600">{result.score}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-0.5">Correct Ans</p>
                <p className="text-base font-semibold text-green-600">{result.correct}</p>
              </div>

              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-0.5">Wrong Ans</p>
                <p className="text-base font-semibold text-red-600">{result.incorrect}</p>
              </div>

              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-0.5">Accuracy</p>
                <p className="text-xl font-bold text-purple-600">{result.percentage}%</p>
              </div>

              {/* Achievement Badge */}
              {parseFloat(result.percentage) >= 90 && (
                <div className="bg-purple-100 border-2 border-purple-600 rounded-lg p-2 text-center">
                  <p className="text-purple-900 font-bold text-sm">🏆 NATIONAL LEVEL QUALIFICATION!</p>
                </div>
              )}
              {parseFloat(result.percentage) >= 80 && parseFloat(result.percentage) < 90 && (
                <div className="bg-green-100 border-2 border-green-600 rounded-lg p-2 text-center">
                  <p className="text-green-900 font-bold text-sm">🏅 MEDAL WINNER!</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Performance</span>
              <span className="text-xs font-medium text-gray-700">{result.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  parseFloat(result.percentage) >= 90
                    ? 'bg-purple-600'
                    : parseFloat(result.percentage) >= 80
                    ? 'bg-green-500'
                    : parseFloat(result.percentage) >= 50
                    ? 'bg-blue-500'
                    : 'bg-orange-500'
                }`}
                style={{ width: `${result.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-[#ff8a00] text-white text-lg font-semibold rounded-lg hover:bg-[#e67600] transition-colors shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
