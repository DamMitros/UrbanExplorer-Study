"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useUser } from "../../../../context/UserContext";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

export default function PlacePage({ params }) {
  const { user } = useUser();
  const [placeData, setPlaceData] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [city, setCity] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [editCommentId, setEditCommentId] = useState(null); 
  const [editedContent, setEditedContent] = useState(""); 
  const [isVerified, setIsVerified] = useState(false);

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

  useEffect(() => {
    if (placeData) {
      setIsVerified(placeData.isVerified || false);
    }
  }, [placeData]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return alert("Komentarz nie może być pusty!");

    const res = await fetch(`/api/cities/${city}/places/${placeName}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, content: newComment }),
    });

    if (res.ok) {
      const updatedPlace = await res.json();
      setPlaceData(updatedPlace);
      setNewComment("");
    } else {
      alert("Błąd podczas dodawania komentarza.");
    }
  };

  const handleEditComment = async () => {
    const res = await fetch(`/api/cities/${city}/places/${placeName}/comments/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editedContent, commentId: editCommentId }),
    });

    if (res.ok) {
      const updatedPlace = await res.json();
      setPlaceData(updatedPlace);
      setEditCommentId(null); 
      setEditedContent(""); 
    } else {
      alert("Błąd podczas edytowania komentarza.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const res = await fetch(`/api/cities/${city}/places/${placeName}/comments/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });

    if (res.ok) {
      const updatedPlace = await res.json();
      setPlaceData(updatedPlace);
    } else {
      alert("Błąd podczas usuwania komentarza.");
    }
  };

  const handleVerifyPlace = async (currentStatus) => {
    try {
      const res = await fetch(`/api/cities/${city}/places/${placeName}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: currentStatus ? 'unverify' : 'verify'
        })
      });

      if (res.ok) {
        setIsVerified(!currentStatus);
        const updatedPlace = await res.json();
        setPlaceData(updatedPlace);
      }
    } catch (error) {
      console.error('Error weryfikując miejsce:', error);
    }
  };

  if (!placeData) return <p>Ładowanie danych o miejscu...</p>;

  const mapCenter = { lat: placeData.latitude, lng: placeData.longitude };

  return (
    <div>
      <h1>{placeData.name} {isVerified && "✓"}</h1>
      {(user?.role === 'guide' || user?.role === 'admin') && (
        <button onClick={() => handleVerifyPlace(isVerified)}>
          {isVerified ? 'Cofnij weryfikację' : 'Zweryfikuj'}
        </button>
      )}
      <p>{placeData.description}</p>
      {/* Mapa Google */}
      <LoadScript googleMapsApiKey="AIzaSyCEGWjV-pmk4uV7lx9JXVCst0jI_yghgeY">
        <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={16}>
          <Marker position={{ lat: placeData.latitude, lng: placeData.longitude }} />
        </GoogleMap>
      </LoadScript>

      {/* Sekcja komentarzy */}
      <section>
        <h2>Komentarze:</h2>
        <ul>
          {placeData.comments?.length > 0 ? (
            placeData.comments.map((comment) => (
              <li key={comment._id}>
                <b>{comment.username}:</b> 
                {editCommentId === comment._id ? (
                  <div>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <button onClick={() => handleEditComment(comment._id)}>Zapisz zmiany</button>
                    <button onClick={() => setEditCommentId(null)}>Anuluj</button>
                  </div>
                ) : (
                  <>
                    {comment.content}
                    {user?.username === comment.username && (
                      <div>
                        <button onClick={() => {
                          setEditCommentId(comment._id);
                          setEditedContent(comment.content);
                        }}>Edytuj</button>
                        <button onClick={() => handleDeleteComment(comment._id)}>Usuń</button>
                      </div>
                    )}
                  </>
                )}
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
