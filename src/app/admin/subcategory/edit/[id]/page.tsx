"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

interface Category {
  category_id: number;
  name: string;
}

interface Subcategory {
  subcategory_id: number;
  name: string;
  category_id: number;
  cat_img_url?: string;
}

export default function EditSubcategoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    cat_id: "",
    image: null as File | null,
    existingImage: "" as string | undefined,
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const [catRes, subRes] = await Promise.all([
          fetch(`${API_BASE}admin/category`),
          fetch(`${API_BASE}admin/subcategory/${id}`),
        ]);
        if (!catRes.ok) throw new Error("Failed to fetch categories");
        if (!subRes.ok) throw new Error("Failed to fetch subcategory");
        const cats: Category[] = await catRes.json();
        const sub: Subcategory = await subRes.json();
        setCategories(cats);
        setFormData({
          name: sub.name || "",
          cat_id: String(sub.category_id || ""),
          image: null,
          existingImage: sub.cat_img_url,
        });
      } catch (e: any) {
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((p) => ({ ...p, image: file }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      setSaving(true);
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("Please login to continue");
      const body = new FormData();
      body.append("name", formData.name);
      body.append("cat_id", formData.cat_id);
      if (formData.image) body.append("file", formData.image);
      const res = await fetch(`${API_BASE}admin/subcategory/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update subcategory");
      setSuccess("Subcategory updated");
      // Update existing image if new one was uploaded
      if (data?.cat_img_url) {
        setFormData((p) => ({ ...p, existingImage: data.cat_img_url, image: null }));
      }
      // Redirect back to list after short delay
      setTimeout(() => router.push("/admin/subcategory/all"), 800);
    } catch (e: any) {
      setError(e?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-1">Edit Subcategory</h1>
        <p className="text-blue-100">Update details and save changes</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded">{success}</div>
        )}
        <form onSubmit={save} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded text-gray-900"
              required
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <select
              name="cat_id"
              value={formData.cat_id}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded text-gray-900"
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
            {formData.existingImage && (
              <div className="mb-2">
                <img src={formData.existingImage} alt="Existing" className="h-80 w-80 object-cover rounded" />
              </div>
            )}
            <input
                type="file"
                accept="image/*"
                onChange={onFile}
                className="block w-full text-sm text-gray-700 
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-600 file:text-white
                            hover:file:bg-blue-700"
                />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" className="px-4 py-2 rounded bg-gray-600 border" onClick={() => router.back()}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
