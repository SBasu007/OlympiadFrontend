"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";

type Category = { category_id: number; name: string };
type Subcategory = { subcategory_id: number; name: string; category_id: number };
type Subject = { subject_id: number; name: string; subcategory_id: number };
type Exam = { exam_id: number; name: string; subject_id: number };

export default function AllQuestionPaperPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  const [search, setSearch] = useState<string>("");
  const [fCat, setFCat] = useState<string>("");
  const [fSub, setFSub] = useState<string>("");
  const [fSubj, setFSubj] = useState<string>("");
  const [fExam, setFExam] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [catRes, subRes, subjRes, examRes] = await Promise.all([
          fetch(API_BASE + "admin/category"),
          fetch(API_BASE + "admin/subcategory"),
          fetch(API_BASE + "admin/subject"),
          fetch(API_BASE + "admin/exam")
        ]);
        const [cats, subs, subjs, exms] = await Promise.all([
          catRes.json(), subRes.json(), subjRes.json(), examRes.json()
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setSubcategories(Array.isArray(subs) ? subs : []);
        setSubjects(Array.isArray(subjs) ? subjs : []);
        setExams(Array.isArray(exms) ? exms : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryMap = useMemo(() => Object.fromEntries(categories.map(c => [c.category_id, c.name])), [categories]);
  const subcategoryMap = useMemo(() => Object.fromEntries(subcategories.map(s => [s.subcategory_id, s.name])), [subcategories]);
  const subjectMap = useMemo(() => Object.fromEntries(subjects.map(su => [su.subject_id, su.name])), [subjects]);
  const examMap = useMemo(() => Object.fromEntries(exams.map(ex => [ex.exam_id, ex.name])), [exams]);
  const subjectSubcatMap = useMemo(() => Object.fromEntries(subjects.map(su => [su.subject_id, su.subcategory_id])), [subjects]);
  const subcatCatMap = useMemo(() => Object.fromEntries(subcategories.map(sc => [sc.subcategory_id, sc.category_id])), [subcategories]);

  const filtered = useMemo(() => {
    let list = exams;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(s));
    }
    if (fSubj) list = list.filter(e => String(e.subject_id) === fSubj);
    if (fSub) list = list.filter(e => String(subjectSubcatMap[e.subject_id]) === fSub);
    if (fCat) list = list.filter(e => String(subcatCatMap[subjectSubcatMap[e.subject_id]]) === fCat);
    if (fExam) list = list.filter(e => String(e.exam_id) === fExam);
    return list;
  }, [exams, search, fExam, fSubj, fSub, fCat, subjectSubcatMap, subcatCatMap]);

  return (
    <div className="max-w-6xl mx-auto text-gray-900">
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">All Question Paper</h1>
        <p className="text-orange-100">Manage and edit question papers for each exam</p>
      </div>
      {error && (
        <div className="mb-3 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input className="border rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500" placeholder="Search by name" value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="border rounded px-3 py-2 bg-white text-gray-900" value={fCat} onChange={e=>{setFCat(e.target.value); setFSub(""); setFSubj(""); setFExam("");}}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
        </select>
        <select className="border rounded px-3 py-2 bg-white text-gray-900" value={fSub} onChange={e=>{setFSub(e.target.value); setFSubj(""); setFExam("");}}>
          <option value="">All Subcategories</option>
          {subcategories.filter(s=>!fCat || String(s.category_id)===fCat).map(s => <option key={s.subcategory_id} value={s.subcategory_id}>{s.name}</option>)}
        </select>
        <select className="border rounded px-3 py-2 bg-white text-gray-900" value={fSubj} onChange={e=>{setFSubj(e.target.value); setFExam("");}}>
          <option value="">All Subjects</option>
          {subjects.filter(su=>!fSub || String(su.subcategory_id)===fSub).map(su => <option key={su.subject_id} value={su.subject_id}>{su.name}</option>)}
        </select>
        <select className="border rounded px-3 py-2 bg-white text-gray-900" value={fExam} onChange={e=>setFExam(e.target.value)}>
          <option value="">All Exams</option>
          {exams.filter(ex=>!fSubj || String(ex.subject_id)===fSubj).map(ex => <option key={ex.exam_id} value={ex.exam_id}>{ex.name}</option>)}
        </select>
      </div>

      <div className="rounded border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="px-3 py-2">Exam</th>
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">Subcategory</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={5}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={5}>No exams found</td></tr>
            ) : (
              filtered.map(e => {
                const exId = e.exam_id;
                const subjId = e.subject_id;
                const subcatId = subjectSubcatMap[subjId];
                const catId = subcatCatMap[subcatId];
                return (
                  <tr key={exId} className="border-t">
                    <td className="px-3 py-2">{e.name}</td>
                    <td className="px-3 py-2">{subjectMap[subjId]}</td>
                    <td className="px-3 py-2">{subcategoryMap[subcatId]}</td>
                    <td className="px-3 py-2">{categoryMap[catId]}</td>
                    <td className="px-3 py-2">
                      <Link className="text-blue-600 underline" href={`/admin/question-paper/exam/${exId}/edit`}>Edit</Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
