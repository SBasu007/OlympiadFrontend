'use client';

import { useState } from 'react';
import FilterMeritList from '../../../components/FilterMeritList';
import { MeritListResult } from '@/lib/api';

export default function MeritListPage() {
  const [meritResults, setMeritResults] = useState<MeritListResult[]>([]);

  return (
    <div>
      <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Merit List
            </h1>
            <p className="text-gray-600 mt-2">Filter and view the merit list by category, subject, and score range</p>
          </div>

          {/* Filter Component */}
          <FilterMeritList onResultsChange={setMeritResults} />

          {/* Summary Stats */}
          {meritResults.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-600 text-sm font-medium">Total Records</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">{meritResults.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-600 text-sm font-medium">Top Score</div>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  {meritResults[0]?.percentage || 0}%
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-600 text-sm font-medium">Average Score</div>
                <div className="text-3xl font-bold text-purple-600 mt-2">
                  {(meritResults.reduce((sum, r) => sum + parseFloat(r.percentage as any), 0) / meritResults.length).toFixed(2)}%
                </div>
              </div>
            </div>
          )}

          {/* Results Table */}
          {meritResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Rank</th>
                      <th className="px-6 py-4 text-left font-semibold">User ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Category</th>
                      <th className="px-6 py-4 text-left font-semibold">Subcategory</th>
                      <th className="px-6 py-4 text-left font-semibold">Subject</th>
                      <th className="px-6 py-4 text-left font-semibold">Exam</th>
                      <th className="px-6 py-4 text-center font-semibold">Score</th>
                      <th className="px-6 py-4 text-center font-semibold">Percentage</th>
                      <th className="px-6 py-4 text-left font-semibold">Attempted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meritResults.map((result, index) => (
                      <tr 
                        key={index}
                        className={`border-b transition-colors ${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-blue-50`}
                      >
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold">
                            {result.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{result.user_id}</td>
                        <td className="px-6 py-4 text-gray-700">{result.category_name}</td>
                        <td className="px-6 py-4 text-gray-700">{result.subcategory_name}</td>
                        <td className="px-6 py-4 text-gray-700">{result.subject_name}</td>
                        <td className="px-6 py-4 text-gray-700">{result.exam_name}</td>
                        <td className="px-6 py-4 text-center text-gray-900 font-semibold">{result.score}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${
                            parseFloat(result.percentage) >= 90 ? 'bg-green-100 text-green-800' :
                            parseFloat(result.percentage) >= 80 ? 'bg-blue-100 text-blue-800' :
                            parseFloat(result.percentage) >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {result.percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(result.attempted_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {meritResults.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h3>
              <p className="text-gray-500">Apply filters above to view the merit list</p>
            </div>
          )}
        </div>
      </div>
  );
}
