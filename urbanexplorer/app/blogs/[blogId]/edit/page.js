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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edytuj blog</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-2">Nazwa bloga:</label>
          <input
            type="text"
            id="name"
            value={blogData.name}
            onChange={(e) => setBlogData({ ...blogData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block mb-2">Opis:</label>
          <textarea
            id="description"
            value={blogData.description}
            onChange={(e) => setBlogData({ ...blogData, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>

        <div>
          <label htmlFor="city" className="block mb-2">Miasto:</label>
          <select id="city" value={blogData.city} onChange={(e) => setBlogData({ ...blogData, city: e.target.value })} className="w-full p-2 border rounded">
            <option value="">Wybierz miasto (opcjonalne)</option>
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Zapisz zmiany</button>
          <button type="button"onClick={() => router.back()} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Anuluj</button>
        </div>
      </form>
    </div>
  );
}