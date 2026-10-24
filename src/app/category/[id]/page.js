"use client";
import { useEffect, useState, use as usePromise } from "react";
import Courses from "@/com/MCqCourses";
import VideoCourses from "@/com/VideoCourses";
import Materials from "@/com/Materials";

export default function CategoryPage({ params }) {
  const { id } = usePromise(params);
  const [categoryName, setCategoryName] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch("/api/get_all_categories?limit=100");
        const data = await res.json();
        if (data.success) {
          const match = data.data.find((c) => String(c.id) === String(id));
          setCategoryName(match ? match.name : "Category");
        }
      } catch (err) {
        console.error("Error fetching category:", err);
      }
    };
    fetchCategory();
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-4">
        <h1 className="text-3xl font-bold text-gray-800">{categoryName || "Loading..."}</h1>
        <p className="text-gray-600 mt-2">All courses, video courses and study materials in this category</p>
      </div>
      <Courses category={id} />
      <VideoCourses category={id} />
      <Materials category={id} />
    </div>
  );
}
