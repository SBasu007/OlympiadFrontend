"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

interface Category { category_id: number; name: string; }
interface Subcategory { subcategory_id: number; name: string; category_id: number; }
interface Subject { subject_id: number; name: string; subcategory_id: number; }

export default function EditSubjectPage(){
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    subcategory_id: "",
  });

  // Load categories, subject and subcategories for the subject's category
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const [catRes, subjRes] = await Promise.all([
          fetch(`${API_BASE}admin/category`),
          fetch(`${API_BASE}admin/subject/${id}`)
        ]);
        if (!catRes.ok) throw new Error("Failed to fetch categories");
        if (!subjRes.ok) throw new Error("Failed to fetch subject");
        const cats: Category[] = await catRes.json();
        const subj: Subject = await subjRes.json();
        // fetch subcategories for subject's category
        // First find category from subcategory
        const subRes = await fetch(`${API_BASE}admin/subcategory`);
        if (!subRes.ok) throw new Error("Failed to fetch subcategories");
        const subsAll: Subcategory[] = await subRes.json();
        // Determine category id from subcategory
        const subDetail = subsAll.find(s => s.subcategory_id === subj.subcategory_id);
        const catId = subDetail?.category_id ? String(subDetail.category_id) : "";
        // Filter subs by derived category
        const subs = catId ? subsAll.filter(s => String(s.category_id) === catId) : subsAll;

        setCategories(cats);
        setSubcategories(subs);
        setForm({ name: subj.name || "", category_id: catId, subcategory_id: String(subj.subcategory_id || "") });
      } catch(e:any){
        setError(e?.message || "Failed to load data");
      } finally { setLoading(false); }
    })();
  }, [id]);

  // When category changes, reload subcategories for that category
  useEffect(() => {
    const loadSubs = async () => {
      if (!form.category_id) { setSubcategories([]); return; }
      try {
        const res = await fetch(`${API_BASE}admin/subcategory?catid=${form.category_id}`);
        if (!res.ok) throw new Error("Failed to fetch subcategories");
        const subs: Subcategory[] = await res.json();
        setSubcategories(subs);
        // if current selected subcategory doesn't belong, reset it
        if (!subs.some(s => String(s.subcategory_id) === form.subcategory_id)) {
          setForm(f => ({ ...f, subcategory_id: "" }));
        }
      } catch(e:any){ setError(e?.message || "Failed to fetch subcategories"); }
    };
    loadSubs();
  }, [form.category_id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setError(null);
    setSuccess(null);
    setForm(prev => ({ ...prev, [name]: value, ...(name === 'category_id' ? { subcategory_id: '' } : {}) }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      setSaving(true);
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("Please login to continue");
      if (!form.subcategory_id) throw new Error("Please select a subcategory");

      const res = await fetch(`${API_BASE}admin/subject/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, subcategory_id: parseInt(form.subcategory_id) })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to update subject');
      setSuccess('Subject updated');
      setTimeout(() => router.push('/admin/subject/all'), 800);
    } catch(e:any){
      setError(e?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-1">Edit Subject</h1>
        <p className="text-green-100">Update details and save changes</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded">{success}</div>}
        <form onSubmit={save} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
            <input name="name" value={form.name} onChange={onChange} className="w-full px-3 py-2 border rounded text-gray-900" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category_id" value={form.category_id} onChange={onChange} className="w-full px-3 py-2 border rounded text-gray-900" required>
              <option value="">Select category</option>
              {categories.map(c => (<option key={c.category_id} value={c.category_id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            <select name="subcategory_id" value={form.subcategory_id} onChange={onChange} className="w-full px-3 py-2 border rounded text-gray-900" required disabled={!form.category_id}>
              <option value="">{form.category_id ? 'Select subcategory' : 'Select category first'}</option>
              {subcategories.map(s => (<option key={s.subcategory_id} value={s.subcategory_id}>{s.name}</option>))}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
           <button
    type="button"
    onClick={() => router.back()}
    className="px-4 py-2 rounded bg-gray-600 text-white border border-gray-500 
               hover:bg-gray-700 active:scale-95 transition-all duration-150 ease-in-out"
  >
    Cancel
  </button>

  <button
    type="submit"
    disabled={saving}
    className={`px-4 py-2 rounded text-white 
               ${saving ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 active:scale-95"} 
               transition-all duration-150 ease-in-out`}
  >
    {saving ? "Saving..." : "Save Changes"}
  </button>
          </div>
        </form>
      </div>
    </div>
  );
}
