"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * SessionExpiryWarning Component
 * Shows a warning when the user's session is about to expire
 */
export default function SessionExpiryWarning() {
  const { tokenTimeRemaining, isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Show warning if token expires in less than 5 minutes (300 seconds)
    const WARNING_THRESHOLD = 300;
    
    if (isAuthenticated && tokenTimeRemaining > 0 && tokenTimeRemaining < WARNING_THRESHOLD) {
      setShowWarning(true);
      setCountdown(tokenTimeRemaining);
    } else {
      setShowWarning(false);
    }
  }, [tokenTimeRemaining, isAuthenticated]);

  // Update countdown every second
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShowWarning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  if (!showWarning) {
    return null;
  }

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-lg rounded-lg max-w-md z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Session Expiring Soon
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Your session will expire in{' '}
              <span className="font-semibold">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </p>
            <p className="mt-1">Please save your work.</p>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              Refresh Session
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              Logout Now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowWarning(false)}
          className="ml-3 flex-shrink-0"
        >
          <span className="sr-only">Dismiss</span>
          <svg
            className="h-5 w-5 text-yellow-400 hover:text-yellow-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
