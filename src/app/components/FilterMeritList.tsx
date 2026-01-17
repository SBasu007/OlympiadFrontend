'use client';

import { useState, useEffect } from 'react';
import { apiFetch, Category, SubCategory, Subject, Exam, MeritListResult } from '@/lib/api';

interface FilterMeritListProps {
  onResultsChange: (results: MeritListResult[]) => void;
}

export default function FilterMeritList({ onResultsChange }: FilterMeritListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedPercentageBracket, setSelectedPercentageBracket] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Percentage bracket options
  const percentageBrackets = [
    { label: '60-69%', min: 60, max: 69 },
    { label: '70-79%', min: 70, max: 79 },
    { label: '80-89%', min: 80, max: 89 },
    { label: '90-100%', min: 90, max: 100 },
  ];

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch<Category[]>('admin/category');
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      setSelectedSubcategory('');
      return;
    }

    const fetchSubcategories = async () => {
      try {
        const data = await apiFetch<SubCategory[]>(`admin/subcategory`);
        const filtered = Array.isArray(data) 
          ? data.filter(sc => sc.cat_id === parseInt(selectedCategory))
          : [];
        setSubcategories(filtered);
      } catch (err) {
        console.error('Error fetching subcategories:', err);
        setError('Failed to load subcategories');
      }
    };
    fetchSubcategories();
  }, [selectedCategory]);

  // Fetch subjects when subcategory changes
  useEffect(() => {
    if (!selectedSubcategory) {
      setSubjects([]);
      setSelectedSubject('');
      return;
    }

    const fetchSubjects = async () => {
      try {
        const data = await apiFetch<Subject[]>(`admin/subject`);
        const filtered = Array.isArray(data)
          ? data.filter(s => s.subcategory_id === parseInt(selectedSubcategory))
          : [];
        setSubjects(filtered);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects');
      }
    };
    fetchSubjects();
  }, [selectedSubcategory]);

  // Fetch exams when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setExams([]);
      setSelectedExam('');
      return;
    }

    const fetchExams = async () => {
      try {
        const data = await apiFetch<Exam[]>(`admin/exam`);
        const filtered = Array.isArray(data)
          ? data.filter(e => e.subject_id === parseInt(selectedSubject))
          : [];
        setExams(filtered);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load exams');
      }
    };
    fetchExams();
  }, [selectedSubject]);

  const handleFilter = async () => {
    if (!selectedExam) {
      setError('Please select an exam');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build query string with filters
      const params = new URLSearchParams();
      params.append('exam_id', selectedExam);
      
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedSubcategory) params.append('subcategory_id', selectedSubcategory);
      if (selectedSubject) params.append('subject_id', selectedSubject);
      if (selectedPercentageBracket) {
        const bracket = percentageBrackets.find(b => b.label === selectedPercentageBracket);
        if (bracket) {
          params.append('percentage_min', bracket.min.toString());
          params.append('percentage_max', bracket.max.toString());
        }
      }
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const results = await apiFetch<MeritListResult[]>(`admin/merit-list?${params.toString()}`);
      onResultsChange(Array.isArray(results) ? results : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch merit list');
      onResultsChange([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedSubject('');
    setSelectedExam('');
    setSelectedPercentageBracket('');
    setDateFrom('');
    setDateTo('');
    setError('');
    onResultsChange([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Filter Merit List</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Subcategory
          </label>
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={!selectedCategory}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((subcat) => (
              <option key={subcat.subcategory_id} value={subcat.subcategory_id}>
                {subcat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedSubcategory}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Subject</option>
            {subjects.map((subj) => (
              <option key={subj.subject_id} value={subj.subject_id}>
                {subj.name}
              </option>
            ))}
          </select>
        </div>

        {/* Exam Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Exam
          </label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            disabled={!selectedSubject}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.exam_id} value={exam.exam_id}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Percentage Bracket Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Percentage Bracket
          </label>
          <select
            value={selectedPercentageBracket}
            onChange={(e) => setSelectedPercentageBracket(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Percentages</option>
            {percentageBrackets.map((bracket) => (
              <option key={bracket.label} value={bracket.label}>
                {bracket.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={handleReset}
          className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleFilter}
          disabled={loading || !selectedExam}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Apply Filters'}
        </button>
      </div>
    </div>
  );
}
