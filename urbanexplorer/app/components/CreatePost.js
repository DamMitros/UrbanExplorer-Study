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
    fetchInitialData();
  }, [user._id]);

  useEffect(() => {
    if (citySlug) {
      setAvailableBlogs(blogs.filter(blog => 
        !blog.city || blog.city === citySlug
      ));
    } else {
      setAvailableBlogs(blogs);
    }
  }, [citySlug, blogs]);

  useEffect(() => {
    if (citySlug) {
      async function fetchPlaces() {
        const res = await fetch(`/api/cities/${citySlug}`);
        if (res.ok) {
          const data = await res.json();
          setPlaces(data.places);
        }
      }
      fetchPlaces();
    } else {
      setPlaces([]);
    }
  }, [citySlug]);

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

  const handleCityChange = (e) => {
    const newCitySlug = e.target.value;
    const selectedCity = cities.find(city => city.slug === newCitySlug);
    
    setCitySlug(newCitySlug);
    setSelectedCityId(selectedCity ? selectedCity._id : "");
    setPlaceId(""); 

    if (selectedBlogId) {
      const currentBlog = blogs.find(b => b._id === selectedBlogId);
      if (currentBlog && currentBlog.city && currentBlog.city !== newCitySlug) {
        setSelectedBlogId("");
      }
    }
  };

  const handleBlogChange = (e) => {
    const newBlogId = e.target.value;
    setSelectedBlogId(newBlogId);
    
    if (newBlogId) {
      const selectedBlog = blogs.find(b => b._id === newBlogId);
      if (selectedBlog && selectedBlog.city) {
        setCitySlug(selectedBlog.city);
        const blogCity = cities.find(c => c.slug === selectedBlog.city);
        setSelectedCityId(blogCity ? blogCity._id : "");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
      title,
      content,
      attachments,
      author: user._id
    };

    if (selectedCityId) postData.city = selectedCityId; 
    if (placeId) postData.place = placeId;
    if (selectedBlogId) postData.blog = selectedBlogId;

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setAttachments([]);
        onPostCreated();
      }
    } catch (error) {
      console.error("Błąd podczas tworzenia posta:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="flex gap-4 mb-4">
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

      <div>
        <textarea
          placeholder="Treść"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded min-h-[200px]"
          required
        />
      </div>

      <div className="border rounded p-4">
        <h3 className="font-bold mb-2">Załączniki:</h3>
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
                className="rounded object-cover"
              />
              <button type="button" onClick={() => removeAttachment(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">×</button>
            </div>
          ))}
        </div>
      </div>

      {!blogId && !defaultPlace && (
        <div className="flex gap-4">
          <div className="flex-1">
            <select key="cities" value={citySlug} onChange={handleCityChange} className="w-full p-2 border rounded">
              <option key="city" value="">Wybierz miasto</option>
              {cities.map((city) => (
                <option key={city._id} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <select key="places" value={placeId} onChange={(e) => setPlaceId(e.target.value)} className="w-full p-2 border rounded" disabled={!citySlug}>
              <option key="place" value="">Wybierz miejsce</option>
              {places.map((place) => (
                <option key={place._id} value={place._id}>{place.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <select key="blogs" value={selectedBlogId} onChange={handleBlogChange} className="w-full p-2 border rounded">
              <option key="blog" value="">Wybierz blog</option>
              {availableBlogs.map((blog) => (
                <option key={blog._id} value={blog._id}>{blog.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Opublikuj</button>
    </form>
  );
}
