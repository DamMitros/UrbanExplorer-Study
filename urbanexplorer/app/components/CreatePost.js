"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";

export default function CreatePost({ defaultCity = "", defaultPlace = "", blogId = "", onPostCreated = () => {} }) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState(defaultCity);
  const [placeId, setPlaceId] = useState(defaultPlace);
  const [cities, setCities] = useState([]);
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    async function fetchCities() {
      const res = await fetch("/api/cities");
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      } else {
        console.error("Błąd przy pobieraniu listy miast.");
      }
    }
    fetchCities();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert("Tytuł i treść są wymagane!"); 
      return;
    }

    try {
      const postData = {
        title,
        content,
        author: user._id,
        city: slug || null,
        place: placeId || null,
        blog: blogId || null
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
        <select value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full p-2 border rounded" disabled={defaultCity !== ""}>
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

      <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">Stwórz post</button>
    </form>
  );
}
