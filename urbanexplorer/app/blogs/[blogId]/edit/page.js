'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export default function EditBlogPage() {
  const router = useRouter();
  const { blogId } = useParams();
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [cities, setCities] = useState([]);
  const [blog, setBlog] = useState(null);
  const [blogData, setBlogData] = useState({
    name: '',
    description: '',
    city: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [blogRes, citiesRes] = await Promise.all([
          fetch(`/api/blogs/${blogId}`),
          fetch('/api/cities')
        ]);

        if (blogRes.ok) {
          const blogData = await blogRes.json();
          setBlog(blogData);
          setBlogData({
            name: blogData.name,
            description: blogData.description,
            city: blogData.city || ''
          });
        }

        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          setCities(citiesData);
        }
      } catch (error) {
        setMessage('Błąd podczas pobierania danych');
      }
    }

    if (blogId) {
      fetchData();
    }
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(blogData)
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/blogs/${blogId}`);
      } else {
        setMessage(data.error || 'Wystąpił błąd podczas aktualizacji bloga');
      }
    } catch (error) {
      setMessage('Wystąpił błąd podczas aktualizacji bloga');
    }
  };

  if (!user || (blog && user._id !== blog.author._id && user.role !== 'admin')) {
    return <div className="text-center py-8">Brak dostępu</div>;
  }

  return (
    <div className="min-h-[89vh] bg-gradient-to-b from-slate-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Edytuj blog</h1>
          
          {message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Nazwa bloga:</label>
              <input
                type="text"
                id="name"
                value={blogData.name}
                onChange={(e) => setBlogData({ ...blogData, name: e.target.value })}
                className="w-full p-3 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">Opis:</label>
              <textarea
                id="description"
                value={blogData.description}
                onChange={(e) => setBlogData({ ...blogData, description: e.target.value })}
                className="w-full p-3 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows="4"
                required
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">Miasto:</label>
              <select id="city" value={blogData.city} onChange={(e) => setBlogData({ ...blogData, city: e.target.value })} className="w-full p-3 bg-white/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option value="">Wybierz miasto (opcjonalne)</option>
                {cities.map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between pt-4">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">Zapisz zmiany</button>
              <button type="button" onClick={() => router.back()} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors duration-200">Anuluj</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}