"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useUser } from "../../../../context/UserContext";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};//TYMCZASOWE DANE
export default function PlacePage({ params }) {
  const { user } = useUser(); 
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
      body: JSON.stringify({username: user.username, content: newComment }),
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
  const mapCenter = {lat: placeData.latitude, lng: placeData.longitude};
  return (
    <div>
      <h1>{placeData.name}</h1>
      <p>{placeData.description}</p>
      {/* Mapa Google */}
      <LoadScript googleMapsApiKey="AIzaSyCEGWjV-pmk4uV7lx9JXVCst0jI_yghgeY">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={13}
        >
          <Marker position={{lat: placeData.latitude, lng: placeData.longitude}} />
        </GoogleMap>
      </LoadScript>

      {/* Sekcja komentarzy */}
      <section>
        <h2>Komentarze:</h2>
        <ul>
          {placeData.comments?.length > 0 ? (
            placeData.comments.map((comment, index) => (
              <li key={index}>
                <b>{comment.username || "Anonim"}:</b> {comment.content}
              </li>
            ))
          ) : (
            <p>Brak komentarzy. Dodaj pierwszy komentarz!</p>
          )}
        </ul>

        {user ? (
          <div>
            <textarea
              placeholder="Dodaj komentarz"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleAddComment}>Dodaj komentarz</button>
          </div>
        ) : (
          <p>Musisz być zalogowany, aby dodać komentarz.</p>
        )}
      </section>

      <a href={`/explore/${city}`}>Wróć do miasta</a>
    </div>
  );
}
