"use client";
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Enrollment {
  enrol_id: number;
  user_id: string;
  exam_id: number;
  name: string;
  payment_url: string;
  contact: string;
  exam_name: string;
  created_at: string;
  status: string;
}

export default function PendingPaymentPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchPendingEnrollments();
  }, []);

  const fetchPendingEnrollments = async () => {
    try {
      setLoading(true);
      setError("");
      const token = sessionStorage.getItem("auth_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE;
      
      const response = await fetch(`${baseUrl}admin/enrollments/pending`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending enrollments");
      }

      const data = await response.json();
      setEnrollments(data);
    } catch (err: any) {
      setError(err.message || "Failed to load pending enrollments");
      console.error("Error fetching enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (enrolId: number, status: "approved" | "declined", userId: string, examId: number) => {
    if (!confirm(`Are you sure you want to ${status === "approved" ? "approve" : "decline"} this enrollment?`)) {
      return;
    }

    try {
      setProcessingId(enrolId);
      const token = sessionStorage.getItem("auth_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE;

      const response = await fetch(`${baseUrl}admin/enrollments/${enrolId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, user_id: userId, exam_id: examId })
      });

      if (!response.ok) {
        throw new Error("Failed to update enrollment status");
      }

      // Remove the enrollment from the list after successful update
      setEnrollments(prev => prev.filter(e => e.enrol_id !== enrolId));
      alert(`Enrollment ${status} successfully`);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
      console.error("Error updating status:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Pending Payment Proofs", 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 30);
    
    // Prepare table data
    const tableData = enrollments.map(e => [
      e.name,
      e.contact,
      e.exam_name,
      formatDate(e.created_at),
      e.payment_url ? "Available" : "No image"
    ]);
    
    // Generate table
    autoTable(doc, {
      head: [["Student Name", "Contact", "Exam Name", "Enrollment Date", "Payment Proof"]],
      body: tableData,
      startY: 35,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });
    
    // Save the PDF
    doc.save(`pending-payments-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = enrollments.map(e => ({
      "Student Name": e.name,
      "Contact": e.contact,
      "Exam Name": e.exam_name,
      "Enrollment Date": formatDate(e.created_at),
      "Payment Proof URL": e.payment_url || "N/A",
      "Status": e.status
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    ws["!cols"] = [
      { wch: 20 }, // Student Name
      { wch: 15 }, // Contact
      { wch: 30 }, // Exam Name
      { wch: 20 }, // Enrollment Date
      { wch: 50 }, // Payment Proof URL
      { wch: 10 }  // Status
    ];
    
    // Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending Payments");
    
    // Save the file
    XLSX.writeFile(wb, `pending-payments-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading pending enrollments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchPendingEnrollments}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pending Payment Proofs</h1>
            <p className="text-gray-600 mt-2">
              Review and approve/decline student enrollment payment proofs
            </p>
          </div>
          {enrollments.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600">No pending payment proofs at the moment</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Proof
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.enrol_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{enrollment.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enrollment.contact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{enrollment.exam_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(enrollment.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enrollment.payment_url ? (
                        <button
                          onClick={() => window.open(enrollment.payment_url, '_blank')}
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          View Image
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(enrollment.enrol_id, "approved", enrollment.user_id, enrollment.exam_id)}
                          disabled={processingId === enrollment.enrol_id}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {processingId === enrollment.enrol_id ? "Processing..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(enrollment.enrol_id, "declined", enrollment.user_id, enrollment.exam_id)}
                          disabled={processingId === enrollment.enrol_id}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {processingId === enrollment.enrol_id ? "Processing..." : "Decline"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
