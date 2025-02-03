"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "../../context/UserContext";
import Image from "next/image";

export default function CreatePost({ defaultCity = "", defaultPlace = "", blogId = "", onPostCreated = () => {} }) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [citySlug, setCitySlug] = useState(defaultCity);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [placeId, setPlaceId] = useState(defaultPlace);
  const [selectedBlogId, setSelectedBlogId] = useState(blogId);
  const [attachments, setAttachments] = useState([]);
  const [cities, setCities] = useState([]);
  const [places, setPlaces] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [availableBlogs, setAvailableBlogs] = useState([]);
  const fileInputRef = useRef();
  const inlineImageInputRef = useRef();

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [citiesRes, blogsRes] = await Promise.all([
          fetch("/api/cities"),
          fetch(`/api/blogs?author=${user._id}`)
        ]);

        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          setCities(citiesData);
        }

        if (blogsRes.ok) {
          const blogsData = await blogsRes.json();
          setBlogs(blogsData.filter(blog => blog.author._id === user._id));
          setAvailableBlogs(blogsData.filter(blog => blog.author._id === user._id));
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
      }
    }
    if (user?._id) {
      fetchInitialData();
    }
  }, [user?._id]);

  useEffect(() => {
    if (citySlug) {
      fetchPlaces(citySlug);
    }
  }, [citySlug]);

  const fetchPlaces = async (citySlug) => {
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
    setAttachments(prev => [...prev, ...urls]);
  };

  const insertImageIntoContent = async (e) => {
    const urls = await handleImageUpload(e.target.files);
    if (urls.length > 0) {
      const imageMarkdown = urls.map(url => `\n![Zdjęcie](${url})\n`).join('');
      setContent(prev => prev + imageMarkdown);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
      title,
      content,
      attachments,
      author: user._id,
      user: user.username,
    };

    if (selectedCityId) postData.city = selectedCityId;
    if (placeId) postData.place = placeId;
    if (selectedBlogId) postData.blog = selectedBlogId;

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setAttachments([]);
        setCitySlug("");
        setPlaceId("");
        setSelectedBlogId("");
        onPostCreated();
      }
    } catch (error) {
      console.error("Błąd podczas tworzenia posta:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-lg p-6">
      <div>
        <input
          type="text"
          placeholder="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <div className="flex gap-4 mb-4">
          <button type="button" onClick={() => inlineImageInputRef.current.click()} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Dodaj zdjęcie do treści
          </button>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={insertImageIntoContent}
          ref={inlineImageInputRef}
          className="hidden"
        />
      </div>

      <div>
        <textarea
          placeholder="Treść"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border rounded-lg min-h-[200px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="border rounded-lg p-6 bg-gray-50">
        <h3 className="font-bold mb-4">Zdjęcia:</h3>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleAttachmentUpload}
          ref={fileInputRef}
          className="mb-4"
        />
        <div className="grid grid-cols-3 gap-4">
          {attachments.map((url, index) => (
            <div key={index} className="relative">
              <Image
                src={url}
                alt={`Załącznik ${index + 1}`}
                width={200}
                height={200}
                className="rounded-lg object-cover"
              />
              <button type="button" onClick={() => removeAttachment(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors">×</button>
            </div>
          ))}
        </div>
      </div>

      {!blogId && !defaultPlace && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select value={citySlug} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => {
                const newCitySlug = e.target.value;
                const selectedCity = cities.find(city => city.slug === newCitySlug);
                setCitySlug(newCitySlug);
                setSelectedCityId(selectedCity ? selectedCity._id : "");
                setPlaceId("");
              }}>
              <option key="city_id" value="">Wybierz miasto</option>
              {cities.map((city) => (
                <option key={city._id} value={city.slug}>{city.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select value={placeId} onChange={(e) => setPlaceId(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={!citySlug}>
              <option value="">Wybierz miejsce</option>
              {places.map((place) => (
                <option key={place._id} value={place._id}>{place.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select value={selectedBlogId} onChange={(e) => setSelectedBlogId(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Wybierz blog</option>
              {availableBlogs.map((blog) => (
                <option key={blog._id} value={blog._id}>{blog.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors">Opublikuj</button>
    </form>
  );
}
