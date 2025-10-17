"use client";
import React, { useEffect, useState } from 'react';
import { API_BASE } from '@/lib/api';


interface Category { category_id:number; name:string; }
interface Subcategory { subcategory_id:number; name:string; category_id:number; }
interface Subject { subject_id:number; name:string; subcategory_id:number; }


interface FormState {
  category_id: string;
  subcategory_id: string;
  subject_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  fees: string;
  num_of_ques: string;
  type: string;
  study_mat_url: string;
  duration: string;
  ques_mark: string;
  certificate_bg: File | null;
}


const initialState: FormState = {
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
  certificate_bg: null
};


export default function CreateExamPage(){
  const [form, setForm] = useState<FormState>(initialState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);


  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);


  // Load categories on mount only
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCats(true);
      try {
        const res = await fetch(API_BASE + 'admin/category');
        if(!res.ok) throw new Error('Failed to load categories');
        setCategories(await res.json());
      } catch(e:any){ setError(e.message || 'Failed to load categories'); }
      finally { setLoadingCats(false); }
    };
    loadCategories();
  }, []);


  // Load subcategories when category changes
  useEffect(() => {
    const loadSubs = async () => {
      if(!form.category_id){ setSubcategories([]); return; }
      setLoadingSubs(true);
      try {
        const res = await fetch(API_BASE + `admin/subcategory?catid=${form.category_id}`);
        if(!res.ok) throw new Error('Failed to load subcategories');
        setSubcategories(await res.json());
      } catch(e:any){ setError(e.message || 'Failed to load subcategories'); }
      finally { setLoadingSubs(false); }
    };
    // Reset downstream selections
    setForm(f => ({ ...f, subcategory_id: '', subject_id: '' }));
    setSubjects([]);
    loadSubs();
  }, [form.category_id]);


  // Load subjects when subcategory changes
  useEffect(() => {
    const loadSubjects = async () => {
      if(!form.subcategory_id){ setSubjects([]); return; }
      setLoadingSubjects(true);
      try {
        const res = await fetch(API_BASE + `admin/subject?subcid=${form.subcategory_id}`);
        if(!res.ok) throw new Error('Failed to load subjects');
        setSubjects(await res.json());
      } catch(e:any){ setError(e.message || 'Failed to load subjects'); }
      finally { setLoadingSubjects(false); }
    };
    // Reset subject selection when subcategory switches
    setForm(f => ({ ...f, subject_id: '' }));
    loadSubjects();
  }, [form.subcategory_id]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };


  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(f => ({ ...f, certificate_bg: file }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(null); setSuccess(null);
    try {
  const token = sessionStorage.getItem('auth_token');
      if(!token) throw new Error('Please login to continue');
      if(!form.subject_id) throw new Error('Please select a subject');


      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => {
        if(v !== null && v !== ''){
          if(k === 'certificate_bg' && v instanceof File){ fd.append('file', v); }
          else if(k !== 'certificate_bg') fd.append(k, v as string);
        }
      });


      const res = await fetch(API_BASE + 'admin/exam', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      if(!res.ok){
        const errData = await res.json().catch(()=>({}));
        throw new Error(errData.message || 'Failed to create exam');
      }
      setSuccess('Exam created successfully');
      setForm(initialState);
      setSubcategories([]);
      setSubjects([]);
    } catch(e:any){ setError(e.message || 'Failed to create exam'); }
    finally { setSubmitting(false); }
  };


  if(loadingCats){
    return <div className='flex items-center justify-center min-h-96'><div className='text-center'><div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div><p className='text-gray-600'>Loading categories...</p></div></div>;
  }


  return (
    <div className='space-y-6'>
      <div className='bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white'>
        <h1 className='text-3xl font-bold mb-2'>Create Exam</h1>
        <p className='text-purple-100'>Add a new exam with detailed configuration</p>
      </div>

      <div className='bg-white rounded-lg shadow-md p-6 border border-gray-200'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {success && <div className='p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg'>{success}</div>}
          {error && <div className='p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'>{error}</div>}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Category *</label>
              <select name='category_id' value={form.category_id} onChange={handleChange} required className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900'>
                <option value='' className='text-gray-900'>Select category</option>
                {categories.map(c => <option key={c.category_id} value={c.category_id} className='text-gray-900'>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Subcategory *</label>
              <select name='subcategory_id' value={form.subcategory_id} onChange={handleChange} required disabled={!form.category_id || loadingSubs} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 text-gray-900'>
                <option value='' className='text-gray-900'>{loadingSubs ? 'Loading...' : 'Select subcategory'}</option>
                {subcategories.map(sc => <option key={sc.subcategory_id} value={sc.subcategory_id} className='text-gray-900'>{sc.name}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Subject *</label>
              <select name='subject_id' value={form.subject_id} onChange={handleChange} required disabled={!form.subcategory_id || loadingSubjects} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 text-gray-900'>
                <option value='' className='text-gray-900'>{loadingSubjects ? 'Loading...' : 'Select subject'}</option>
                {subjects.map(s => <option key={s.subject_id} value={s.subject_id} className='text-gray-900'>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Name *</label>
              <input name='name' value={form.name} onChange={handleChange} required className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900' placeholder='Exam name' />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Description</label>
              <textarea name='description' value={form.description} onChange={handleChange} rows={4} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900' placeholder='Short description' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Start Date *</label>
              <input type='date' name='start_date' value={form.start_date} onChange={handleChange} required className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>End Date *</label>
              <input type='date' name='end_date' value={form.end_date} onChange={handleChange} required className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Fees</label>
              <input type='number' name='fees' value={form.fees} onChange={handleChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900' placeholder='e.g. 1000' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Number of Questions</label>
              <input type='number' name='num_of_ques' value={form.num_of_ques} onChange={handleChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900' placeholder='e.g. 50' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Type</label>
              <select name='type' value={form.type} onChange={handleChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900'>
                <option value=''>Select type</option>
                <option value='MCQ'>MCQ</option>
                <option value='Fill in the blanks'>Fill in the blanks</option>
                <option value='True/False'>True/False</option>
                <option value='Descriptive question'>Descriptive question</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Study Material URL</label>
              <input name='study_mat_url' value={form.study_mat_url} onChange={handleChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900' placeholder='https://...' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Duration (minutes)</label>
              <input type='number' name='duration' value={form.duration} onChange={handleChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900' placeholder='e.g. 60' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Marks per Question</label>
              <input type='number' name='ques_mark' value={form.ques_mark} onChange={handleChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900' placeholder='e.g. 2' />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Certificate Background (Image)</label>
              <input type='file' accept='image/*' onChange={handleFile} className='w-full text-sm text-gray-900' />
              {form.certificate_bg && <p className='text-xs text-gray-500 mt-1'>Selected: {form.certificate_bg.name}</p>}
            </div>
          </div>

          <div className='flex justify-end gap-4'>
            <button type='button' onClick={() => { setForm(initialState); setSubcategories([]); setSubjects([]); setError(null); setSuccess(null); }} className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'>Reset</button>
            <button type='submit' disabled={submitting} className='px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50'>{submitting ? 'Creating...' : 'Create Exam'}</button>
          </div>
        </form>
      </div>


      <div className='bg-purple-50 rounded-lg p-4 border border-purple-200'>
        <h3 className='text-lg font-medium text-purple-900 mb-2'>Guidelines</h3>
        <ul className='text-sm text-purple-800 space-y-1'>
          <li>• Select category first to load subcategories, then choose a subject.</li>
          <li>• Dates must be valid; end date should be after start date.</li>
          <li>• Subject selection is mandatory.</li>
          <li>• Optional fields can be left blank if not applicable.</li>
          <li>• Large images may take longer to upload.</li>
        </ul>
      </div>
    </div>
  );
}
