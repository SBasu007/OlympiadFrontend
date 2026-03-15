"use client";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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

    if (!paymentFile) {
      setError("Please upload payment screenshot");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("exam_id", examId);
      formData.append("user_id", user?.user_id?.toString() || "");
      formData.append("payment_mode", "offline");
      
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

      await response.json();
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-16">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              Apply for Exam
            </h1>
            <p className="text-sm text-gray-600">{exam.name}</p>
          </div>

          {/* Exam Details */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Payment Mode Selection */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[240px_1fr] md:items-start">
              <div className="rounded-lg border border-gray-200 p-2 bg-gray-50 w-fit">
                <Image
                  src="/qr.png"
                  alt="Payment QR"
                  width={220}
                  height={220}
                  className="h-auto w-auto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Payment Screenshot <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center justify-center rounded-lg border border-[#ff8a00] px-3 py-2 text-sm font-medium text-[#e67d00] cursor-pointer hover:bg-orange-50 transition-colors"
                  >
                    Choose File
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>

                {paymentFile && (
                  <p className="text-sm text-green-600 font-medium mt-2">
                    Selected: {paymentFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-2.5 bg-[#ff8a00] hover:bg-[#e67d00] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
