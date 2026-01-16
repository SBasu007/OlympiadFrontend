"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Request {
  re_attempt_id: number;
  user_id: string;
  exam_id: number;
  name: string;
  contact: string;
  exam_name: string;
  date: string;
  reason: string;
  status: boolean;
  remark: string;
  answers: object;
}

export default function RequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [approveComment, setApproveComment] = useState("");
  const [declineComment, setDeclineComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showAnswersModal, setShowAnswersModal] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, []);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Request[]>("admin/request");
      const foundRequest = data.find(r => r.re_attempt_id === parseInt(requestId));
      if (foundRequest) {
        setRequest(foundRequest);
      } else {
        alert("Request not found");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching request:", error);
      alert("Failed to load request");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: boolean) => {
    if (status === true) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Approved
        </span>
      );
    } else if (status === false) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Declined
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  console.log(request?.answers)
  const handleApprove = async () => {
    if (!request) return;

    try {
      setActionLoading(true);
      await apiFetch(`admin/request/${request.re_attempt_id}/approve`, {
        method: "PUT",
        body: JSON.stringify({
          status: "approved",
          remark: approveComment
        })
      });

      alert("Request approved successfully!");
      router.back();
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!request) return;

    try {
      setActionLoading(true);
      await apiFetch(`admin/request/${request.re_attempt_id}/decline`, {
        method: "PUT",
        body: JSON.stringify({
          status: "declined",
          remark: declineComment
        })
      });

      alert("Request declined successfully!");
      router.back();
    } catch (error) {
      console.error("Error declining request:", error);
      alert("Failed to decline request");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-gray-500">Request not found</p>
        </div>
      </div>
    );
  }

  const isPending = request.status === null || (typeof request.status !== 'boolean');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Request Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-600">Name</label>
              <p className="mt-2 text-lg text-gray-900 font-medium">{request.name}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Contact</label>
              <p className="mt-2 text-lg text-gray-900">{request.contact}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Exam Name</label>
              <p className="mt-2 text-lg text-gray-900 font-medium">{request.exam_name}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Request Date</label>
              <p className="mt-2 text-lg text-gray-900">{formatDate(request.date)}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Status</label>
              <div className="mt-2">{getStatusBadge(request.status)}</div>
            </div>
          </div>
        </div>

        {/* Reason and Remark */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Request Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Reason</label>
              <p className="mt-2 text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {request.reason}
              </p>
            </div>
            {request.remark && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Remark</label>
                <p className="mt-2 text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {request.remark}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Previous Answers Button */}
        {request.answers && Object.keys(request.answers).length > 0 && (
          <div className="border-t pt-6">
            <button
              onClick={() => setShowAnswersModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              📋 View Answers ({Object.keys(request.answers).length})
            </button>
          </div>
        )}

        {/* Answers Modal */}
        {showAnswersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Previous Attempt Answers</h2>
                <button
                  onClick={() => setShowAnswersModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-3">
                  {Object.entries(request.answers).map(([qId, answer]: [string, any]) => {
                    const truncateText = (text: string, maxLength: number) => {
                      return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
                    };

                    return (
                      <div key={qId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0">
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate">{truncateText(answer.question, 80)}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {answer.selectedOption}
                            </span>
                            <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                              {answer.savedAt}s
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {answer.correct ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t">
                <button
                  onClick={() => setShowAnswersModal(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Only show if pending */}
        {isPending && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Approval Comment (Optional)</label>
                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Add comment for approval..."
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">Decline Comment (Optional)</label>
                <textarea
                  value={declineComment}
                  onChange={(e) => setDeclineComment(e.target.value)}
                  placeholder="Add comment for decline..."
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Processing..." : "✓ Approve"}
                </button>
                <button
                  onClick={handleDecline}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Processing..." : "✕ Decline"}
                </button>
              </div>
            </div>
          </div>
        )}

        {!isPending && (
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600">
              This request has already been {request.status ? 'approved' : 'declined'} and cannot be modified.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
