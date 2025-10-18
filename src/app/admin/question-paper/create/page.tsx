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
    setLoading(true);

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

    alert("All questions uploaded successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to upload questions");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto text-gray-900">
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
