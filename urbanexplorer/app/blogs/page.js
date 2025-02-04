"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import BlogForm from '@/app/components/BlogForm';
import { useRouter } from "next/navigation";

export default function BlogListPage() {
  const { user } = useUser();
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    showMyBlogs: false,
    city: '',
    sortBy: 'newest',
    searchQuery: '',
    searchType: 'name' 
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const blogsRes = await fetch('/api/blogs');
        if (blogsRes.ok) {
          const blogsData = await blogsRes.json();
          setBlogs(blogsData);
          setFilteredBlogs(blogsData);
        }

        const citiesRes = await fetch('/api/cities');
        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          setCities(citiesData);
        }
      } catch (error) {
        console.error("Błąd pobierając dane:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...blogs];
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(blog => {
        switch (filters.searchType) {
          case 'name':
            return blog.name.toLowerCase().includes(query);
          case 'description':
            return blog.description.toLowerCase().includes(query);
          case 'author':
            return blog.author.username.toLowerCase().includes(query);
          default:
            return true;
        }
      });
    }

    if (filters.city) {
      filtered = filtered.filter(blog => blog.city === filters.city);
    }

    if (filters.showMyBlogs && user) {
      filtered = filtered.filter(blog => blog.author._id === user._id);
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'most_posts':
          return (b.posts?.length || 0) - (a.posts?.length || 0);
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredBlogs(filtered);
  }, [filters, blogs, user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Odkrywaj historie i doświadczenia innych podróżników</h1>
          {user && (
            <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showCreateForm ? 'Zamknij formularz' : 'Utwórz nowy blog'}
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="mb-8 ">
            <BlogForm />
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Wyszukaj</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Szukaj blogów..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <select value={filters.searchType} onChange={(e) => setFilters({...filters, searchType: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="name">Nazwa</option>
                  <option value="description">Opis</option>
                  <option value="author">Autor</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Miasto</label>
              <select value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Wszystkie miasta</option>
                {cities.map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700">Sortuj według</label>
                {user && (
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.showMyBlogs}
                      onChange={(e) => setFilters({...filters, showMyBlogs: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Tylko moje blogi</span>
                  </label>
                )}
              </div>
              <select value={filters.sortBy} onChange={(e) => setFilters({...filters, sortBy: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="newest">Najnowsze</option>
                <option value="oldest">Najstarsze</option>
                <option value="alphabetical">Alfabetycznie</option>
                <option value="most_posts">Najwięcej postów</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div key={blog._id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{blog.name}</h3>
                <p className="text-slate-600 mb-4 line-clamp-3">{blog.description}</p>
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span>Autor: {blog.author.username}</span>
                  {blog.city && <span>Miasto: {blog.city}</span>}
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={() => router.push(`/blogs/${blog._id}`)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 inline-flex items-center gap-1">
                    Czytaj więcej
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">Nie znaleziono blogów spełniających kryteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}