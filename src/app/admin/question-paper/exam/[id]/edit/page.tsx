"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE } from "@/lib/api";

type Question = { question_id: number; exam_id: number; question: string; options: string[] | string; correct: number | string; image_url?: string | null };

type QuestionDraft = { text: string; options: string[]; correctOption?: number; file?: File | null; question_id?: number; image_url?: string | null };

type Exam = { exam_id: number; name: string };

export default function EditExamPaperPage(){
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [exam, setExam] = useState<Exam| null>(null);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  useEffect(() => {
    if(!id) return;
    (async () => {
      try{
        setLoading(true);
        const [examRes, qsRes] = await Promise.all([
          fetch(`${API_BASE}admin/exam/${id}`),
          fetch(`${API_BASE}admin/questions?exam_id=${id}`)
        ]);
        const ex: Exam = await examRes.json();
        const qs: Question[] = await qsRes.json();
        setExam(ex);
        const drafts: QuestionDraft[] = (qs || []).map(q => {
          // Parse options which may come as an array or a JSON string
          let parsedOptions: string[] = [];
          if (Array.isArray(q.options)) {
            parsedOptions = q.options as string[];
          } else if (typeof q.options === 'string') {
            try {
              const maybe = JSON.parse(q.options);
              if (Array.isArray(maybe)) parsedOptions = maybe as string[];
            } catch {}
          }

          // Determine correct option index. Backend now stores the correct option as the actual option string.
          // Support legacy numeric index too as fallback.
          let correctIndex: number | undefined = undefined;
          if (typeof q.correct === 'string') {
            // Try to match by option value first
            const value = q.correct.trim();
            const found = parsedOptions.findIndex(o => (o ?? '').trim() === value);
            if (found >= 0) {
              correctIndex = found;
            } else {
              // Fallback: numeric string index from legacy data
              const n = parseInt(q.correct, 10);
              if (!Number.isNaN(n)) correctIndex = n;
            }
          } else if (typeof q.correct === 'number') {
            correctIndex = q.correct;
          }

          // Guard against out-of-bounds index
          if (
            typeof correctIndex === 'number' &&
            (correctIndex < 0 || correctIndex >= parsedOptions.length)
          ) {
            correctIndex = undefined;
          }

          return {
            question_id: q.question_id,
            text: q.question || "",
            options: parsedOptions,
            correctOption: correctIndex,
            image_url: q.image_url ?? null,
          } as QuestionDraft;
        });
        setQuestions(drafts);
      }catch(e:any){
        setError(e?.message || 'Failed to load exam or questions');
      }finally{
        setLoading(false);
      }
    })();
  },[id]);

  const save = async () => {
    setError(null);
    try{
      setLoading(true);
      for(const q of questions){
        if(!q.question_id){
          // skipping creation of new questions in this pass
          continue;
        }
        const form = new FormData();
        form.append('question_text', q.text);
        form.append('options', JSON.stringify(q.options));
        if (typeof q.correctOption === 'number') {
          const idx = q.correctOption;
          const val = Array.isArray(q.options) && idx >= 0 && idx < q.options.length ? q.options[idx] : undefined;
          // Prefer sending the actual option string (matches backend storage model), fallback to index string
          form.append('correct_option', typeof val === 'string' ? val : String(idx));
        }
        if(q.file) form.append('file', q.file);
        const res = await fetch(`${API_BASE}admin/questions/${q.question_id}`, { method:'PUT', body: form });
        if(!res.ok){
          const err = await res.json().catch(()=>({message:'Failed'}));
          throw new Error(err?.message || 'Failed to save');
        }
      }
      alert('Saved');
    }catch(e:any){
      setError(e?.message || 'Failed to save');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-gray-900">
      <h1 className="text-2xl font-semibold mb-4">Edit Exam Question Paper</h1>
      {error && <div className="mb-3 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}
      <div className="mb-4">Exam: {exam?.name || id}</div>

      <div className="space-y-4">
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
              {q.image_url && (
                <div className="mb-2">
                  <img
                    src={q.image_url}
                    alt={`Question ${idx + 1} image`}
                    className="max-h-40 rounded border object-contain"
                  />
                </div>
              )}
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
      </div>

      <div className="flex gap-3 mt-4">
        <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded" onClick={()=>history.back()} disabled={loading}>Back</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  );
}
