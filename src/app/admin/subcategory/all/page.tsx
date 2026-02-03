"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";

interface Category {
  category_id: number;
  name: string;
  promo_url?: string;
}

interface Subcategory {
  subcategory_id: number;
  name: string;
  category_id: number;
  cat_img_url?: string;
  categoryName?: string; // Will be populated after fetching categories
}

export default function AllSubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeAction, setActiveAction] = useState<{ id: number; type: "edit" | "delete" } | null>(null);

  // Fetch categories and subcategories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      console.log(API_BASE);
      try {
        // 🚀 OPTIMIZED: Use aggregated endpoint
        const response = await fetch(API_BASE + "admin/dashboard-data");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        // Create a map for quick category lookup
        const categoryMap = new Map();
        data.categories.forEach((cat: Category) => {
          categoryMap.set(cat.category_id, cat.name);
        });

        // Add category names to subcategories
        const enrichedSubcategories = data.subcategories.map((sub: Subcategory) => ({
          ...sub,
          categoryName: categoryMap.get(sub.category_id) || "Unknown Category"
        }));

        setCategories(data.categories);
        setSubcategories(enrichedSubcategories);
      } catch (err: any) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter subcategories
  const filteredSubcategories = subcategories.filter(subcategory => {
    const matchesSearch = subcategory.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "" || subcategory.category_id.toString() === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalItems = filteredSubcategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubcategories = filteredSubcategories.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  const handleDelete = async (id: number) => {
    setActiveAction({ id, type: "delete" });
    if (!confirm("Are you sure you want to delete this subcategory?")) {
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

      const response = await fetch(`${API_BASE}admin/subcategory/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove from local state
        setSubcategories(prev => prev.filter(sub => sub.subcategory_id !== id));
        alert("Subcategory deleted successfully");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete subcategory");
      }
    } catch (err: any) {
      console.error("Error deleting subcategory:", err);
      alert(err.message || "Failed to delete subcategory");
    }
      setActiveAction(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subcategories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">All Subcategories</h1>
        <p className="text-purple-100">Manage and organize your exam subcategories</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Total Subcategories</h3>
          <p className="text-2xl font-bold text-blue-600">{subcategories.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Filtered Results</h3>
          <p className="text-2xl font-bold text-green-600">{filteredSubcategories.length}</p>
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

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subcategories..."
              className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <div className="flex items-end">
            <Link
              href="/admin/subcategory/create"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 text-center"
            >
              Create New
            </Link>
          </div>
        </div>
      </div>

      {/* Subcategories Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSubcategories.map((subcategory) => (
                <tr key={subcategory.subcategory_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subcategory.categoryName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subcategory.cat_img_url ? (
                      <div className="flex items-center">
                        <img 
                          src={subcategory.cat_img_url} 
                          alt={subcategory.name}
                          className="h-10 w-10 rounded object-cover mr-2"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/subcategory/edit/${subcategory.subcategory_id}`}
                      onClick={() => setActiveAction({ id: subcategory.subcategory_id, type: "edit" })}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        activeAction?.id === subcategory.subcategory_id && activeAction?.type === "edit"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                    >
                      {activeAction?.id === subcategory.subcategory_id && activeAction?.type === "edit" ? "Editing..." : "Edit"}
                    </Link>
                    <button
                      onClick={() => handleDelete(subcategory.subcategory_id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        activeAction?.id === subcategory.subcategory_id && activeAction?.type === "delete"
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {activeAction?.id === subcategory.subcategory_id && activeAction?.type === "delete" ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{Math.min(startIndex + 1, totalItems)}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNumber;
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
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {filteredSubcategories.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No subcategories found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new subcategory.</p>
              <div className="mt-4">
                <Link
                  href="/admin/subcategory/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Subcategory
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}