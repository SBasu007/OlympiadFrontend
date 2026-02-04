"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/app/contexts/AuthContext";

interface Exam {
  exam_id: number;
  subject_id: number;
  name: string;
  description?: string;
  fees?: number;
  start_date: string;
  end_date: string;
}

export default function ExamApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMode, setPaymentMode] = useState<"online" | "offline" | "">("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const fetchExam = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}admin/exam/${examId}`
        );
        if (response.ok) {
          const examData = await response.json();
          setExam(examData);
        }
      } catch (error) {
        console.error("Error fetching exam:", error);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId, isAuthenticated, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!paymentMode) {
      setError("Please select a payment mode");
      return;
    }

    if (paymentMode === "offline" && !paymentFile) {
      setError("Please upload payment proof for offline payment");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("exam_id", examId);
      formData.append("user_id", user?.user_id?.toString() || "");
      formData.append("payment_mode", paymentMode);
      
      if (paymentFile) {
        formData.append("file", paymentFile);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}student/enroll`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to enroll");
      }

      const data = await response.json();
      alert("Successfully enrolled in exam!");
      router.push("/"); // Redirect to home or dashboard
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
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
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900">Exam not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              Apply for Exam
            </h1>
            <p className="text-sm text-gray-600">{exam.name}</p>
          </div>

          {/* Exam Details */}
          <div className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Registration Fee</p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{exam.fees || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Applicant</p>
                <p className="text-base font-semibold text-gray-900">
                  {user?.name || "Student"}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Payment Mode Selection */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-3">
                Select Payment Mode
              </label>

              <div className="space-y-2">
                {/* Online Payment Option */}
                <div
                  onClick={() => setPaymentMode("online")}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMode === "online"
                      ? "border-[#ff8a00] bg-orange-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    value="online"
                    checked={paymentMode === "online"}
                    onChange={(e) => setPaymentMode(e.target.value as "online")}
                    className="w-4 h-4 text-[#ff8a00] focus:ring-[#ff8a00]"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-[#ff8a00]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <p className="font-semibold text-gray-900 text-sm">Online Payment</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Pay instantly using UPI, Credit/Debit Card, Net Banking
                    </p>
                  </div>
                </div>

                {/* Offline Payment Option */}
                <div
                  onClick={() => setPaymentMode("offline")}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMode === "offline"
                      ? "border-[#ff8a00] bg-orange-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    value="offline"
                    checked={paymentMode === "offline"}
                    onChange={(e) => setPaymentMode(e.target.value as "offline")}
                    className="w-4 h-4 text-[#ff8a00] focus:ring-[#ff8a00]"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-[#ff8a00]"
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
                      <p className="font-semibold text-gray-900 text-sm">Offline Payment</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload payment receipt/screenshot after bank transfer
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload for Offline Payment */}
            {paymentMode === "offline" && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Payment Proof <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-4 pb-5 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#ff8a00] transition-colors">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#ff8a00] hover:text-[#e67d00] focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                    {paymentFile && (
                      <p className="text-sm text-green-600 font-medium mt-2">
                        ✓ {paymentFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting || !paymentMode}
                className="w-full px-6 py-3 bg-[#ff8a00] hover:bg-[#e67d00] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
