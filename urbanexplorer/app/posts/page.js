"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import PostsList from '@/app/components/PostsList';

export default function PostsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [cities, setCities] = useState([]);
  const [places, setPlaces] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    place: '',
    searchQuery: '',
    sortBy: 'newest',
    searchType: 'title' 
  });

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const handleSearchChange = useCallback(
    debounce((value) => {
      setFilters(prev => ({ ...prev, searchQuery: value }));
    }, 300),
    []
  );

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch('/api/cities');
        if (res.ok) {
          const data = await res.json();
          setCities(data);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania miast:', error);
      }
    }
    fetchCities();
  }, []);

  useEffect(() => {
    async function fetchPlaces() {
      if (!filters.city) {
        setPlaces([]);
        return;
      }

      try {
        const res = await fetch(`/api/cities/${filters.city}`);
        if (res.ok) {
          const data = await res.json();
          setPlaces(data.places || []);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania miejsc:', error);
      }
    }
    fetchPlaces();
  }, [filters.city]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Przeglądaj posty i dziel się swoimi doświadczeniami</h1>
          {user && (
            <button onClick={() => router.push('/posts/new')} className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Utwórz nowy post
            </button>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Filtry i wyszukiwanie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Szukaj</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Szukaj postów..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <select value={filters.searchType} onChange={(e) => setFilters({...filters, searchType: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="title">Tytuł</option>
                  <option value="content">Treść</option>
                  <option value="author">Autor</option>
                  <option value="all">Wszystko</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Miasto</label>
              <select value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value, place: ''})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Wszystkie miasta</option>
                {cities.map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Miejsce</label>
              <select value={filters.place} onChange={(e) => setFilters({...filters, place: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500" disabled={!filters.city}>
                <option value="">Wszystkie miejsca</option>
                {places.map((place) => (
                  <option key={place._id} value={place._id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Sortuj według</label>
              <select value={filters.sortBy} onChange={(e) => setFilters({...filters, sortBy: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="newest">Najnowsze</option>
                <option value="oldest">Najstarsze</option>
                <option value="most_liked">Najbardziej lubiane</option>
                <option value="most_disliked">Najbardziej nielubiane</option>
                <option value="controversial">Kontrowersyjne</option>
                <option value="most_active">Najaktywniejsze</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
          <PostsList 
            city={filters.city ? cities.find(c => c.slug === filters.city) : null}
            place={filters.place ? places.find(p => p._id === filters.place) : null}
            sortBy={filters.sortBy}
            searchQuery={filters.searchQuery}
            searchType={filters.searchType}
          />
        </div>
      </div>
    </div>
  );
}