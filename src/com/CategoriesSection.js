"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "lucide-react";

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/get_all_categories?limit=12");
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading || categories.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Browse by Category</h2>
          <p className="text-xl text-gray-600">Find courses, videos and materials for your target exam</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => router.push(`/category/${category.id}`)}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden text-center hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <Tag className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold text-gray-800 py-3 px-2 truncate">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
