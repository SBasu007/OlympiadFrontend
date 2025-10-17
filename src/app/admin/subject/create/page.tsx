"use client";
import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

interface Category { category_id: number; name: string; promo_url?: string; }
interface Subcategory { subcategory_id: number; name: string; category_id: number; cat_img_url?: string; }

export default function CreateSubjectPage() {
  const [formData, setFormData] = useState({ name: "", category_id: "", subcategory_id: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load categories only on mount
  useEffect(() => {
    const loadCategories = async () => {
      setDataLoading(true);
      try {
        const res = await fetch(API_BASE + "admin/category");
        if(!res.ok) throw new Error("Failed to fetch categories");
        const cats = await res.json();
        setCategories(cats);
      } catch(e:any){
        console.error(e);
        setError(e.message || "Failed to load categories");
      } finally { setDataLoading(false); }
    };
    loadCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubs = async () => {
      if(!formData.category_id){ setSubcategories([]); return; }
      setSubLoading(true);
      try {
        const res = await fetch(API_BASE + `admin/subcategory?catid=${formData.category_id}`);
        if(!res.ok) throw new Error("Failed to fetch subcategories");
        const subs = await res.json();
        setSubcategories(subs);
      } catch(e:any){
        console.error(e);
        setError(e.message || "Failed to fetch subcategories");
      } finally { setSubLoading(false); }
    };
    fetchSubs();
  }, [formData.category_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, ...(name === 'category_id' ? { subcategory_id: '' } : {}) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      if(!formData.subcategory_id) throw new Error("Please select a subcategory");

      const response = await fetch(API_BASE + "admin/subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, subcategory_id: parseInt(formData.subcategory_id) })
      });
      if(!response.ok){
        const errData = await response.json().catch(()=>({}));
        throw new Error(errData.message || "Failed to create subject");
      }
      setFormData({ name: "", category_id: "", subcategory_id: "" });
      setSubcategories([]);
      setSuccess("Subject created successfully!");
    } catch(e:any){ setError(e.message || "Failed to create subject"); }
    finally { setLoading(false); }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Create Subject</h1>
        <p className="text-green-100">Add a new exam subject to your curriculum</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {/* Subject Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Subject Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                placeholder="Enter subject name"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-900 mb-2">
                Category *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label htmlFor="subcategory_id" className="block text-sm font-medium text-gray-900 mb-2">
                Subcategory *
              </label>
              <select
                id="subcategory_id"
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleInputChange}
                required
                disabled={!formData.category_id || subLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 disabled:opacity-50"
              >
                <option value="">{subLoading ? 'Loading...' : 'Select a subcategory'}</option>
                {subcategories.map(sub => (
                  <option key={sub.subcategory_id} value={sub.subcategory_id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => { setFormData({ name: "", category_id: "", subcategory_id: "" }); setSubcategories([]); setError(null); setSuccess(null); }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Subject"}
            </button>
          </div>
        </form>
      </div>

      {/* Form Guidelines */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h3 className="text-lg font-medium text-green-900 mb-2">Guidelines</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Select a category to load its subcategories</li>
          <li>• Subject names should be clear and descriptive</li>
          <li>• Subcategory dropdown appears only after selecting a category</li>
          <li>• Ensure the correct subcategory as it may affect exam organization</li>
        </ul>
      </div>
    </div>
  );
}