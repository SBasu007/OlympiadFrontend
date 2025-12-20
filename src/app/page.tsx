"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface SubCategory {
  subcategory_id: number;
  category_id: number;
  name: string;
  cat_img_url?: string;
}

interface Subject {
  subject_id: number;
  subcategory_id: number;
  name: string;
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stateLevelOpen, setStateLevelOpen] = useState(false);
  const [nationalLevelOpen, setNationalLevelOpen] = useState(false);
  const [stateLevelSubCategories, setStateLevelSubCategories] = useState<SubCategory[]>([]);
  const [nationalLevelSubCategories, setNationalLevelSubCategories] = useState<SubCategory[]>([]);
  const [stateLevelLoaded, setStateLevelLoaded] = useState(false);
  const [nationalLevelLoaded, setNationalLevelLoaded] = useState(false);
  const [hoveredSubcategoryId, setHoveredSubcategoryId] = useState<number | null>(null);
  const [mobileExpandedSubcategoryId, setMobileExpandedSubcategoryId] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<{ [key: number]: Subject[] }>({});
  const [loadingSubjects, setLoadingSubjects] = useState<{ [key: number]: boolean }>({});

  const stateLevelRef = useRef<HTMLDivElement>(null);
  const nationalLevelRef = useRef<HTMLDivElement>(null);
  const mobileStateLevelRef = useRef<HTMLDivElement>(null);
  const mobileNationalLevelRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Desktop dropdowns
      if (stateLevelRef.current && !stateLevelRef.current.contains(event.target as Node)) {
        setStateLevelOpen(false);
        setHoveredSubcategoryId(null);
      }
      if (nationalLevelRef.current && !nationalLevelRef.current.contains(event.target as Node)) {
        setNationalLevelOpen(false);
        setHoveredSubcategoryId(null);
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
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/subcategory?category_id=5`);
          if (response.ok) {
            const data = await response.json();
            setStateLevelSubCategories(data);
            setStateLevelLoaded(true);
            console.log("State Level:", data);
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
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/subcategory?category_id=6`);
          if (response.ok) {
            const data = await response.json();
            setNationalLevelSubCategories(data);
            setNationalLevelLoaded(true);
            console.log("National Level:", data);
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

  // Fetch subjects for a specific subcategory
  const fetchSubjects = async (subcategoryId: number) => {
    if (subjects[subcategoryId]) return; // Already loaded
    if (loadingSubjects[subcategoryId]) return; // Already loading

    setLoadingSubjects(prev => ({ ...prev, [subcategoryId]: true }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/subject?subcid=${subcategoryId}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(prev => ({ ...prev, [subcategoryId]: data }));
        console.log(`Subjects for subcategory ${subcategoryId}:`, data);
      } else {
        console.error("Failed to fetch subjects");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoadingSubjects(prev => ({ ...prev, [subcategoryId]: false }));
    }
  };

  const handleSubcategoryHover = (subcategoryId: number) => {
    setHoveredSubcategoryId(subcategoryId);
    fetchSubjects(subcategoryId);
  };

  const handleMobileSubcategoryClick = (subcategoryId: number) => {
    console.log('Mobile subcategory clicked:', subcategoryId);
    console.log('Current expanded:', mobileExpandedSubcategoryId);
    const newState = mobileExpandedSubcategoryId === subcategoryId ? null : subcategoryId;
    setMobileExpandedSubcategoryId(newState);
    console.log('Setting expanded to:', newState);
    if (newState !== null) {
      fetchSubjects(subcategoryId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navbar */}
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
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="hover:text-gray-300 transition-colors">
                Home
              </Link>
              <Link href="/about" className="hover:text-gray-300 transition-colors">
                About
              </Link>
              
              {/* State Level Dropdown */}
              <div className="relative group" ref={stateLevelRef}>
                <button
                  onClick={() => setStateLevelOpen(!stateLevelOpen)}
                  className="hover:text-gray-300 transition-colors flex items-center gap-1"
                  aria-haspopup="menu"
                  aria-expanded={stateLevelOpen}
                >
                  State Level
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {stateLevelOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50">
                    {/* Main subcategory dropdown */}
                    <div className="w-56 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto">
                      {stateLevelLoaded && stateLevelSubCategories.length > 0 ? (
                        stateLevelSubCategories.map((subCategory) => (
                          <div
                            key={subCategory.subcategory_id}
                            className="relative"
                          >
                            <div
                              onClick={() => {
                                if (hoveredSubcategoryId === subCategory.subcategory_id) {
                                  setHoveredSubcategoryId(null);
                                } else {
                                  handleSubcategoryHover(subCategory.subcategory_id);
                                }
                              }}
                              className="block px-4 py-2 hover:bg-blue-50 transition-colors flex items-center justify-between cursor-pointer"
                            >
                              <span>{subCategory.name}</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          Loading...
                        </div>
                      )}
                    </div>

                    {/* Subjects side panel */}
                    {hoveredSubcategoryId && subjects[hoveredSubcategoryId] && (
                      <div 
                        className="absolute left-full top-0 w-56 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-2 ml-1 max-h-96 overflow-y-auto"
                      >
                        {subjects[hoveredSubcategoryId].length > 0 ? (
                          subjects[hoveredSubcategoryId].map((subject) => (
                            <Link
                              key={subject.subject_id}
                              href={`/subject/${subject.subject_id}`}
                              className="block px-4 py-2 hover:bg-blue-50 transition-colors"
                            >
                              {subject.name}
                            </Link>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500 text-sm">
                            No subjects available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* National Level Dropdown */}
              <div className="relative group" ref={nationalLevelRef}>
                <button
                  onClick={() => setNationalLevelOpen(!nationalLevelOpen)}
                  className="hover:text-gray-300 transition-colors flex items-center gap-1"
                  aria-haspopup="menu"
                  aria-expanded={nationalLevelOpen}
                >
                  National Level
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {nationalLevelOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50">
                    {/* Main subcategory dropdown */}
                    <div className="w-56 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto">
                      {nationalLevelLoaded && nationalLevelSubCategories.length > 0 ? (
                        nationalLevelSubCategories.map((subCategory) => (
                          <div
                            key={subCategory.subcategory_id}
                            className="relative"
                          >
                            <div
                              onClick={() => {
                                if (hoveredSubcategoryId === subCategory.subcategory_id) {
                                  setHoveredSubcategoryId(null);
                                } else {
                                  handleSubcategoryHover(subCategory.subcategory_id);
                                }
                              }}
                              className="block px-4 py-2 hover:bg-blue-50 transition-colors flex items-center justify-between cursor-pointer"
                            >
                              <span>{subCategory.name}</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          Loading...
                        </div>
                      )}
                    </div>

                    {/* Subjects side panel */}
                    {hoveredSubcategoryId && subjects[hoveredSubcategoryId] && (
                      <div 
                        className="absolute left-full top-0 w-56 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-2 ml-1 max-h-96 overflow-y-auto"
                      >
                        {subjects[hoveredSubcategoryId].length > 0 ? (
                          subjects[hoveredSubcategoryId].map((subject) => (
                            <Link
                              key={subject.subject_id}
                              href={`/subject/${subject.subject_id}`}
                              className="block px-4 py-2 hover:bg-blue-50 transition-colors"
                            >
                              {subject.name}
                            </Link>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500 text-sm">
                            No subjects available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link href="/exams" className="hover:text-gray-300 transition-colors">
                Exams
              </Link>
              <Link href="/contact" className="hover:text-gray-300 transition-colors">
                Contact
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
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
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    // Only toggle if clicking directly on the button, not from bubbled events
                    if (!target.closest('[data-dropdown-content]')) {
                      setStateLevelOpen(!stateLevelOpen);
                    }
                  }}
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
                  <div 
                    data-dropdown-content="true"
                    className="mt-1 ml-4 space-y-1 bg-white/5 rounded-lg p-2 max-h-[70vh] overflow-y-auto" 
                    style={{ pointerEvents: 'auto', zIndex: 5 }}
                  >
                    {console.log('State Level Open - Loaded:', stateLevelLoaded, 'Count:', stateLevelSubCategories.length)}
                    {stateLevelLoaded && stateLevelSubCategories.length > 0 ? (
                      stateLevelSubCategories.map((subCategory) => {
                        console.log('Rendering subcategory:', subCategory.name, subCategory.subcategory_id);
                        return (
                        <div key={subCategory.subcategory_id} className="relative" style={{ pointerEvents: 'auto', zIndex: 10 }}>
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              console.log('State Level - Button clicked for:', subCategory.subcategory_id);
                              handleMobileSubcategoryClick(subCategory.subcategory_id);
                            }}
                            onTouchEnd={(e) => {
                              e.stopPropagation();
                              console.log('State Level - Touch for:', subCategory.subcategory_id);
                              handleMobileSubcategoryClick(subCategory.subcategory_id);
                            }}
                            className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm cursor-pointer"
                            style={{ pointerEvents: 'auto', position: 'relative', zIndex: 20, userSelect: 'none' }}
                          >
                            <span>{subCategory.name}</span>
                            <svg 
                              className={`w-4 h-4 transform transition-transform ${mobileExpandedSubcategoryId === subCategory.subcategory_id ? 'rotate-90' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          
                          {/* Mobile subjects list */}
                          {mobileExpandedSubcategoryId === subCategory.subcategory_id && (
                            <div className="ml-4 mt-1 space-y-1 bg-white/5 rounded-lg p-2">
                              {loadingSubjects[subCategory.subcategory_id] ? (
                                <div className="px-4 py-2 text-gray-400 text-xs">
                                  Loading...
                                </div>
                              ) : subjects[subCategory.subcategory_id] && subjects[subCategory.subcategory_id].length > 0 ? (
                                subjects[subCategory.subcategory_id].map((subject) => (
                                  <Link
                                    key={subject.subject_id}
                                    href={`/subject/${subject.subject_id}`}
                                    className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300"
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setStateLevelOpen(false);
                                      setMobileExpandedSubcategoryId(null);
                                    }}
                                  >
                                    {subject.name}
                                  </Link>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-gray-400 text-xs">
                                  No subjects
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        );
                      })
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
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    // Only toggle if clicking directly on the button, not from bubbled events
                    if (!target.closest('[data-dropdown-content]')) {
                      setNationalLevelOpen(!nationalLevelOpen);
                    }
                  }}
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
                  <div 
                    data-dropdown-content="true"
                    className="mt-1 ml-4 space-y-1 bg-white/5 rounded-lg p-2 max-h-[70vh] overflow-y-auto" 
                    style={{ pointerEvents: 'auto', zIndex: 5 }}
                  >
                    {console.log('National Level Open - Loaded:', nationalLevelLoaded, 'Count:', nationalLevelSubCategories.length)}
                    {nationalLevelLoaded && nationalLevelSubCategories.length > 0 ? (
                      nationalLevelSubCategories.map((subCategory) => {
                        console.log('Rendering subcategory:', subCategory.name, subCategory.subcategory_id);
                        return (
                        <div key={subCategory.subcategory_id} className="relative" style={{ pointerEvents: 'auto', zIndex: 10 }}>
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              console.log('National Level - Button clicked for:', subCategory.subcategory_id);
                              handleMobileSubcategoryClick(subCategory.subcategory_id);
                            }}
                            onTouchEnd={(e) => {
                              e.stopPropagation();
                              console.log('National Level - Touch for:', subCategory.subcategory_id);
                              handleMobileSubcategoryClick(subCategory.subcategory_id);
                            }}
                            className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm cursor-pointer"
                            style={{ pointerEvents: 'auto', position: 'relative', zIndex: 20, userSelect: 'none' }}
                          >
                            <span>{subCategory.name}</span>
                            <svg 
                              className={`w-4 h-4 transform transition-transform ${mobileExpandedSubcategoryId === subCategory.subcategory_id ? 'rotate-90' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          
                          {/* Mobile subjects list */}
                          {mobileExpandedSubcategoryId === subCategory.subcategory_id && (
                            <div className="ml-4 mt-1 space-y-1 bg-white/5 rounded-lg p-2">
                              {loadingSubjects[subCategory.subcategory_id] ? (
                                <div className="px-4 py-2 text-gray-400 text-xs">
                                  Loading...
                                </div>
                              ) : subjects[subCategory.subcategory_id] && subjects[subCategory.subcategory_id].length > 0 ? (
                                subjects[subCategory.subcategory_id].map((subject) => (
                                  <Link
                                    key={subject.subject_id}
                                    href={`/subject/${subject.subject_id}`}
                                    className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300"
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setNationalLevelOpen(false);
                                      setMobileExpandedSubcategoryId(null);
                                    }}
                                  >
                                    {subject.name}
                                  </Link>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-gray-400 text-xs">
                                  No subjects
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        );
                      })
                    ) : (
                      <div className="px-4 py-2 text-gray-300 text-sm">
                        Loading...
                      </div>
                    )}
                  </div>
                )}
              </div>

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
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 sm:p-6" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <div className="max-w-3xl w-full">
        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 text-center space-y-5">
          
          {/* Animated Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Coming Soon
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              <div className="h-1 w-1 bg-purple-600 rounded-full"></div>
              <div className="h-1 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Student Portal
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              We&apos;re working hard to bring you an amazing Olympiad experience. 
              Our student portal will be live soon with exciting features!
            </p>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 text-sm font-medium">Platform Under Development</span>
          </div>

          {/* Admin Button */}
          <div className="pt-2">
            <Link
              href="https://olympiad-frontend-iota.vercel.app/admin"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base sm:text-lg px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Dashboard
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Info Text */}
          <p className="text-xs sm:text-sm text-gray-500">
            Administrators can access the dashboard to manage content
          </p>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-sm text-gray-600">
            Stay tuned for updates
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
