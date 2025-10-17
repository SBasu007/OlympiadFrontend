"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";

interface Category {
  category_id: number;
  name: string;
}

interface Subcategory {
  subcategory_id: number;
  name: string;
  category_id: number;
  categoryName?: string;
}

interface Subject {
  subject_id: number;
  name: string;
  subcategory_id: number;
  subcategoryName?: string;
  categoryName?: string;
  category_id?: number; // derived for filtering ease
}

export default function AllSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubcategory, setFilterSubcategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeAction, setActiveAction] = useState<{ id: number; type: "edit" | "delete" } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, subRes, subjRes] = await Promise.all([
          fetch(API_BASE + "admin/category"),
          fetch(API_BASE + "admin/subcategory"),
          fetch(API_BASE + "admin/subject")
        ]);
        if (!catRes.ok) throw new Error("Failed to fetch categories");
        if (!subRes.ok) throw new Error("Failed to fetch subcategories");
        if (!subjRes.ok) throw new Error("Failed to fetch subjects");

        const catData: Category[] = await catRes.json();
        const subData: Subcategory[] = await subRes.json();
        const subjData: Subject[] = await subjRes.json();

        // Build lookup maps
        const categoryMap = new Map<number, string>();
        catData.forEach(c => categoryMap.set(c.category_id, c.name));

        const subcategoryMap = new Map<number, { name: string; category_id: number }>();
        subData.forEach(s => subcategoryMap.set(s.subcategory_id, { name: s.name, category_id: s.category_id }));

        const enrichedSubjects: Subject[] = subjData.map(s => {
          const subInfo = subcategoryMap.get(s.subcategory_id);
          const categoryName = subInfo ? categoryMap.get(subInfo.category_id) : undefined;
          return {
            ...s,
            subcategoryName: subInfo?.name || "Unknown Subcategory",
            category_id: subInfo?.category_id,
            categoryName: categoryName || "Unknown Category"
          };
        });

        setCategories(catData);
        setSubcategories(subData.map(s => ({ ...s, categoryName: categoryMap.get(s.category_id) })));
        setSubjects(enrichedSubjects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || subject.category_id?.toString() === filterCategory;
    const matchesSubcategory = !filterSubcategory || subject.subcategory_id.toString() === filterSubcategory;
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  // Pagination
  const totalItems = filteredSubjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubjects = filteredSubjects.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterCategory, filterSubcategory, itemsPerPage]);

  const handleDelete = async (id: number) => {
    setActiveAction({ id, type: "delete" });
    if (!confirm("Are you sure you want to delete this subject?")) {
      setActiveAction(null);
      return;
    }

    try {
      const token = sessionStorage.getItem("auth_token");
      if (!token) {
        alert("Please login to continue");
        setActiveAction(null);
        return;
      }
      const res = await fetch(`${API_BASE}admin/subject/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete subject");
      }
      setSubjects(prev => prev.filter(s => s.subject_id !== id));
      alert("Subject deleted successfully");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to delete subject");
    } finally {
      setActiveAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">All Subjects</h1>
        <p className="text-green-100">Manage and organize exam subjects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Total Subjects</h3>
          <p className="text-2xl font-bold text-green-600">{subjects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Filtered Results</h3>
            <p className="text-2xl font-bold text-teal-600">{filteredSubjects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Current Page</h3>
          <p className="text-2xl font-bold text-purple-600">{currentPage} of {totalPages}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Showing</h3>
          <p className="text-2xl font-bold text-orange-600">{Math.min(startIndex + 1, totalItems)}-{Math.min(endIndex, totalItems)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search subjects..."
              className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={e => { setFilterCategory(e.target.value); setFilterSubcategory(""); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            <select
              value={filterSubcategory}
              onChange={e => setFilterSubcategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Subcategories</option>
              {subcategories
                .filter(s => !filterCategory || s.category_id.toString() === filterCategory)
                .map(s => (
                  <option key={s.subcategory_id} value={s.subcategory_id}>{s.name} ({s.categoryName})</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
            <select
              value={itemsPerPage}
              onChange={e => setItemsPerPage(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <div className="flex items-end">
            <Link href="/admin/subject/create" className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 text-center">
              Create New
            </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSubjects.map(subject => (
                <tr key={subject.subject_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.subcategoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.categoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/subject/edit/${subject.subject_id}`}
                      onClick={() => setActiveAction({ id: subject.subject_id, type: "edit" })}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        activeAction?.id === subject.subject_id && activeAction?.type === "edit"
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {activeAction?.id === subject.subject_id && activeAction?.type === "edit" ? "Editing..." : "Edit"}
                    </Link>
                    <button
                      onClick={() => handleDelete(subject.subject_id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        activeAction?.id === subject.subject_id && activeAction?.type === "delete"
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {activeAction?.id === subject.subject_id && activeAction?.type === "delete" ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{Math.min(startIndex + 1, totalItems)}</span> to <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNumber: number;
                    if (totalPages <= 7) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 4) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = currentPage - 3 + i;
                    }
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber ? 'z-10 bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {filteredSubjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new subject.</p>
              <div className="mt-4">
                <Link href="/admin/subject/create" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                  Create Subject
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
