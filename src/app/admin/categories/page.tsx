"use client";
import React, { useEffect, useState } from "react";

interface Category { category_id: number; name: string; promo_url: string | null }

export default function CategoriesPage(){
  const [categories,setCategories] = useState<Category[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);

  useEffect(()=>{
    async function load(){
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(process.env.NEXT_PUBLIC_API_BASE + "/admin/category",{
          headers:{ Authorization: token ? `Bearer ${token}` : "" }
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.message || "Failed to fetch categories");
        setCategories(Array.isArray(data)?data:[data]);
      } catch(err:any){
        setError(err.message);
      } finally { setLoading(false); }
    }
    load();
  },[]);

  if(loading) return <div>Loading...</div>;
  if(error) return <div className="text-red-600 text-sm">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <ul className="space-y-2">
        {categories.map(c=> (
          <li key={c.category_id} className="border rounded p-3 flex justify-between items-center">
            <span>{c.name}</span>
            {c.promo_url && <img src={c.promo_url} alt={c.name} className="h-10 w-auto rounded" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
