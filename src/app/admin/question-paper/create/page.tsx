"use client";
import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";

interface Category { category_id: number; name: string }
interface Subcategory { subcategory_id: number; name: string; category_id: number }
interface Subject { subject_id: number; name: string; subcategory_id: number }
interface Exam { exam_id: number; name: string; subject_id: number }
interface ExamDetail extends Exam { num_of_ques?: number }
type QuestionDraft = { text: string; options: string[]; correctOption?: number; file?: File | null };

export default function CreateQuestionPaperPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"select" | "builder">("select");
  const [builderExamName, setBuilderExamName] = useState<string>("");
  const [examQuestionsCount, setExamQuestionsCount] = useState<number>(0);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [uploadingQuestions, setUploadingQuestions] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedCategory || !selectedSubcategory || !selectedSubject || !selectedExam) {
      setError("Please select Category, Subcategory, Subject, and Exam");
      return;
    }
    try {
      setLoading(true);
      
      // Check if questions already exist for this exam
      const checkRes = await fetch(`${API_BASE}admin/questions?exam_id=${selectedExam}`);
      const existingQuestions = await checkRes.json();
      
      if (Array.isArray(existingQuestions) && existingQuestions.length > 0) {
        setError("Question Set already exists, go to all question paper to edit the existing paper or delete and recreate it.");
        setLoading(false);
        return;
      }
      
      // Fetch exam details to get number of questions
      const res = await fetch(`${API_BASE}admin/exam/${selectedExam}`);
      const detail: ExamDetail = await res.json();
      const count = Number(detail?.num_of_ques) || 0;
      const safeCount = count > 0 ? count : 1; // fallback to at least 1
      setExamQuestionsCount(safeCount);
      setBuilderExamName(detail?.name || (exams.find(x => String(x.exam_id) === String(selectedExam))?.name ?? ""));
      // Initialize placeholder questions (4 options by default)
      const initial: QuestionDraft[] = Array.from({ length: safeCount }, () => ({
        text: "",
        options: ["", "", "", ""],
        correctOption: undefined,
        file: null,
      }));
      setQuestions(initial);
      setMode("builder");
    } catch (err: any) {
      setError(err?.message || "Failed to load exam details");
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

  const handleSaveQuestions = async () => {
    try {
      setUploadingQuestions(true);
      setLoading(true);

      // ============================================================
      // SINGLE QUESTION UPLOAD (COMMENTED OUT - OLD APPROACH)
      // ============================================================
      /*
      for (const q of questions) {
        const formData = new FormData();
        formData.append("exam_id", selectedExam);
        formData.append("question_text", q.text);
        formData.append("options", JSON.stringify(q.options));
        const correctValue = typeof q.correctOption === 'number' && q.options[q.correctOption] !== undefined
          ? q.options[q.correctOption]
          : '';
        formData.append("correct_option", correctValue);
        if (q.file) formData.append("file", q.file);

        await fetch(`${API_BASE}admin/upload-questions`, {
          method: "POST",
          body: formData,
        });
      }
      */

      // ============================================================
      // BATCH UPLOAD (NEW APPROACH)
      // ============================================================
      const formData = new FormData();
      
      // Add exam_id
      formData.append("exam_id", selectedExam);
      
      // Prepare questions data array (without files)
      const questionsData = questions.map((q, idx) => {
        const correctValue = typeof q.correctOption === 'number' && q.options[q.correctOption] !== undefined
          ? q.options[q.correctOption]
          : '';
        
        return {
          question_text: q.text,
          options: q.options,
          correct_option: correctValue,
          hasFile: !!q.file,
          fileIndex: q.file ? idx : null
        };
      });
      
      // Add questions data as JSON string
      formData.append("questions", JSON.stringify(questionsData));
      
      // Add files with indexed keys
      questions.forEach((q, idx) => {
        if (q.file) {
          formData.append(`file_${idx}`, q.file);
        }
      });

      const response = await fetch(`${API_BASE}admin/upload-questions-batch`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload questions");
      }

      const result = await response.json();
      
      // Show success popup
      setUploadedCount(result.uploaded || questions.length);
      setUploadingQuestions(false);
      setShowSuccessPopup(true);
      
      // Auto-hide success popup after 5 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 5000);
      
    } catch (err) {
      console.error(err);
      setUploadingQuestions(false);
      alert(`Failed to upload questions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-gray-900">
      {/* Loading Overlay */}
      {uploadingQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            <div className="text-xl font-semibold text-gray-800">Uploading Questions...</div>
            <div className="text-sm text-gray-600">Please wait while we save your questions</div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4 animate-scale-in">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Upload Successful!</h3>
              <p className="text-gray-600 text-center">
                Successfully uploaded <span className="font-semibold text-green-600">{uploadedCount}</span> question{uploadedCount !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">Set Question Paper</h1>
        <p className="text-orange-100">Select the hierarchy to set questions for a specific exam.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      {mode === "select" && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="min-w-0">
              <label className="sr-only">Category</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categoryOptions}
              </select>
            </div>

            <div className="min-w-0">
              <label className="sr-only">Subcategory</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={!selectedCategory}
              >
                <option value="">Select Subcategory</option>
                {subcategoryOptions}
              </select>
            </div>

            <div className="min-w-0">
              <label className="sr-only">Subject</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedSubcategory}
              >
                <option value="">Select Subject</option>
                {subjectOptions}
              </select>
            </div>

            <div className="min-w-0">
              <label className="sr-only">Exam</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                disabled={!selectedSubject}
              >
                <option value="">Select Exam</option>
                {examOptions}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Loading..." : "Proceed"}
          </button>
        </form>
      )}

      {mode === "builder" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium">Exam: {builderExamName}</div>
              <div className="text-sm text-gray-700">Total Questions: {examQuestionsCount}</div>
            </div>
            <button
              type="button"
              className="px-3 py-2 rounded border text-sm"
              onClick={() => {
                setMode("select");
              }}
            >
              Change Selection
            </button>
          </div>

          {questions.map((q, idx) => (
            <div key={idx} className="border rounded p-3 space-y-3 bg-white">
              <div className="font-semibold">Question {idx + 1}</div>
              <div>
                <label className="block text-sm mb-1">Question Text</label>
                <textarea
                  className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                  placeholder="Enter question text"
                  value={q.text}
                  onChange={(e) => {
                    const next = [...questions];
                    next[idx] = { ...next[idx], text: e.target.value };
                    setQuestions(next);
                  }}
                />
              </div>
              <div className="space-y-2">
                {q.options.map((opt, j) => (
                  <div key={j} className="flex items-center gap-2 border rounded px-3 py-2 bg-white">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={q.correctOption === j}
                      onChange={() => {
                        const next = [...questions];
                        next[idx] = { ...next[idx], correctOption: j };
                        setQuestions(next);
                      }}
                      aria-label={`Mark option ${j + 1} as correct`}
                    />
                    <input
                      className="flex-1 bg-transparent text-gray-900 outline-none"
                      placeholder={`Option ${j + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const next = [...questions];
                        const opts = [...next[idx].options];
                        opts[j] = e.target.value;
                        next[idx] = { ...next[idx], options: opts };
                        setQuestions(next);
                      }}
                      aria-label={`Option ${j + 1} text`}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm mb-1">Attach File (optional)</label>
                <input
                  type="file"
                  className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    const next = [...questions];
                    next[idx] = { ...next[idx], file };
                    setQuestions(next);
                  }}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button
              type="button"
              className="bg-gray-200 text-gray-900 px-4 py-2 rounded"
              onClick={() => setMode("select")}
            >
              Back
            </button>
            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleSaveQuestions}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Questions"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
