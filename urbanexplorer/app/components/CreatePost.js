"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";

export default function CreatePost({ defaultCity = "", defaultPlace = "", blogId = "", onPostCreated = () => {} }) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState(defaultCity);
  const [placeId, setPlaceId] = useState(defaultPlace);
  const [selectedBlogId, setSelectedBlogId] = useState(blogId);
  const [cities, setCities] = useState([]);
  const [places, setPlaces] = useState([]);
  const [blogs, setBlogs] = useState([]);

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
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
      }
    }
    
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (slug) {
      async function fetchPlaces() {
        const res = await fetch(`/api/cities/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPlaces(data.places);
        }
      }
      fetchPlaces();
    } else {
      setPlaces([]);
    }
  }, [slug]);

  const filteredBlogs = blogs.filter(blog => {
    if (!slug) return true; 
    return !blog.city || blog.city === slug;
  });

  const handleCityChange = (e) => {
    const newSlug = e.target.value;
    setSlug(newSlug);
    setPlaceId(""); 
    
    const currentBlog = blogs.find(b => b._id === selectedBlogId);
    if (currentBlog && currentBlog.city && currentBlog.city !== newSlug) {
      setSelectedBlogId("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert("Tytuł i treść są wymagane!");
      return;
    }

    try {
      let cityId = null;
      if (slug) {
        const cityRes = await fetch(`/api/cities/${slug}`);
        if (cityRes.ok) {
          const cityData = await cityRes.json();
          cityId = cityData._id;
        }
      }

      const postData = {
        title,
        content,
        author: user._id,
        city: cityId || null,
        place: placeId || null,
        blog: selectedBlogId || null
      };

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });

      const data = await response.json();

      if (response.ok) {
        setTitle("");
        setContent("");
        setSlug(defaultCity);
        setPlaceId(defaultPlace);
        setSelectedBlogId(blogId);
        onPostCreated();
        alert("Post został utworzony!");
      } else {
        throw new Error(data.error || "Nieznany błąd");
      }
    } catch (error) {
      alert("Błąd: " + error.message);
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

      <div>
        <textarea
          placeholder="Treść"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded min-h-[100px]"
          required
        />
      </div>

      <div>
        <select value={slug} onChange={handleCityChange} className="w-full p-2 border rounded" disabled={defaultCity !== ""}>
          <option value="">Wybierz miasto</option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {slug && (
        <div>
          <select value={placeId} onChange={(e) => setPlaceId(e.target.value)} className="w-full p-2 border rounded" disabled={defaultPlace !== ""}>
            <option value="">Wybierz miejsce (opcjonalne)</option>
            {places.map((place) => (
              <option key={place._id} value={place._id}>
                {place.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <select value={selectedBlogId} onChange={(e) => setSelectedBlogId(e.target.value)} className="w-full p-2 border rounded" disabled={blogId !== ""}>
          <option value="">Wybierz blog (opcjonalne)</option>
          {filteredBlogs.map((blog) => (
            <option key={blog._id} value={blog._id}>
              {blog.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">Stwórz post</button>
    </form>
  );
}
