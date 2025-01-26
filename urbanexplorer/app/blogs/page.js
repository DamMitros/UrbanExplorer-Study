"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import BlogForm from '@/app/components/BlogForm';
import { useRouter } from "next/navigation" 

export default function BlogListPage() {
  const router = useRouter();
  const { user } = useUser();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [filters, setFilters] = useState({
    showMyBlogs: false,  
    city: '',           
    sortBy: 'newest'   
  });
  const [cities, setCities] = useState([]);

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

    if (filters.showMyBlogs && user) {
      filtered = filtered.filter(blog => blog.author._id === user._id);
    }

    if (filters.city) {
      filtered = filtered.filter(blog => blog.city === filters.city);
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredBlogs(filtered);
  }, [filters, blogs, user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <BlogForm />
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtry</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user && (
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showMyBlogs}
                  onChange={(e) => setFilters({...filters, showMyBlogs: e.target.checked})}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Moje blogi</span>
              </label>
            </div>
          )}

          <div>
            <select value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})} className="form-select w-full rounded-md border-gray-300">
              <option value="">Wszystkie miasta</option>
              {cities.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select value={filters.sortBy} onChange={(e) => setFilters({...filters, sortBy: e.target.value})} className="form-select w-full rounded-md border-gray-300">
              <option value="newest">Najnowsze</option>
              <option value="oldest">Najstarsze</option>
              <option value="alphabetical">Alfabetycznie</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <div key={blog._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{blog.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{blog.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Autor: {blog.author.username}</span>
                {blog.city && <span>Miasto: {blog.city}</span>}
              </div>
              <div className="mt-4 flex justify-end">
                <a onClick={()=> router.push(`/blogs/${blog._id}`)} className="text-blue-600 hover:text-blue-800">Czytaj więcej → </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBlogs.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Nie znaleziono blogów spełniających kryteria.</p>
        </div>
      )}
    </div>
  );
}