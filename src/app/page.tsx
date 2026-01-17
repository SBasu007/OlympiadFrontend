import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

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
