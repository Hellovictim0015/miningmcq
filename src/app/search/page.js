"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, BookOpen, Video, FileText, SearchX } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState({ courses: [], videos: [], materials: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setResults(data.data);
      })
      .catch((err) => console.error("Search error:", err))
      .finally(() => setLoading(false));
  }, [q]);

  const totalResults = results.courses.length + results.videos.length + results.materials.length;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Search results for &quot;{q}&quot;
        </h1>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Searching...</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-16">
            <SearchX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No results found for &quot;{q}&quot;</p>
          </div>
        ) : (
          <div className="space-y-10 mt-8">
            {results.courses.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" /> MCQ Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.courses.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => router.push(`/coursedetails/${c.slug}`)}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md p-4 cursor-pointer transition-all"
                    >
                      <h3 className="font-semibold text-gray-800">{c.course_name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{c.language}</p>
                      <p className="text-indigo-600 font-bold mt-2">₹{c.course_price}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {results.videos.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5 text-purple-600" /> Video Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.videos.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => router.push(`/coursevideo/${v.slug}`)}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md p-4 cursor-pointer transition-all"
                    >
                      <h3 className="font-semibold text-gray-800">{v.course_name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{v.language}</p>
                      <p className="text-purple-600 font-bold mt-2">₹{v.course_price}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {results.materials.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-600" /> Study Materials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.materials.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => router.push('/navlinkmaterials')}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md p-4 cursor-pointer transition-all"
                    >
                      <h3 className="font-semibold text-gray-800">{m.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{m.subject}</p>
                      <p className="text-yellow-600 font-bold mt-2">
                        {parseFloat(m.price) === 0 ? "Free" : `₹${m.price}`}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
