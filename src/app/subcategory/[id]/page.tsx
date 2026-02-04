"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

interface Subject {
  subject_id: number;
  subcategory_id: number;
  name: string;
}

interface SubCategory {
  subcategory_id: number;
  category_id: number;
  name: string;
  cat_img_url?: string;
}

export default function SubcategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subcategoryId = params.id as string;
  const categoryName = searchParams.get('category') || '';
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subcategory, setSubcategory] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subjects
        const subjectsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}admin/subject?subcid=${subcategoryId}`
        );
        if (subjectsResponse.ok) {
          const subjectsData = await subjectsResponse.json();
          setSubjects(subjectsData);
        }

        // Fetch subcategory details
        const subcategoryResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}admin/subcategory/${subcategoryId}`
        );
        if (subcategoryResponse.ok) {
          const subcategoryData = await subcategoryResponse.json();
          setSubcategory(subcategoryData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (subcategoryId) {
      fetchData();
    }
  }, [subcategoryId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Breadcrumb */}
        {/* <nav className="mb-6 flex items-center space-x-2 text-sm">
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            Home
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600">{subcategory?.name || "Loading..."}</span>
        </nav> */}

        {/* Header */}
        <div className="mb-6">
          {categoryName && (
            <div className="inline-flex items-center gap-2 mb-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              {categoryName}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {subcategory?.name || "Loading..."}
          </h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Subjects Grid */}
        {!loading && subjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subjects.map((subject) => (
              <Link
                key={subject.subject_id}
                href={`/subject/${subject.subject_id}`}
                className="group bg-[#f3a954] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#f3a954] hover:border-[#e09843]"
              >
                <div className="p-5">
                  {/* Subject Name */}
                  <h3 className="text-base font-semibold text-white text-center group-hover:scale-105 transition-transform">
                    {subject.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && subjects.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg 
                className="w-8 h-8 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subjects Available</h3>
            <p className="text-gray-600 mb-6">There are no subjects in this category yet.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
