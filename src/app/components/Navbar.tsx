"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";

interface SubCategory {
  subcategory_id: number;
  category_id: number;
  name: string;
  cat_img_url?: string;
}

interface EnrolledExam {
  exam_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  subject_id: number;
  enrollment_status?: string;
}

export default function Navbar() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stateLevelOpen, setStateLevelOpen] = useState(false);
  const [nationalLevelOpen, setNationalLevelOpen] = useState(false);
  const [enrolledExamsOpen, setEnrolledExamsOpen] = useState(false);
  const [stateLevelSubCategories, setStateLevelSubCategories] = useState<SubCategory[]>([]);
  const [nationalLevelSubCategories, setNationalLevelSubCategories] = useState<SubCategory[]>([]);
  const [enrolledExams, setEnrolledExams] = useState<EnrolledExam[]>([]);
  const [stateLevelLoaded, setStateLevelLoaded] = useState(false);
  const [nationalLevelLoaded, setNationalLevelLoaded] = useState(false);
  const [enrolledExamsLoaded, setEnrolledExamsLoaded] = useState(false);

  const stateLevelRef = useRef<HTMLDivElement>(null);
  const nationalLevelRef = useRef<HTMLDivElement>(null);
  const enrolledExamsRef = useRef<HTMLDivElement>(null);
  const mobileStateLevelRef = useRef<HTMLDivElement>(null);
  const mobileNationalLevelRef = useRef<HTMLDivElement>(null);
  const mobileEnrolledExamsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close State Level if clicked outside both desktop and mobile refs
      const clickedInsideStateLevel = 
        (stateLevelRef.current && stateLevelRef.current.contains(event.target as Node)) ||
        (mobileStateLevelRef.current && mobileStateLevelRef.current.contains(event.target as Node));
      
      if (!clickedInsideStateLevel) {
        setStateLevelOpen(false);
      }

      // Close National Level if clicked outside both desktop and mobile refs
      const clickedInsideNationalLevel = 
        (nationalLevelRef.current && nationalLevelRef.current.contains(event.target as Node)) ||
        (mobileNationalLevelRef.current && mobileNationalLevelRef.current.contains(event.target as Node));
      
      if (!clickedInsideNationalLevel) {
        setNationalLevelOpen(false);
      }

      // Close Enrolled Exams if clicked outside both desktop and mobile refs
      const clickedInsideEnrolledExams = 
        (enrolledExamsRef.current && enrolledExamsRef.current.contains(event.target as Node)) ||
        (mobileEnrolledExamsRef.current && mobileEnrolledExamsRef.current.contains(event.target as Node));
      
      if (!clickedInsideEnrolledExams) {
        setEnrolledExamsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch subcategories for category_id = 5 (State Level) only when opened
  useEffect(() => {
    if (stateLevelOpen && !stateLevelLoaded) {
      const fetchStateLevelSubCategories = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}admin/subcategory?category_id=5`);
          if (response.ok) {
            const data = await response.json();
            setStateLevelSubCategories(data);
            setStateLevelLoaded(true);
          } else {
            console.error("Failed to fetch state level subcategories");
          }
        } catch (error) {
          console.error("Error fetching state level subcategories:", error);
        }
      };

      fetchStateLevelSubCategories();
    }
  }, [stateLevelOpen, stateLevelLoaded]);

  // Fetch subcategories for category_id = 6 (National Level) only when opened
  useEffect(() => {
    if (nationalLevelOpen && !nationalLevelLoaded) {
      const fetchNationalLevelSubCategories = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}admin/subcategory?category_id=6`);
          if (response.ok) {
            const data = await response.json();
            setNationalLevelSubCategories(data);
            setNationalLevelLoaded(true);
          } else {
            console.error("Failed to fetch national level subcategories");
          }
        } catch (error) {
          console.error("Error fetching national level subcategories:", error);
        }
      };

      fetchNationalLevelSubCategories();
    }
  }, [nationalLevelOpen, nationalLevelLoaded]);

  // Fetch enrolled exams when opened and user is authenticated
  useEffect(() => {
    if (enrolledExamsOpen && !enrolledExamsLoaded && isAuthenticated && user?.user_id) {
      const fetchEnrolledExams = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}student/enrolled-exams/${user.user_id}`);
          if (response.ok) {
            const data = await response.json();
            setEnrolledExams(data);
            setEnrolledExamsLoaded(true);
          } else {
            console.error("Failed to fetch enrolled exams");
          }
        } catch (error) {
          console.error("Error fetching enrolled exams:", error);
        }
      };

      fetchEnrolledExams();
    }
  }, [enrolledExamsOpen, enrolledExamsLoaded, isAuthenticated, user]);

  return (
    <nav className="bg-[#253b70] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-white p-2 rounded-lg">
                <svg className="w-6 h-6 text-[#253b70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold">Olympiad</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm hover:text-gray-300 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm hover:text-gray-300 transition-colors">
              About
            </Link>
            
            {/* State Level Dropdown */}
            <div className="relative group" ref={stateLevelRef}>
              <button
                onClick={() => setStateLevelOpen(!stateLevelOpen)}
                className="text-sm hover:text-gray-300 transition-colors flex items-center gap-1"
                aria-haspopup="menu"
                aria-expanded={stateLevelOpen}
              >
                State Level
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {stateLevelOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto z-50">
                  {stateLevelLoaded && stateLevelSubCategories.length > 0 ? (
                    stateLevelSubCategories.map((subCategory) => (
                      <Link
                        key={subCategory.subcategory_id}
                        href={`/subcategory/${subCategory.subcategory_id}?category=${encodeURIComponent('State Level')}`}
                        className="block px-4 py-2 hover:bg-blue-50 transition-colors"
                        onClick={() => setStateLevelOpen(false)}
                      >
                        {subCategory.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      Loading...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* National Level Dropdown */}
            <div className="relative group" ref={nationalLevelRef}>
              <button
                onClick={() => setNationalLevelOpen(!nationalLevelOpen)}
                className="text-sm hover:text-gray-300 transition-colors flex items-center gap-1"
                aria-haspopup="menu"
                aria-expanded={nationalLevelOpen}
              >
                National Level
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {nationalLevelOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto z-50">
                  {nationalLevelLoaded && nationalLevelSubCategories.length > 0 ? (
                    nationalLevelSubCategories.map((subCategory) => (
                      <Link
                        key={subCategory.subcategory_id}
                        href={`/subcategory/${subCategory.subcategory_id}?category=${encodeURIComponent('National Level')}`}
                        className="block px-4 py-2 hover:bg-blue-50 transition-colors"
                        onClick={() => setNationalLevelOpen(false)}
                      >
                        {subCategory.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      Loading...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enrolled Exams Dropdown - Only for authenticated users */}
            {isAuthenticated && (
              <div className="relative group" ref={enrolledExamsRef}>
                <button
                  onClick={() => setEnrolledExamsOpen(!enrolledExamsOpen)}
                  className="text-sm hover:text-gray-300 transition-colors flex items-center gap-1"
                  aria-haspopup="menu"
                  aria-expanded={enrolledExamsOpen}
                >
                  Enrolled Exams
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {enrolledExamsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto z-50">
                    {enrolledExamsLoaded && enrolledExams.length > 0 ? (
                      enrolledExams.map((exam) => (
                        <Link
                          key={exam.exam_id}
                          href={`/exam/${exam.exam_id}`}
                          className="block px-4 py-2 hover:bg-blue-50 transition-colors"
                          onClick={() => setEnrolledExamsOpen(false)}
                        >
                          {exam.name}
                        </Link>
                      ))
                    ) : enrolledExamsLoaded && enrolledExams.length === 0 ? (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        No enrolled exams yet
                      </div>
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        Loading...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <Link href="/exams" className="text-sm hover:text-gray-300 transition-colors">
              Exams
            </Link>
            <Link href="/contact" className="text-sm hover:text-gray-300 transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-white text-sm">
                  Hello, {user?.name || 'User'}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-white text-[#253b70] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-white text-[#253b70] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            
            {/* State Level Dropdown Mobile */}
            <div ref={mobileStateLevelRef}>
              <button
                onClick={() => setStateLevelOpen(!stateLevelOpen)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-expanded={stateLevelOpen}
              >
                <span>State Level</span>
                <svg 
                  className={`w-4 h-4 transform transition-transform ${stateLevelOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {stateLevelOpen && (
                <div className="mt-1 ml-4 space-y-1 bg-white/5 rounded-lg p-2 max-h-[70vh] overflow-y-auto">
                  {stateLevelLoaded && stateLevelSubCategories.length > 0 ? (
                    stateLevelSubCategories.map((subCategory) => (
                      <Link
                        key={subCategory.subcategory_id}
                        href={`/subcategory/${subCategory.subcategory_id}?category=${encodeURIComponent('State Level')}`}
                        className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                        onClick={() => {
                          setStateLevelOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {subCategory.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-300 text-sm">
                      Loading...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* National Level Dropdown Mobile */}
            <div ref={mobileNationalLevelRef}>
              <button
                onClick={() => setNationalLevelOpen(!nationalLevelOpen)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-expanded={nationalLevelOpen}
              >
                <span>National Level</span>
                <svg 
                  className={`w-4 h-4 transform transition-transform ${nationalLevelOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {nationalLevelOpen && (
                <div className="mt-1 ml-4 space-y-1 bg-white/5 rounded-lg p-2 max-h-[70vh] overflow-y-auto">
                  {nationalLevelLoaded && nationalLevelSubCategories.length > 0 ? (
                    nationalLevelSubCategories.map((subCategory) => (
                      <Link
                        key={subCategory.subcategory_id}
                        href={`/subcategory/${subCategory.subcategory_id}?category=${encodeURIComponent('National Level')}`}
                        className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                        onClick={() => {
                          setNationalLevelOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {subCategory.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-300 text-sm">
                      Loading...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enrolled Exams Dropdown Mobile - Only for authenticated users */}
            {isAuthenticated && (
              <div ref={mobileEnrolledExamsRef}>
                <button
                  onClick={() => setEnrolledExamsOpen(!enrolledExamsOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-expanded={enrolledExamsOpen}
                >
                  <span>Enrolled Exams</span>
                  <svg 
                    className={`w-4 h-4 transform transition-transform ${enrolledExamsOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {enrolledExamsOpen && (
                  <div className="mt-1 ml-4 space-y-1 bg-white/5 rounded-lg p-2 max-h-[70vh] overflow-y-auto">
                    {enrolledExamsLoaded && enrolledExams.length > 0 ? (
                      enrolledExams.map((exam) => (
                        <Link
                          key={exam.exam_id}
                          href={`/exam/${exam.exam_id}`}
                          className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                          onClick={() => {
                            setEnrolledExamsOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {exam.name}
                        </Link>
                      ))
                    ) : enrolledExamsLoaded && enrolledExams.length === 0 ? (
                      <div className="px-4 py-2 text-gray-300 text-sm">
                        No enrolled exams yet
                      </div>
                    ) : (
                      <div className="px-4 py-2 text-gray-300 text-sm">
                        Loading...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <Link
              href="/exams"
              className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Exams
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-white text-sm">
                    Hello, {user?.name || 'User'}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 bg-white text-[#253b70] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-4 py-2 bg-white text-[#253b70] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
