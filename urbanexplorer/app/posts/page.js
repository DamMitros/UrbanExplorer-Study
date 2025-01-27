"use client";

import { useState, useEffect, useCallback } from 'react';
import PostsList from '@/app/components/PostsList';

export default function PostsPage() {
  const [cities, setCities] = useState([]);
  const [places, setPlaces] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    place: '',
    searchQuery: '',
    sortBy: 'newest'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Wszystkie posty</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Szukaj postów..."
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <select value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value, place: ''})} className="w-full p-2 border rounded">
              <option value="">Wszystkie miasta</option>
              {cities.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select value={filters.place} onChange={(e) => setFilters({...filters, place: e.target.value})} className="w-full p-2 border rounded" disabled={!filters.city}>
              <option value="">Wszystkie miejsca</option>
              {places.map((place) => (
                <option key={place._id} value={place._id}>
                  {place.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select value={filters.sortBy} onChange={(e) => setFilters({...filters, sortBy: e.target.value})} className="w-full p-2 border rounded">
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

      <div className="bg-white rounded-lg shadow">
        <PostsList 
          city={filters.city ? cities.find(c => c.slug === filters.city) : null}
          place={filters.place ? places.find(p => p._id === filters.place) : null}
          sortBy={filters.sortBy}
          searchQuery={filters.searchQuery}
        />
      </div>
    </div>
  );
}