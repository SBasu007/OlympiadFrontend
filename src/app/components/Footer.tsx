import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            © {currentYear} Talent Search Olympiad. All Rights Reserved.
          </div>
          <div className="text-sm">
            Designed by <span className="font-semibold text-blue-400">Basu Industries</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
