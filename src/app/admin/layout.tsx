"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSubcategoryDropdownOpen, setIsSubcategoryDropdownOpen] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false); // NEW
  const [isQPDropdownOpen, setIsQPDropdownOpen] = useState(false);
  const [isAdminUsersOpen, setIsAdminUsersOpen] = useState(false);
  const [isUserExamDropdownOpen, setIsUserExamDropdownOpen] = useState(false);
  const [isRequestReExamDropdownOpen, setIsRequestReExamDropdownOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Redirect to login if no tab session
  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') : null;
    if (!token) {
      router.replace('/auth/admin');
      return;
    }
    setReady(true);
  }, [router]);

  const handleLogout = () => {
    // Remove the authentication token
    sessionStorage.removeItem("auth_token");
    
    // Clear any other user-related data if exists
    sessionStorage.removeItem("user_data");
    
    // Redirect to login page
    router.replace("/auth/admin");
  };

  const toggleSubcategoryDropdown = () => {
    setIsSubcategoryDropdownOpen(!isSubcategoryDropdownOpen);
  };

  const toggleSubjectDropdown = () => {
    setIsSubjectDropdownOpen(!isSubjectDropdownOpen);
  };

  const toggleExamDropdown = () => {
    setIsExamDropdownOpen(!isExamDropdownOpen); // NEW
  };
  const toggleQPDropdown = () => {
    setIsQPDropdownOpen(!isQPDropdownOpen);
  };

  const toggleUserExamDropdown = () => {
    setIsUserExamDropdownOpen(!isUserExamDropdownOpen);
  };

  const toggleRequestReExamDropdown = () => {
    setIsRequestReExamDropdownOpen(!isRequestReExamDropdownOpen);
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen font-sans">
      {/* Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-56 border-r bg-gray-50 p-4 flex flex-col">
        <div className="text-xl font-semibold mb-2">Admin</div>
        <nav className="flex flex-col gap-1 overflow-y-auto">
          {/* Admin Users (on top) */}
          <div className="relative">
            <button
              onClick={() => setIsAdminUsersOpen(!isAdminUsersOpen)}
              className={`w-full rounded px-3 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                pathname.includes('/admin/admin-users') ? "bg-teal-600 text-white" : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span>Admin Users</span>
              <svg className={`w-4 h-4 transition-transform ${isAdminUsersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isAdminUsersOpen && (
              <div className="mt-1 ml-4 space-y-1">
                <Link
                  href="/admin/admin-users/create"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/admin-users/create' ? "bg-teal-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  Create Admin
                </Link>
                <Link
                  href="/admin/admin-users/all"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/admin-users/all' ? "bg-teal-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  All Admins
                </Link>
              </div>
            )}
          </div>
          {/* Exam Sub Category with Dropdown */}
          <div className="relative">
            <button
              onClick={toggleSubcategoryDropdown}
              className={`w-full rounded px-3 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                pathname.includes('/admin/subcategory') ? "bg-blue-600 text-white" : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span>Exam Sub Category</span>
              <svg
                className={`w-4 h-4 transition-transform ${isSubcategoryDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Subcategory Dropdown Menu */}
            {isSubcategoryDropdownOpen && (
              <div className="mt-1 ml-4 space-y-1">
                <Link
                  href="/admin/subcategory/create"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/subcategory/create' ? "bg-blue-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  Create Subcategory
                </Link>
                <Link
                  href="/admin/subcategory/all"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/subcategory/all' ? "bg-blue-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  All Subcategory
                </Link>
              </div>
            )}
          </div>

          {/* Exam Subject with Dropdown */}
          <div className="relative">
            <button
              onClick={toggleSubjectDropdown}
              className={`w-full rounded px-3 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                pathname.includes('/admin/subject') ? "bg-green-600 text-white" : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span>Exam Subject</span>
              <svg
                className={`w-4 h-4 transition-transform ${isSubjectDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Subject Dropdown Menu */}
            {isSubjectDropdownOpen && (
              <div className="mt-1 ml-4 space-y-1">
                <Link
                  href="/admin/subject/create"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/subject/create' ? "bg-green-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  Create Subject
                </Link>
                <Link
                  href="/admin/subject/all"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/subject/all' ? "bg-green-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  All Subjects
                </Link>
              </div>
            )}
          </div>

          {/* Exam with Dropdown (NEW) */}
          <div className="relative">
            <button
              onClick={toggleExamDropdown}
              className={`w-full rounded px-3 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                pathname.includes('/admin/exam') ? "bg-purple-600 text-white" : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span>Create Exam</span>
              <svg
                className={`w-4 h-4 transition-transform ${isExamDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Exam Dropdown Menu (NEW) */}
            {isExamDropdownOpen && (
              <div className="mt-1 ml-4 space-y-1">
                <Link
                  href="/admin/exam/create"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/exam/create' ? "bg-purple-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  Create Exam
                </Link>
                <Link
                  href="/admin/exam/all"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/exam/all' ? "bg-purple-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  All Exams
                </Link>
              </div>
            )}
          </div>

          {/* Set Question Paper with Dropdown */}
          <div className="relative">
            <button
              onClick={toggleQPDropdown}
              className={`w-full rounded px-3 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                pathname.includes('/admin/question-paper') ? "bg-orange-600 text-white" : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span>Set Question Paper</span>
              <svg
                className={`w-4 h-4 transition-transform ${isQPDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isQPDropdownOpen && (
              <div className="mt-1 ml-4 space-y-1">
                <Link
                  href="/admin/question-paper/create"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/question-paper/create' ? "bg-orange-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  Create Question Paper
                </Link>
                <Link
                  href="/admin/question-paper/all"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/question-paper/all' ? "bg-orange-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  All Question Paper
                </Link>
              </div>
            )}
          </div>

          {/* User Exam with Dropdown */}
          <div className="relative">
            <button
              onClick={toggleUserExamDropdown}
              className={`w-full rounded px-3 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                pathname.includes('/admin/user-exam') ? "bg-pink-600 text-white" : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span>User Exam</span>
              <svg
                className={`w-4 h-4 transition-transform ${isUserExamDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
              {isUserExamDropdownOpen && (
                <div className="mt-1 ml-4 space-y-1">
                  <Link
                    href="/admin/user-exam/pending-payment"
                    className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === '/admin/user-exam/pending-payment' ? "bg-pink-500 text-white" : "hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    Pending Payment Proof
                  </Link>
                  <Link
                    href="/admin/user-exam/filter-merit-list"
                    className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === '/admin/user-exam/filter-merit-list' ? "bg-pink-500 text-white" : "hover:bg-gray-200 text-gray-600"
                    }`} >
                    Filter Merit List
                  </Link>
                </div>
              )}
            
          </div>

          {/* Request Re-Exam with Dropdown */}
          <div className="relative">
            <button
              onClick={toggleRequestReExamDropdown}
              className={`w-full rounded px-3 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                pathname.includes('/admin/request-re-exam') ? "bg-indigo-600 text-white" : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span>Request Re-Exam</span>
              <svg
                className={`w-4 h-4 transition-transform ${isRequestReExamDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isRequestReExamDropdownOpen && (
              <div className="mt-1 ml-4 space-y-1">
                <Link
                  href="/admin/request-re-exam/all"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/request-re-exam/all' ? "bg-indigo-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  All Requests
                </Link>
                <Link
                  href="/admin/request-re-exam/pending"
                  className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === '/admin/request-re-exam/pending' ? "bg-indigo-500 text-white" : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  Pending Requests
                </Link>
              </div>
            )}
          </div>
        </nav>
        <div className="mt-auto pt-3">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content shifted right of the fixed sidebar */}
      <main className="ml-56 h-screen p-6 pb-16 overflow-y-auto bg-white">{children}</main>

      {/* Fixed footer for all admin pages, aligned to the right of the sidebar */}
      <footer className="fixed bottom-0 left-56 right-0 border-t border-gray-200 bg-white text-gray-700 text-xs py-2 px-4 text-center z-40">
        Copyright © 2025 Talent Search Olympiad · Design By Basu Industries Pvt. Ltd.
      </footer>
    </div>
  );
}