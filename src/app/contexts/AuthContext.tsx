"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getTokenFromCookie, isTokenExpired, getTokenTimeRemaining } from '@/lib/jwt-utils';

interface User {
  user_id: number;
  email: string;
  name?: string;
  guardian?: string;
  institute?: string;
  class?: string;
  contact?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  tokenTimeRemaining: number; // Time remaining in seconds
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  guardian?: string;
  institute?: string;
  userClass?: string;
  contact?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenTimeRemaining, setTokenTimeRemaining] = useState<number>(0);

  // Validate token and logout if expired
  const validateToken = useCallback(async () => {
    try {
      // Get token from HTTP-only cookie (only accessible via document.cookie for validation)
      const token = getTokenFromCookie('student_token');
      
      if (!token) {
        // No token found, logout
        if (user) {
          console.warn('No token found, logging out');
          await logout();
        }
        return false;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.warn('Token expired, logging out');
        await logout();
        return false;
      }

      // Update time remaining
      const remaining = getTokenTimeRemaining(token);
      setTokenTimeRemaining(remaining);

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }, [user]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Periodically validate token (every 30 seconds)
  useEffect(() => {
    if (!user) {
      return;
    }

    // Initial validation
    validateToken();

    // Set up interval to check token expiry
    const interval = setInterval(async () => {
      const isValid = await validateToken();
      
      if (!isValid) {
        console.warn('Token validation failed, user will be logged out');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, validateToken]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}auth/student/me`, {
        method: 'GET',
        credentials: 'include', // Important: send cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}auth/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: receive and send cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store user in state only (token is in HTTP-only cookie)
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}auth/student/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: receive and send cookies
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store user in state only (token is in HTTP-only cookie)
      setUser(data.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend to clear HTTP-only cookie
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}auth/student/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    tokenTimeRemaining,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
