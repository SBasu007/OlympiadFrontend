"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { API_BASE } from "@/lib/api";

interface Category { category_id: number; name: string }
interface Subcategory { subcategory_id: number; name: string; category_id: number }
interface Subject { subject_id: number; name: string; subcategory_id: number }
interface Exam { exam_id: number; name: string; subject_id: number }
interface MeritListResult {
  user_name: string;
  email: string;
  contact: string;
  total_marks: number;  
  score: number;
  percentage: number;
  attempted_at: string;
}

type PercentageBracket = "60-69" | "70-79" | "80-89" | "90-100";

export default function FilterMeritListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");

  const [selectedBracket, setSelectedBracket] = useState<PercentageBracket | "">("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MeritListResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const [selectedExamName, setSelectedExamName] = useState<string>("");

  // Fetch categories on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}admin/category`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // When category changes, fetch subcategories
  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      setSelectedSubcategory("");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}admin/subcategory?catid=${selectedCategory}`);
        const data = await res.json();
        setSubcategories(Array.isArray(data) ? data : []);
        setSelectedSubcategory("");
        setSubjects([]);
        setSelectedSubject("");
        setExams([]);
        setSelectedExam("");
      } catch (e: any) {
        setError(e?.message || "Failed to fetch subcategories");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCategory]);

  // When subcategory changes, fetch subjects
  useEffect(() => {
    if (!selectedSubcategory) {
      setSubjects([]);
      setSelectedSubject("");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}admin/subject?subcid=${selectedSubcategory}`);
        const data = await res.json();
        setSubjects(Array.isArray(data) ? data : []);
        setSelectedSubject("");
        setExams([]);
        setSelectedExam("");
      } catch (e: any) {
        setError(e?.message || "Failed to fetch subjects");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedSubcategory]);

  // When subject changes, fetch exams for that subject
  useEffect(() => {
    if (!selectedSubject) {
      setExams([]);
      setSelectedExam("");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}admin/exam?subject_id=${selectedSubject}`);
        const data = await res.json();
        setExams(Array.isArray(data) ? data : []);
        setSelectedExam("");
      } catch (e: any) {
        setError(e?.message || "Failed to fetch exams");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedSubject]);

  const getPercentageRange = (bracket: PercentageBracket): { min: number; max: number } => {
    const ranges: Record<PercentageBracket, { min: number; max: number }> = {
      "60-69": { min: 60, max: 69 },
      "70-79": { min: 70, max: 79 },
      "80-89": { min: 80, max: 89 },
      "90-100": { min: 90, max: 100 },
    };
    return ranges[bracket];
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults([]);

    if (!selectedExam) {
      setError("Please select an Exam");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("exam_id", selectedExam);

      if (selectedCategory) params.append("category_id", selectedCategory);
      if (selectedSubcategory) params.append("subcategory_id", selectedSubcategory);
      if (selectedSubject) params.append("subject_id", selectedSubject);

      if (selectedBracket) {
        const range = getPercentageRange(selectedBracket as PercentageBracket);
        params.append("percentage_min", range.min.toString());
        params.append("percentage_max", range.max.toString());
      }

      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);

      const res = await fetch(`${API_BASE}admin/merit-list?${params.toString()}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch merit list");
      }

      const data: MeritListResult[] = await res.json();
      setResults(data);
      setHasSearched(true);
      // Set the exam name for PDF export
      const examName = exams.find(e => String(e.exam_id) === String(selectedExam))?.name || "Merit List";
      setSelectedExamName(examName);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch merit list");
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = useMemo(() => categories.map(c => (
    <option key={c.category_id} value={c.category_id}>{c.name}</option>
  )), [categories]);

  const subcategoryOptions = useMemo(() => subcategories.map(s => (
    <option key={s.subcategory_id} value={s.subcategory_id}>{s.name}</option>
  )), [subcategories]);

  const subjectOptions = useMemo(() => subjects.map(su => (
    <option key={su.subject_id} value={su.subject_id}>{su.name}</option>
  )), [subjects]);

  const examOptions = useMemo(() => exams.map(ex => (
    <option key={ex.exam_id} value={ex.exam_id}>{ex.name}</option>
  )), [exams]);

  const handlePrintPDF = () => {
    if (!tableRef.current) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) {
      alert("Please allow popups to print the table");
      return;
    }

    const tableHTML = tableRef.current.outerHTML;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedExamName} - Merit List</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          thead {
            background-color: #f3f4f6;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 2px 2px;
            text-align: left;
            font-size: 12px;
          }
          th {
            font-weight: 600;
            background-color: #f3f4f6;
          }
          tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <h2>${selectedExamName} - Merit List</h2>
        <p style="text-align: center; font-size: 12px; color: #666; margin-bottom: 15px;">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </p>
        ${tableHTML}
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="max-w-6xl mx-auto text-gray-900">
      {/* <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">Filter Merit List</h1>
        <p className="text-orange-100">Filter and view merit lists by exam, percentage bracket, and date range.</p>
      </div> */}

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <form onSubmit={handleSearch} className="bg-white rounded-lg p-6 shadow-md space-y-6 mb-6 text-xs">
        {/* Hierarchy Selectors */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Filter Merit List</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 text-xs"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categoryOptions}
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-medium mb-1">Subcategory</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 text-xs"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
              >
                <option value="">Select Subcategory</option>
                {subcategoryOptions}
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-medium mb-1">Subject</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 text-xs"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjectOptions}
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-medium mb-1">Exam *</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 text-xs"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                required
              >
                <option value="">Select Exam</option>
                {examOptions}
              </select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Apply Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Percentage Bracket */}
            <div className="min-w-0">
              <label className="block text-xs font-medium mb-1">Percentage Bracket</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 text-xs"
                value={selectedBracket}
                onChange={(e) => setSelectedBracket(e.target.value as PercentageBracket | "")}
              >
                <option value="">All Percentages</option>
                <option value="60-69">60-69%</option>
                <option value="70-79">70-79%</option>
                <option value="80-89">80-89%</option>
                <option value="90-100">90-100%</option>
              </select>
            </div>

            {/* Date From */}
            <div className="min-w-0">
              <label className="block text-xs font-medium mb-1">Date From</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 text-xs"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="min-w-0">
              <label className="block text-xs font-medium mb-1">Date To</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 text-xs"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-60 hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Results Table */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {results.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              No results found for the selected filters.
            </div>
          ) : (
            <>
              <div className="p-4 bg-gray-50 border-b flex justify-end">
                <button
                  onClick={handlePrintPDF}
                  className="bg-green-600 text-white px-4 py-2 rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2v-2a2 2 0 00-2-2h-2m-4-4V7a2 2 0 012-2h.5a2 2 0 011.961 1.561l1.286 5.727a2 2 0 01-1.961 2.712H7a2 2 0 00-2 2v.5a2 2 0 002 2z" />
                  </svg>
                  Print to PDF
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full" ref={tableRef}>
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold">User Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Exam Marks</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Obtained Marks</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Obtained Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results.map((result, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs">{result.user_name}</td>
                        <td className="px-4 py-3 text-xs">{result.email}</td>
                        <td className="px-4 py-3 text-xs">{result.contact}</td>
                        <td className="px-4 py-3 text-xs">{result.total_marks}</td>
                        <td className="px-4 py-3 text-xs">{result.score}</td>
                        <td className="px-4 py-3 text-xs font-semibold">{result.percentage.toFixed(2)}%</td>
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
