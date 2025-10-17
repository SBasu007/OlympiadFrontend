"use client";
import React, { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

interface AdminUser { user_id:number; email:string; username?:string | null }

export default function AllAdminUsersPage(){
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('auth_token');
        if(!token){ window.location.href = '/auth/admin'; return; }
        const res = await fetch(API_BASE + 'auth/admin/all', { headers:{ Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if(!res.ok){ throw new Error(data?.message || 'Failed to load'); }
        setAdmins(Array.isArray(data) ? data : []);
      } catch(e:any){ setError(e.message || 'Failed to load admins'); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = admins.filter(a => {
    const s = search.toLowerCase();
    return a.email.toLowerCase().includes(s) || (a.username || '').toLowerCase().includes(s);
  });

  return (
    <div className="max-w-4xl mx-auto text-gray-900">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">All Admins</h1>
        <p className="text-teal-100">View all admin users in the system</p>
      </div>

      {error && <div className="mb-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input className="border rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500" placeholder="Search by email or username" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div className="rounded border overflow-hidden bg-white">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Username</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={3}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={3}>No admins found</td></tr>
            ) : (
              filtered.map(a => (
                <tr key={a.user_id} className="border-t">
                  <td className="px-3 py-2">{a.email}</td>
                  <td className="px-3 py-2">{a.username || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
