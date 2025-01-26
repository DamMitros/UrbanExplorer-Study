import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

export default function BlogForm() {
  const { user } = useUser();
  const [blogData, setBlogData] = useState({
    name: '',
    description: '',
    city: '',
    isEditing: false
  });
  const [cities, setCities] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch('/api/cities');
        if (res.ok) {
          const data = await res.json();
          setCities(data);
        }
      } catch (error) {
        setMessage('Błąd podczas pobierania miast');
      }
    }
    fetchCities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!blogData.name || !blogData.description) {
      setMessage('Nazwa i opis są wymagane');
      return;
    }

    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...blogData,
          author: user._id
        })
      });

      const data = await res.json();

      if (res.ok) {
        setBlogData({
          name: '',
          description: '',
          city: '', 
          isEditing: false
        });
        setMessage('Blog został utworzony pomyślnie!');
      } else {
        setMessage(data.error || 'Wystąpił błąd podczas tworzenia bloga');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Wystąpił błąd podczas tworzenia bloga');
    }
  };

  const handleEdit = async () => {
    try {
      const res = await fetch(`/api/blogs/${blogData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: blogData.name,
          description: blogData.description,
          city: blogData.city
        })
      });

      if (res.ok) {
        setMessage('Blog został zaktualizowany pomyślnie!');
        setBlogData({ ...blogData, isEditing: false });
      } else {
        setMessage('Wystąpił błąd podczas aktualizacji bloga');
      }
    } catch (error) {
      setMessage('Wystąpił błąd podczas aktualizacji bloga');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">{blogData.isEditing ? 'Edytuj blog' : 'Stwórz nowy blog'}</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      <form onSubmit={blogData.isEditing ? handleEdit : handleSubmit}>
        <div className="mb-4">
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

        <div className="mb-4">
          <label htmlFor="description" className="block mb-2">Opis bloga:</label>
          <textarea
            id="description"
            value={blogData.description}
            onChange={(e) => setBlogData({ ...blogData, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="city" className="block mb-2">Wybierz miasto (opcjonalne):</label>
          <select id="city" value={blogData.city} onChange={(e) => setBlogData({ ...blogData, city: e.target.value })} className="w-full p-2 border rounded">
            <option value="">Wybierz miasto (opcjonalne)</option>
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{blogData.isEditing ? 'Zapisz zmiany' : 'Utwórz blog'} </button>
      </form>
    </div>
  );
}