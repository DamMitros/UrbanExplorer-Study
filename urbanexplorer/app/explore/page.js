"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const [cities, setCities] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchCities() {
      const res = await fetch("/api/cities");
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      } else {
        console.error("Błąd przy pobieraniu listy miast.");
      }
    }
    fetchCities();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Odkrywaj zakamarki i landmarki</h2>
        </header>

        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Zwiedzaj Unikatowe Miejsca</h2>
          <p className="text-slate-600 mb-8">Wybierz miasto i rozpocznij swoją przygodę</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cities.map((city) => (
              <div key={city.slug} onClick={() => router.push(`/explore/${city.slug}`)} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-xl transition duration-200 cursor-pointer group">
                <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-blue-600">{city.name}</h3>
                <p className="text-slate-600">{city.description}</p>
                <div className="mt-4 flex items-center text-blue-500 font-medium">
                  <span>Odkryj więcej</span>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
