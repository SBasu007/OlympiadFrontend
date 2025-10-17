"use client";
import React, { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateAdminUserPage(){
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  useEffect(()=>{
    // Ensure logged in session
    const token = sessionStorage.getItem('auth_token');
    if(!token){ router.replace('/auth/admin'); }
  },[router]);

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try{
      if(!email || !password){ throw new Error('Email and password are required'); }
      const res = await fetch(API_BASE + 'auth/admin/register', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if(!res.ok){ throw new Error(data?.message || 'Failed to create admin'); }
      setSuccess('Admin created successfully');
      setUsername(""); setEmail(""); setPassword("");
    }catch(err:any){ setError(err.message || 'Failed to create admin'); }
    finally{ setLoading(false); }
  }

  return (
    <div className="max-w-xl mx-auto text-gray-900">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">Create Admin</h1>
        <p className="text-teal-100">Add a new admin user for managing the platform</p>
      </div>

      {error && <div className="mb-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}
      {success && <div className="mb-3 p-3 bg-green-50 text-green-700 border border-green-200 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded p-4">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full border rounded px-3 py-2 bg-white text-gray-900" placeholder="e.g. admin01" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full border rounded px-3 py-2 bg-white text-gray-900" placeholder="admin@example.com" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} className="w-full border rounded px-3 py-2 bg-white text-gray-900" placeholder="Min 8 characters" />
        </div>
        <div className="flex gap-3">
          <button type="button" className="bg-gray-200 text-gray-900 px-4 py-2 rounded" onClick={()=>history.back()} disabled={loading}>Back</button>
          <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Creating...' : 'Create Admin'}</button>
        </div>
      </form>
    </div>
  );
}
