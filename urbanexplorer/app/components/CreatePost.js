"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";

export default function CreatePost() {
  const { user, setUser } = useUser(); 
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState(""); 
  const [placeId, setPlaceId] = useState("");
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
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, slug, placeId, author: user }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Post został utworzony!");
        setTitle("");
        setContent("");
        setSlug("");
        setPlaceId("");
      } else {
        alert("Błąd: " + (data.error || "Nieznany błąd"));
      }
    } catch (error) {
      alert("Błąd połączenia.", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Treść"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <select value={slug} onChange={(e) => setSlug(e.target.value)}>
          <option value="">Wybierz miasto (opcjonalne)</option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
        {slug && (
          <select value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
            <option value="">Wybierz miejsce (opcjonalne)</option>
            {places.map((place) => (
              <option key={place._id} value={place._id}>
                {place.name}
              </option>
            ))}
          </select>
        )}
        <button type="submit">Stwórz post</button>
      </form>
    </>
    
  );
}
