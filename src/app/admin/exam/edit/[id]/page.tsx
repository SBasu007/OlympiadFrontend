"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/api';

interface Category { category_id:number; name:string; }
interface Subcategory { subcategory_id:number; name:string; category_id:number; }
interface Subject { subject_id:number; name:string; subcategory_id:number; }
interface Exam {
  exam_id:number;
  subject_id:number;
  name:string;
  description?:string;
  start_date:string;
  end_date:string;
  fees?:number;
  num_of_ques?:number;
  type?:string;
  study_mat_url?:string;
  duration?:number;
  ques_mark?:number;
  certificate_bg?:string;
}

export default function EditExamPage(){
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const hydratedRef = useRef(false);
  const userChangedCategoryRef = useRef(false);
  const userChangedSubcategoryRef = useRef(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  const [form, setForm] = useState({
    category_id: '',
    subcategory_id: '',
    subject_id: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    fees: '',
    num_of_ques: '',
    type: '',
    study_mat_url: '',
    duration: '',
    ques_mark: '',
    certificate_bg: null as File | null,
    existing_certificate: '' as string | undefined
  });

  useEffect(() => {
    if(!id) return;
    (async () => {
      try {
        setLoading(true);
        const [catRes, subRes, subjRes, examRes] = await Promise.all([
          fetch(API_BASE + 'admin/category'),
          fetch(API_BASE + 'admin/subcategory'),
          fetch(API_BASE + 'admin/subject'),
          fetch(API_BASE + 'admin/exam/' + id)
        ]);
        if(!catRes.ok || !subRes.ok || !subjRes.ok || !examRes.ok) throw new Error('Failed to load data');
        const cats:Category[] = await catRes.json();
        const subsAll:Subcategory[] = await subRes.json();
        const subjectsAll:Subject[] = await subjRes.json();
        const exam:Exam = await examRes.json();

        // derive category/subcategory from exam.subject_id
        const subject = subjectsAll.find(s => s.subject_id === exam.subject_id);
        const sub = subject ? subsAll.find(sc => sc.subcategory_id === subject.subcategory_id) : undefined;
        const catId = sub ? String(sub.category_id) : '';
        const subId = subject ? String(subject.subcategory_id) : '';

        setCategories(cats);
        setSubcategories(catId ? subsAll.filter(sc => String(sc.category_id) === catId) : []);
        setSubjects(subId ? subjectsAll.filter(s => String(s.subcategory_id) === subId) : []);
        setForm(f => ({
          ...f,
          category_id: catId,
          subcategory_id: subId,
          subject_id: String(exam.subject_id || ''),
          name: exam.name || '',
          description: exam.description || '',
          start_date: exam.start_date ? exam.start_date.substring(0,10) : '',
          end_date: exam.end_date ? exam.end_date.substring(0,10) : '',
          fees: exam.fees?.toString() || '',
          num_of_ques: exam.num_of_ques?.toString() || '',
          type: exam.type || '',
          study_mat_url: exam.study_mat_url || '',
          duration: exam.duration?.toString() || '',
          ques_mark: exam.ques_mark?.toString() || '',
          certificate_bg: null,
          existing_certificate: exam.certificate_bg
        }));
        // mark hydrated so cascade effects don't wipe initial selections
        hydratedRef.current = true;
      } catch(e:any){ setError(e?.message || 'Failed to load data'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  // cascade loaders
  useEffect(()=>{
    if(!hydratedRef.current || !userChangedCategoryRef.current){
      return;
    }
    const loadSubs = async () => {
      if(!form.category_id){ setSubcategories([]); return; }
      const res = await fetch(API_BASE + `admin/subcategory?catid=${form.category_id}`);
      if(res.ok){ setSubcategories(await res.json()); }
    };
    loadSubs();
    setForm(f => ({ ...f, subcategory_id: '', subject_id: '' }));
  }, [form.category_id]);

  useEffect(()=>{
    if(!hydratedRef.current || !userChangedSubcategoryRef.current){
      return;
    }
    const loadSubjects = async () => {
      if(!form.subcategory_id){ setSubjects([]); return; }
      const res = await fetch(API_BASE + `admin/subject?subcid=${form.subcategory_id}`);
      if(res.ok){ setSubjects(await res.json()); }
    };
    loadSubjects();
    setForm(f => ({ ...f, subject_id: '' }));
  }, [form.subcategory_id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if(name === 'category_id'){
      userChangedCategoryRef.current = true;
    }
    if(name === 'subcategory_id'){
      userChangedSubcategoryRef.current = true;
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(f => ({ ...f, certificate_bg: file }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null);
    try {
      setSaving(true);
      const token = sessionStorage.getItem('auth_token');
      if(!token) throw new Error('Please login to continue');
      if(!form.subject_id) throw new Error('Please select a subject');

      const fd = new FormData();
      // Compose body matching backend fields
      fd.append('subject_id', form.subject_id);
      fd.append('name', form.name);
      if(form.description) fd.append('description', form.description);
      if(form.start_date) fd.append('start_date', form.start_date);
      if(form.end_date) fd.append('end_date', form.end_date);
      if(form.fees) fd.append('fees', form.fees);
      if(form.num_of_ques) fd.append('num_of_ques', form.num_of_ques);
      if(form.type) fd.append('type', form.type);
      if(form.study_mat_url) fd.append('study_mat_url', form.study_mat_url);
      if(form.duration) fd.append('duration', form.duration);
      if(form.ques_mark) fd.append('ques_mark', form.ques_mark);
      if(form.certificate_bg) fd.append('file', form.certificate_bg);

      const res = await fetch(API_BASE + 'admin/exam/' + id, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(data?.message || 'Failed to update exam');
      setSuccess('Exam updated');
      setTimeout(() => router.push('/admin/exam/all'), 800);
    } catch(e:any){ setError(e?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  if(loading) return <div>Loading...</div>;

  return (
    <div className='space-y-6'>
      <div className='bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white'>
        <h1 className='text-3xl font-bold mb-1'>Edit Exam</h1>
        <p className='text-purple-100'>Update details and save changes</p>
      </div>

      <div className='bg-white rounded-lg shadow-md p-6 border border-gray-200'>
        {error && <div className='mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded'>{error}</div>}
        {success && <div className='mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded'>{success}</div>}
        <form onSubmit={save} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Category *</label>
              <select name='category_id' value={form.category_id} onChange={onChange} required className='w-full px-3 py-2 border rounded text-gray-900'>
                <option value=''>Select category</option>
                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Subcategory *</label>
              <select name='subcategory_id' value={form.subcategory_id} onChange={onChange} required disabled={!form.category_id} className='w-full px-3 py-2 border rounded text-gray-900 disabled:opacity-50'>
                <option value=''>{form.category_id ? 'Select subcategory' : 'Select category first'}</option>
                {subcategories.map(sc => <option key={sc.subcategory_id} value={sc.subcategory_id}>{sc.name}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Subject *</label>
              <select name='subject_id' value={form.subject_id} onChange={onChange} required disabled={!form.subcategory_id} className='w-full px-3 py-2 border rounded text-gray-900 disabled:opacity-50'>
                <option value=''>{form.subcategory_id ? 'Select subject' : 'Select subcategory first'}</option>
                {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Name *</label>
              <input name='name' value={form.name} onChange={onChange} required className='w-full px-3 py-2 border rounded text-gray-900' />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Description</label>
              <textarea name='description' value={form.description} onChange={onChange} rows={4} className='w-full px-3 py-2 border rounded text-gray-900' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Start Date *</label>
              <input type='date' name='start_date' value={form.start_date} onChange={onChange} required className='w-full px-3 py-2 border rounded text-gray-900' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>End Date *</label>
              <input type='date' name='end_date' value={form.end_date} onChange={onChange} required className='w-full px-3 py-2 border rounded text-gray-900' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Fees</label>
              <input type='number' name='fees' value={form.fees} onChange={onChange} className='w-full px-3 py-2 border rounded text-gray-900' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Number of Questions</label>
              <input type='number' name='num_of_ques' value={form.num_of_ques} onChange={onChange} className='w-full px-3 py-2 border rounded text-gray-900' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Type</label>
              <select name='type' value={form.type} onChange={onChange} className='w-full px-3 py-2 border rounded text-gray-900'>
                {/* include current value as option if it's non-standard */}
                {form.type && !['MCQ','Fill in the blanks','True/False','Descriptive question'].includes(form.type) && (
                  <option value={form.type}>{form.type}</option>
                )}
                <option value=''>Select type</option>
                <option value='MCQ'>MCQ</option>
                <option value='Fill in the blanks'>Fill in the blanks</option>
                <option value='True/False'>True/False</option>
                <option value='Descriptive question'>Descriptive question</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Study Material URL</label>
              <input name='study_mat_url' value={form.study_mat_url} onChange={onChange} className='w-full px-3 py-2 border rounded text-gray-900' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Duration (minutes)</label>
              <input type='number' name='duration' value={form.duration} onChange={onChange} className='w-full px-3 py-2 border rounded text-gray-900' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Marks per Question</label>
              <input type='number' name='ques_mark' value={form.ques_mark} onChange={onChange} className='w-full px-3 py-2 border rounded text-gray-900' />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Certificate Background (Image)</label>
              {form.existing_certificate && (
                <div className='mb-2'>
                  <img src={form.existing_certificate} alt='Certificate BG' className='h-24 w-auto rounded border object-contain' />
                </div>
              )}
              <input type='file' accept='image/*' onChange={onFile} className='w-full text-sm text-gray-900' />
              {form.certificate_bg && <p className='text-xs text-gray-500 mt-1'>Selected: {form.certificate_bg.name}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3">
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
               ${saving 
                 ? "bg-purple-400 cursor-not-allowed" 
                 : "bg-purple-600 hover:bg-purple-700 active:scale-95"} 
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
