"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE } from "@/lib/api";

type Question = { question_id: number; exam_id: number; question: string; options: string[] | string; correct: number | string; image_url?: string | null };

type QuestionDraft = { text: string; options: string[]; correctOption?: number; file?: File | null; question_id?: number; image_url?: string | null };

type OriginalQuestion = { text: string; options: string[]; correctOption?: number; image_url?: string | null };

type Exam = { exam_id: number; name: string };

export default function EditExamPaperPage(){
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [exam, setExam] = useState<Exam| null>(null);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<Record<number, OriginalQuestion>>({});
  const [updatingQuestions, setUpdatingQuestions] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [updatedCount, setUpdatedCount] = useState(0);

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
        
        // Store original state for change detection
        const originals: Record<number, OriginalQuestion> = {};
        drafts.forEach(d => {
          if (d.question_id) {
            originals[d.question_id] = {
              text: d.text,
              options: [...d.options],
              correctOption: d.correctOption,
              image_url: d.image_url,
            };
          }
        });
        setOriginalQuestions(originals);
      }catch(e:any){
        setError(e?.message || 'Failed to load exam or questions');
      }finally{
        setLoading(false);
      }
    })();
  },[id]);

  // Helper function to check if a question was modified
  const isQuestionModified = (current: QuestionDraft): boolean => {
    if (!current.question_id) return false; // New questions don't have originals
    
    const original = originalQuestions[current.question_id];
    if (!original) return true; // If we can't find original, assume modified
    
    // Check if text changed
    if (current.text !== original.text) return true;
    
    // Check if correct option changed
    if (current.correctOption !== original.correctOption) return true;
    
    // Check if options changed (deep comparison)
    if (current.options.length !== original.options.length) return true;
    for (let i = 0; i < current.options.length; i++) {
      if (current.options[i] !== original.options[i]) return true;
    }
    
    // Check if a new file was added
    if (current.file) return true;
    
    return false;
  };

  const save = async () => {
    setError(null);
    try{
      setUpdatingQuestions(true);
      setLoading(true);
      
      let updateCount = 0;
      
      for(let idx = 0; idx < questions.length; idx++){
        const q = questions[idx];
        if(!q.question_id){
          // skipping creation of new questions in this pass
          continue;
        }
        
        // Check if this question was modified
        if (!isQuestionModified(q)) {
          // Skip unchanged questions
          continue;
        }
        
        const form = new FormData();
        form.append('question_text', q.text);
        form.append('options', JSON.stringify(q.options));
        
        // Send the correct option value instead of index
        if (typeof q.correctOption === 'number' && q.options[q.correctOption]) {
          form.append('correct_option', q.options[q.correctOption]);
        }
        
        // Only append file if a new one was selected
        if(q.file) form.append('file', q.file);
        
        // Debug logging
        console.log('Updating question:', q.question_id);
        console.log('Sending data:', {
          question_text: q.text,
          options: q.options,
          correct_option: q.correctOption,
          options_json: JSON.stringify(q.options)
        });
        
        const res = await fetch(`${API_BASE}admin/questions/${q.question_id}`, { method:'PUT', body: form });
        if(!res.ok){
          const err = await res.json().catch(()=>({message:'Failed'}));
          throw new Error(err?.message || 'Failed to save');
        }
        
        // Clear the file after successful upload to prevent permanent "modified" state
        if(q.file) {
          const next = [...questions];
          next[idx] = { ...next[idx], file: null };
          setQuestions(next);
        }
        
        updateCount++;
      }
      
      // After all updates, refresh the data from server to ensure UI is in sync
      if (updateCount > 0) {
        console.log('Refreshing data from server after updates...');
        const qsRes = await fetch(`${API_BASE}admin/questions?exam_id=${id}`);
        const freshQuestions: Question[] = await qsRes.json();
        
        const freshDrafts: QuestionDraft[] = (freshQuestions || []).map(q => {
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

          // Determine correct option index
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
        
        setQuestions(freshDrafts);
        
        // Update originals with fresh data
        const newOriginals: Record<number, OriginalQuestion> = {};
        freshDrafts.forEach(d => {
          if (d.question_id) {
            newOriginals[d.question_id] = {
              text: d.text,
              options: [...d.options],
              correctOption: d.correctOption,
              image_url: d.image_url,
            };
          }
        });
        setOriginalQuestions(newOriginals);
      }
      
      // Show success popup
      setUpdatedCount(updateCount);
      setUpdatingQuestions(false);
      setShowSuccessPopup(true);
      
      // Auto-hide success popup after 5 seconds and return to all page
      setTimeout(() => {
        setShowSuccessPopup(false);
        // Redirect back to all questions page
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/question-paper/all';
        }
      }, 2000);
      
    }catch(e:any){
      setUpdatingQuestions(false);
      setError(e?.message || 'Failed to save');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-gray-900">
      {/* Loading Overlay */}
      {updatingQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            <div className="text-xl font-semibold text-gray-800">Updating Questions...</div>
            <div className="text-sm text-gray-600">Please wait while we save your changes</div>
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
              <h3 className="text-2xl font-bold text-gray-800">Update Successful!</h3>
              <p className="text-gray-600 text-center">
                {updatedCount > 0 ? (
                  <>
                    Successfully updated <span className="font-semibold text-green-600">{updatedCount}</span> of {questions.length} question{updatedCount !== 1 ? 's' : ''}
                  </>
                ) : (
                  <>No changes were detected</>
                )}
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

      <h1 className="text-2xl font-semibold mb-4">Edit Exam Question Paper</h1>
      {error && <div className="mb-3 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}
      <div className="mb-4">Exam: {exam?.name || id}</div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.question_id ?? `new-${idx}`} className="border rounded p-3 space-y-3 bg-white">
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
                    type="radio"
                    className="w-4 h-4"
                    name={`question-${q.question_id ?? idx}-correct`}
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
