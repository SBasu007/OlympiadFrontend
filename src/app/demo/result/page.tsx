"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function DemoResultPage() {
  const searchParams = useSearchParams();

  const score = Number(searchParams.get("score") ?? 0);
  const total = Number(searchParams.get("total") ?? 10);
  const attempted = Number(searchParams.get("attempted") ?? 0);
  const timeTaken = Number(searchParams.get("timeTaken") ?? 0);

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <p className="text-sm font-semibold text-blue-700 mb-2">Demo Quiz Result</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Score: {score} / {total}</h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs text-blue-700 uppercase tracking-wide">Percentage</p>
            <p className="text-2xl font-bold text-blue-900">{percentage}%</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wide">Attempted</p>
            <p className="text-2xl font-bold text-green-900">{attempted}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4">
            <p className="text-xs text-amber-700 uppercase tracking-wide">Unattempted</p>
            <p className="text-2xl font-bold text-amber-900">{Math.max(total - attempted, 0)}</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-xs text-purple-700 uppercase tracking-wide">Time Taken</p>
            <p className="text-2xl font-bold text-purple-900">
              {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/demo"
            className="flex-1 text-center px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Retake Demo
          </Link>
          <Link
            href="/"
            className="flex-1 text-center px-5 py-3 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
