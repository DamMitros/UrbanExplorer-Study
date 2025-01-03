"use client";

import React, { useEffect, useState } from "react";
// import { useUser } from "../../../../context/UserContext";

export default function PlacePage({ params }) {
  // const { user } = useUser(); 
  const [placeData, setPlaceData] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [city, setCity] = useState("");
  const [placeName, setPlaceName] = useState("");

  useEffect(() => {
    async function fetchPlaceData() {
      const { city, placeName } = await params;
      setCity(city);
      setPlaceName(placeName);
      const res = await fetch(`/api/cities/${city}/places/${placeName}`);
      if (res.ok) {
        setPlaceData(await res.json());
      } else {
        console.error("Nie udało się pobrać danych o miejscu.");
      }
    }

    fetchPlaceData();
  }, [params]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return alert("Komentarz nie może być pusty!");
    const res = await fetch(`/api/cities/${city}/places/${placeName}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment}),//user: user.username, content: newComment }),
    });

    if (res.ok) {
      const updatedPlace = await res.json();
      setPlaceData(updatedPlace);
      setNewComment("");
    } else {
      alert("Błąd podczas dodawania komentarza.");
    }
  };

  if (!placeData) return <p>Ładowanie danych o miejscu...</p>;

  return (
    <div>
      <h1>{placeData.name}</h1>
      <p>{placeData.description}</p>

      {/* Google Maps (przyszłościowo do zaimplementowania???) */}
      {/* {placeData.coordinates && (
        <iframe
          src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${placeData.coordinates.lat},${placeData.coordinates.lng}`}
          width="600"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      )} */}

      <section>
        <h2>Komentarze:</h2>
        <ul>
          {placeData.comments?.map((comment, index) => (
            <li key={index}>
              <b>{comment.username}:</b> {comment.content}
            </li>
          ))}
        </ul>

        <div>
          <textarea
            placeholder="Dodaj komentarz"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Dodaj komentarz</button>
        </div>
      </section>

      <a href={`/explore/${city}`}>Wróć do miasta</a>
    </div>
  );
}
