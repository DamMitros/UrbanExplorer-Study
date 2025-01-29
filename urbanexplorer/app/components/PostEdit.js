"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@/context/UserContext';

export default function PostEdit({ post, onSave, onCancel }) {
  const { user } = useUser();
  const [editData, setEditData] = useState({
    title: post.title,
    content: post.content,
    attachments: post.attachments || [],
    city: post.city?.slug || '', 
    place: post.place?._id || '',
    blog: post.blog?._id || ''
  });
  const [cities, setCities] = useState([]);
  const [places, setPlaces] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [availableBlogs, setAvailableBlogs] = useState([]);
  const inlineImageInputRef = useRef();

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [citiesRes, blogsRes] = await Promise.all([
          fetch("/api/cities"),
          fetch(`/api/blogs?author=${user._id}`)
        ]);
    
        if (citiesRes.ok && blogsRes.ok) {
          const citiesData = await citiesRes.json();
          const blogsData = await blogsRes.json();
          setCities(citiesData);
          setBlogs(blogsData);

          if (post.city) {
            fetchPlaces(post.city.slug);
            const blogsForCity = blogsData.filter(blog => 
              !blog.city || blog.city === post.city.slug
            );
            setAvailableBlogs(blogsForCity);
          } else {
            setAvailableBlogs(blogsData);
          }
        }
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
      }
    }
    fetchInitialData();
  }, [user._id, post.city]);

  useEffect(() => {
    if (editData.city) {
      fetchPlaces(editData.city);
    }
  }, [editData.city]);

  const fetchPlaces = async (citySlug) => {
    if (!citySlug) {
      setPlaces([]);
      return;
    }

    try {
      const res = await fetch(`/api/cities/${citySlug}`);
      if (res.ok) {
        const data = await res.json();
        setPlaces(data.places || []);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania miejsc:', error);
    }
  };

  const handleImageUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const { urls } = await res.json();
        return urls;
      }
      return [];
    } catch (error) {
      console.error('Błąd podczas przesyłania zdjęć:', error);
      return [];
    }
  };

  const handleAttachmentUpload = async (e) => {
    const urls = await handleImageUpload(e.target.files);
    setEditData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...urls]
    }));
  };

  const insertImageIntoContent = async (e) => {
    const urls = await handleImageUpload(e.target.files);
    if (urls.length > 0) {
      const imageMarkdown = urls.map(url => `\n![Zdjęcie](${url})\n`).join('');
      setEditData(prev => ({
        ...prev,
        content: prev.content + imageMarkdown
      }));
    }
  };

  const handleCityChange = (e) => {
    const newCitySlug = e.target.value;
    
    setEditData(prev => ({
      ...prev,
      city: newCitySlug,
      place: '', 
      blog: ''
    }));

    if (newCitySlug) {
      const blogsForCity = blogs.filter(blog => 
        !blog.city || blog.city === newCitySlug
      );
      setAvailableBlogs(blogsForCity);
    } else {
      setAvailableBlogs(blogs);
    }

    if (newCitySlug) {
      fetchPlaces(newCitySlug);
    } else {
      setPlaces([]);
    }
  };

  const handleBlogChange = (e) => {
    const newBlogId = e.target.value;
    const selectedBlog = blogs.find(b => b._id === newBlogId);

    setEditData(prev => ({
      ...prev,
      blog: newBlogId,
      ...(selectedBlog?.city && {
        city: selectedBlog.city,
        place: ''
      })
    }));

    if (selectedBlog?.city) {
      fetchPlaces(selectedBlog.city);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(editData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData({...editData, title: e.target.value})}
          className="w-full p-2 text-2xl font-bold border rounded"
        />
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <select value={editData.city || ''} onChange={handleCityChange} className="w-full p-2 border rounded">
            <option value="">Wybierz miasto</option>
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <select value={editData.place || ''} disabled={!editData.city} className="w-full p-2 border rounded"
            onChange={(e) => setEditData(prev => ({ ...prev, place: e.target.value }))}>
            <option value="">Wybierz miejsce</option>
            {places.map((place) => (
              <option key={place._id} value={place._id}>
                {place.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <select value={editData.blog || ''} onChange={handleBlogChange} className="w-full p-2 border rounded">
            <option value="">Wybierz blog</option>
            {availableBlogs.map((blog) => (
              <option key={blog._id} value={blog._id}>
                {blog.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <button type="button" onClick={() => inlineImageInputRef.current.click()} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Dodaj zdjęcie do treści
        </button>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={insertImageIntoContent}
          ref={inlineImageInputRef}
          className="hidden"
        />
      </div>

      <textarea
        value={editData.content}
        onChange={(e) => setEditData({...editData, content: e.target.value})}
        className="w-full p-2 min-h-[300px] border rounded"
      />

      <div className="border rounded p-4">
        <h3 className="font-bold mb-2">Załączniki:</h3>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleAttachmentUpload}
          className="mb-4"
        />
        <div className="grid grid-cols-3 gap-4">
          {editData.attachments.map((url, index) => (
            <div key={index} className="relative">
              <Image
                src={url}
                alt={`Załącznik ${index + 1}`}
                width={200}
                height={200}
                className="rounded object-cover"
              />
              <button type="button"
                onClick={() => setEditData(prev => ({
                  ...prev,
                  attachments: prev.attachments.filter((_, i) => i !== index)
                }))}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Zapisz zmiany</button>
        <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Anuluj</button>
      </div>
    </form>
  );
}