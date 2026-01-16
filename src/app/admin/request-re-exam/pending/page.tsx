"use client";
import { useEffect, useState } from "react";
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
  answers: any;
}

export default function PendingRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [approveComment, setApproveComment] = useState("");
  const [declineComment, setDeclineComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Request[]>("admin/request");
      // Filter only pending requests (status is null or undefined, not true/false)
      const pendingRequests = data.filter(req => req.status === null || (typeof req.status !== 'boolean'));
      setRequests(pendingRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      alert("Failed to load requests");
    } finally {
      setLoading(false);
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

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
    setApproveComment("");
    setDeclineComment("");
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      await apiFetch(`admin/request/${selectedRequest.re_attempt_id}/approve`, {
        method: "PUT",
        body: JSON.stringify({
          status: true,
          remark: approveComment
        })
      });

      alert("Request approved successfully!");
      setShowDetailsModal(false);
      await fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      await apiFetch(`admin/request/${selectedRequest.re_attempt_id}/decline`, {
        method: "PUT",
        body: JSON.stringify({
          status: false,
          remark: declineComment
        })
      });

      alert("Request declined successfully!");
      setShowDetailsModal(false);
      await fetchRequests();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Re-Exam Requests</h1>
        <p className="text-gray-600 mt-2">Total Pending Requests: {requests.length}</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No pending requests</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Sl. No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Exam Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request, index) => (
                <tr key={request.re_attempt_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {request.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {request.contact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.exam_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(request.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Name</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Contact</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.contact}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Exam Name</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.exam_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Request Date</label>
                    <p className="mt-1 text-gray-900">{formatDate(selectedRequest.date)}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-gray-600">Reason</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedRequest.reason}</p>
                  </div>
                </div>

                {/* Previous Answers */}
                {selectedRequest.answers && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Attempt Answers</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedRequest.answers).map(([qId, answer]: [string, any]) => (
                        <div key={qId} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-700">Question {qId}</p>
                          <p className="text-xs text-gray-600 mt-1">{answer.question}</p>
                          <p className="text-sm text-gray-900 mt-2">
                            <span className="font-semibold">Answer:</span> {answer.selectedOption}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Approval Comment (Optional)</label>
                    <textarea
                      value={approveComment}
                      onChange={(e) => setApproveComment(e.target.value)}
                      placeholder="Add comment for approval..."
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Decline Comment (Optional)</label>
                    <textarea
                      value={declineComment}
                      onChange={(e) => setDeclineComment(e.target.value)}
                      placeholder="Add comment for decline..."
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={handleDecline}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Processing..." : "Decline"}
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
