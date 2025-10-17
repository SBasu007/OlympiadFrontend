"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  // enriched
  subjectName?:string;
  subcategory_id?:number;
  subcategoryName?:string;
  category_id?:number;
  categoryName?:string;
}

export default function AllExamsPage(){
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeAction, setActiveAction] = useState<{ id:number; type:'edit'|'delete' }|null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [catRes, subRes, subjRes, examRes] = await Promise.all([
          fetch(API_BASE + 'admin/category'),
            fetch(API_BASE + 'admin/subcategory'),
            fetch(API_BASE + 'admin/subject'),
            fetch(API_BASE + 'admin/exam')
        ]);
        if(!catRes.ok || !subRes.ok || !subjRes.ok || !examRes.ok) throw new Error('Failed to fetch data');
        const catData:Category[] = await catRes.json();
        const subData:Subcategory[] = await subRes.json();
        const subjData:Subject[] = await subjRes.json();
        const examData:Exam[] = await examRes.json();

        const categoryMap = new Map<number,string>();
        catData.forEach(c => categoryMap.set(c.category_id, c.name));
        const subMap = new Map<number, { name:string; category_id:number }>();
        subData.forEach(s => subMap.set(s.subcategory_id, { name:s.name, category_id:s.category_id }));
        const subjectMap = new Map<number, { name:string; subcategory_id:number }>();
        subjData.forEach(s => subjectMap.set(s.subject_id, { name:s.name, subcategory_id:s.subcategory_id }));

        const enriched = examData.map(e => {
          const subj = subjectMap.get(e.subject_id);
          const subInfo = subj ? subMap.get(subj.subcategory_id) : undefined;
          const catName = subInfo ? categoryMap.get(subInfo.category_id) : undefined;
          return {
            ...e,
            subjectName: subj?.name || 'Unknown Subject',
            subcategory_id: subj?.subcategory_id,
            subcategoryName: subInfo?.name || 'Unknown Subcategory',
            category_id: subInfo?.category_id,
            categoryName: catName || 'Unknown Category'
          };
        });

        setCategories(catData);
        setSubcategories(subData);
        setSubjects(subjData);
        setExams(enriched);
      } catch(e){ console.error(e);} finally { setLoading(false); }
    };
    load();
  }, []);

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || e.category_id?.toString() === filterCategory;
    const matchesSubcategory = !filterSubcategory || e.subcategory_id?.toString() === filterSubcategory;
    const matchesSubject = !filterSubject || e.subject_id.toString() === filterSubject;
    return matchesSearch && matchesCategory && matchesSubcategory && matchesSubject;
  });

  const totalItems = filteredExams.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageSlice = filteredExams.slice(startIndex, endIndex);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterCategory, filterSubcategory, filterSubject, itemsPerPage]);

  const handleDelete = async (id:number) => {
    setActiveAction({ id, type: 'delete' });
    if(!confirm('Are you sure you want to delete this exam?')){ setActiveAction(null); return; }
    try {
      const token = sessionStorage.getItem('auth_token');
      if(!token){ alert('Please login to continue'); setActiveAction(null); return; }
      const res = await fetch(API_BASE + 'admin/exam/' + id, { method:'DELETE', headers:{ Authorization: `Bearer ${token}` } });
      if(!res.ok){ const d = await res.json().catch(()=>({})); throw new Error(d.message || 'Failed to delete exam'); }
      setExams(prev => prev.filter(e => e.exam_id !== id));
      alert('Exam deleted successfully');
    } catch(e:any){ console.error(e); alert(e.message || 'Failed to delete exam'); }
    finally { setActiveAction(null); }
  };

  if(loading){
    return <div className='flex items-center justify-center min-h-96'><div className='text-center'><div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div><p className='text-gray-600'>Loading exams...</p></div></div>;
  }

  return (
    <div className='space-y-6'>
      <div className='bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white'>
        <h1 className='text-3xl font-bold mb-2'>All Exams</h1>
        <p className='text-purple-100'>Manage and review all created exams</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-6 rounded-lg shadow-md border border-gray-200'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Search</label>
          <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder='Search exams...' className='w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500' />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Category</label>
          <select value={filterCategory} onChange={e=>{ setFilterCategory(e.target.value); setFilterSubcategory(''); setFilterSubject(''); }} className='w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'>
            <option value=''>All</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Subcategory</label>
          <select value={filterSubcategory} onChange={e=>{ setFilterSubcategory(e.target.value); setFilterSubject(''); }} className='w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'>
            <option value=''>All</option>
            {subcategories.filter(s => !filterCategory || s.category_id.toString() === filterCategory).map(s => <option key={s.subcategory_id} value={s.subcategory_id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Subject</label>
          <select value={filterSubject} onChange={e=>setFilterSubject(e.target.value)} className='w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'>
            <option value=''>All</option>
            {subjects.filter(s => !filterSubcategory || s.subcategory_id.toString() === filterSubcategory).map(s => <option key={s.subject_id} value={s.subject_id}>{s.name}</option>)}
          </select>
        </div>
        <div className='flex items-end'>
          <Link href='/admin/exam/create' className='w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 text-center'>Create New</Link>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white rounded-lg shadow-md p-4 border border-gray-200'>
          <h3 className='text-sm font-medium text-gray-600'>Total Exams</h3>
          <p className='text-2xl font-bold text-purple-600'>{exams.length}</p>
        </div>
        <div className='bg-white rounded-lg shadow-md p-4 border border-gray-200'>
          <h3 className='text-sm font-medium text-gray-600'>Filtered Results</h3>
          <p className='text-2xl font-bold text-indigo-600'>{filteredExams.length}</p>
        </div>
        <div className='bg-white rounded-lg shadow-md p-4 border border-gray-200'>
          <h3 className='text-sm font-medium text-gray-600'>Current Page</h3>
          <p className='text-2xl font-bold text-fuchsia-600'>{currentPage} of {totalPages}</p>
        </div>
        <div className='bg-white rounded-lg shadow-md p-4 border border-gray-200'>
          <h3 className='text-sm font-medium text-gray-600'>Showing</h3>
          <p className='text-2xl font-bold text-orange-600'>{Math.min(startIndex + 1, totalItems)}-{Math.min(endIndex, totalItems)}</p>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Exam</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Subject</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Subcategory</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Category</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Dates</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Questions</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Type</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {pageSlice.map(exam => (
                <tr key={exam.exam_id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>{exam.name}</div>
                    {exam.fees && <div className='text-xs text-gray-500'>Fees: {exam.fees}</div>}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{exam.subjectName}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{exam.subcategoryName}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{exam.categoryName}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    <div>{exam.start_date}</div>
                    <div className='text-xs text-gray-500'>{exam.end_date}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{exam.num_of_ques || '-'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{exam.type || '-'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2'>
                    <Link
                      href={`/admin/exam/edit/${exam.exam_id}`}
                      onClick={() => setActiveAction({ id: exam.exam_id, type: 'edit' })}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        activeAction?.id === exam.exam_id && activeAction?.type === 'edit'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                      }`}
                    >
                      {activeAction?.id === exam.exam_id && activeAction?.type === 'edit' ? 'Editing...' : 'Edit'}
                    </Link>
                    <button
                      onClick={()=>handleDelete(exam.exam_id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        activeAction?.id === exam.exam_id && activeAction?.type === 'delete'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {activeAction?.id === exam.exam_id && activeAction?.type === 'delete' ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200'>
            <div className='flex-1 flex justify-between sm:hidden'>
              <button onClick={()=>setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1} className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'>Previous</button>
              <button onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'>Next</button>
            </div>
            <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-700'>Showing <span className='font-medium'>{Math.min(startIndex+1,totalItems)}</span> to <span className='font-medium'>{Math.min(endIndex,totalItems)}</span> of <span className='font-medium'>{totalItems}</span> results</p>
              </div>
              <div>
                <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px' aria-label='Pagination'>
                  <button onClick={()=>setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1} className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'>Previous</button>
                  {Array.from({length: Math.min(totalPages,7)}, (_,i)=>{
                    let pageNumber:number;
                    if(totalPages<=7) pageNumber=i+1; else if(currentPage<=4) pageNumber=i+1; else if(currentPage>=totalPages-3) pageNumber=totalPages-6+i; else pageNumber=currentPage-3+i;
                    return <button key={pageNumber} onClick={()=>setCurrentPage(pageNumber)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage===pageNumber? 'z-10 bg-purple-50 border-purple-500 text-purple-600':'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>{pageNumber}</button>;
                  })}
                  <button onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'>Next</button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {filteredExams.length===0 && !loading && (
          <div className='text-center py-12'>
            <div className='text-gray-500'>
              <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'/>
              </svg>
              <h3 className='mt-2 text-sm font-medium text-gray-900'>No exams found</h3>
              <p className='mt-1 text-sm text-gray-500'>Get started by creating a new exam.</p>
              <div className='mt-4'>
                <Link href='/admin/exam/create' className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700'>Create Exam</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
