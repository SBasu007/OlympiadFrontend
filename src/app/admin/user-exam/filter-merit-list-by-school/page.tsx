"use client";

import { useRef, useState } from "react";
import { API_BASE } from "@/lib/api";

interface MeritListResult {
  user_id: string;
  exam_id: number;
  user_name: string;
  email: string;
  contact: string;
  school_name: string;
  exam_name: string;
  total_marks: number;
  score: number;
  percentage: number;
}

export default function FilterMeritListBySchoolPage() {
  const [schoolName, setSchoolName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [results, setResults] = useState<MeritListResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const institute = schoolName.trim();
    setError(null);
    setResults([]);
    setHasSearched(true);

    if (!institute) {
      setError("Please enter a school name");
      return;
    }

    try {
      setLoading(true);
      const query = new URLSearchParams({ institute });
      if (categoryId) {
        query.set("category_id", categoryId);
      }

      const res = await fetch(`${API_BASE}admin/merit-list/institute?${query.toString()}`);
      if (!res.ok) {
        const response = await res.json();
        throw new Error(response.message || "Failed to fetch school merit list");
      }

      const data: MeritListResult[] = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch school merit list");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = () => {
    if (!tableRef.current) return;
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) {
      alert("Please allow popups to print the table");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${schoolName.trim()} - Merit List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { text-align: center; margin-bottom: 20px; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; }
            thead { background-color: #f3f4f6; }
            th, td { border: 1px solid #d1d5db; padding: 4px; text-align: left; font-size: 12px; }
            th { font-weight: 600; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h2>${schoolName.trim()} - Merit List</h2>
          ${tableRef.current.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const handleDownloadUserAttempt = async (result: MeritListResult) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}admin/user-attempts/${result.user_id}?exam_id=${result.exam_id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch user attempts");

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        alert("No attempt found for this user.");
        return;
      }

      const attempt = data[0];
      const answers = typeof attempt.answers === "string"
        ? JSON.parse(attempt.answers)
        : attempt.answers;
      const rows = Object.values(answers || {}).map((answer, index) => {
        const item = answer as {
          question?: string;
          selectedOption?: string;
          savedAt?: number | string;
          correct?: boolean;
        };
        const savedAt = typeof item.savedAt === "number"
          ? `${Math.floor(item.savedAt / 60)}m ${item.savedAt % 60}s`
          : item.savedAt || "";

        return `
          <tr>
            <td>${index + 1}</td><td>${item.question || ""}</td>
            <td>${item.selectedOption || ""}</td><td>${savedAt}</td>
            <td>${item.correct ? "Correct" : "Incorrect"}</td>
          </tr>
        `;
      }).join("");

      const printWindow = window.open("", "", "width=800,height=600");
      if (!printWindow) {
        alert("Please allow popups to print");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${result.user_name} - Attempt Details</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h2 { text-align: center; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 13px; }
              th { background-color: #f3f4f6; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h2>Attempt Details</h2>
            <p><strong>Name:</strong> ${result.user_name}</p>
            <p><strong>School:</strong> ${result.school_name}</p>
            <p><strong>Score:</strong> ${result.score} / ${result.total_marks}</p>
            <table>
              <thead><tr><th>Sl No.</th><th>Question</th><th>Selected Option</th><th>Saved At</th><th>Status</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error fetching attempt details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto text-gray-900">
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <form onSubmit={handleSearch} className="bg-white rounded-lg p-6 shadow-md space-y-4 mb-6 text-xs">
        <h2 className="text-base font-semibold text-gray-800">Filter Merit List by School</h2>
        <div className="max-w-md">
          <label htmlFor="school-name" className="block text-xs font-medium mb-1">School Name</label>
          <input
            id="school-name"
            type="search"
            className="w-full border rounded px-3 py-2 bg-white text-gray-900 text-xs"
            placeholder="Search school name"
            value={schoolName}
            onChange={(event) => setSchoolName(event.target.value)}
          />
        </div>
        <div className="max-w-md">
          <label htmlFor="exam-category" className="block text-xs font-medium mb-1">Exam Category</label>
          <select
            id="exam-category"
            className="w-full border rounded px-3 py-2 bg-white text-gray-900 text-xs"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">All Exam Categories</option>
            <option value="5">Talent Search Olympiad State Level</option>
            <option value="6">Talent Search Olympiad National Level</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-60 hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {hasSearched && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {results.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">No results found for this school.</div>
          ) : (
            <>
              <div className="p-4 bg-gray-50 border-b flex justify-end">
                <button
                  onClick={handlePrintPDF}
                  className="bg-green-600 text-white px-4 py-2 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                >
                  Print to PDF
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full" ref={tableRef}>
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold">User Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">School Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Exam Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Exam Marks</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Obtained Marks</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Obtained Percentage</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results.map((result) => (
                      <tr key={`${result.user_id}-${result.exam_id}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs">{result.user_name}</td>
                        <td className="px-4 py-3 text-xs">{result.school_name || "N/A"}</td>
                        <td className="px-4 py-3 text-xs">{result.exam_name || "N/A"}</td>
                        <td className="px-4 py-3 text-xs">{result.email}</td>
                        <td className="px-4 py-3 text-xs">{result.contact}</td>
                        <td className="px-4 py-3 text-xs">{result.total_marks}</td>
                        <td className="px-4 py-3 text-xs">{result.score}</td>
                        <td className="px-4 py-3 text-xs font-semibold">
                          {Number(result.percentage).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <button
                            onClick={() => handleDownloadUserAttempt(result)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            Download Attempt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="px-6 py-4 bg-gray-50 border-t text-xs text-gray-600">
            Total Records: <span className="font-semibold">{results.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
