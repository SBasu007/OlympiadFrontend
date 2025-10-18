"use client";
import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

interface Category {
  category_id: number;
  name: string;
  promo_url?: string;
}

export default function CreateSubcategoryPage() {
  const [formData, setFormData] = useState({
    name: "",
    cat_id: "",
    image: null as File | null
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}admin/category`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get auth token
  const token = sessionStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Please login to continue");
      }

      // Create FormData for multipart upload
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("cat_id", formData.cat_id);
      
      if (formData.image) {
        submitFormData.append("file", formData.image);
      }

      const response = await fetch(API_BASE + "admin/subcategory", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: submitFormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create subcategory");
      }
      
      // Reset form on success
      setFormData({
        name: "",
        cat_id: "",
        image: null
      });
      
      // Reset file input
      const fileInput = document.getElementById("image") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      setSuccess("Subcategory created successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to create subcategory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Create Subcategory</h1>
        <p className="text-green-100">Add a new exam subcategory to organize your content</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Subcategory Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
              Subcategory Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter subcategory name"
            />
          </div>

          {/* Parent Category */}
          <div>
            <label htmlFor="cat_id" className="block text-sm font-medium text-gray-900 mb-2">
              Parent Category *
            </label>
            {categoriesLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                Loading categories...
              </div>
            ) : (
              <select
                id="cat_id"
                name="cat_id"
                value={formData.cat_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select a parent category</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Category Image */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-900 mb-2">
              Subcategory Image (Optional)
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            {formData.image && (
              <p className="mt-1 text-sm text-gray-600">
                Selected: {formData.image.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setFormData({ name: "", cat_id: "", image: null });
                const fileInput = document.getElementById("image") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading || categoriesLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Subcategory"}
            </button>
          </div>
        </form>
      </div>

      {/* Form Guidelines */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Subcategory names should be descriptive and unique within the parent category</li>
          <li>• Select the appropriate parent category for better organization</li>
          <li>• Upload an image to make the subcategory more visually appealing (optional)</li>
          <li>• Supported image formats: JPG, PNG, WebP</li>
          <li>• Images will be automatically optimized and stored securely</li>
        </ul>
      </div>
    </div>
  );
}