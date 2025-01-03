"use client";

import React, { useState, useEffect } from "react";

export default function CityPage({ params }) {
  const { city } = React.use(params);
  const [cityData, setCityData] = useState(null);

  useEffect(() => {
    async function fetchCityData() {
      const res = await fetch(`/api/cities/${city}`);
      if (res.ok) {
        setCityData(await res.json());
      }
    }
    fetchCityData();
  }, [city]);

  const handleAddPlace = async () => {
    window.location.href = `/explore/${city}/addplace`;
  };

  if (!cityData) return <p>Ładowanie danych...</p>;

  return (
    <div>
      <h1>Eksploracja: {cityData.name}</h1>
      <ul>
        {cityData.places && cityData.places.map((place, index) => (
          <li key={index}>
            <a href={`/explore/${city}/${place.name}`}>
              <h2>{place.name}</h2>
              <p>{place.description}</p>
              {place.comments && place.comments.length > 0 && (
                <ul>
                  {place.comments.map((comment, idx) => (
                    <li key={idx}>
                      <p><b>{comment.username}</b>: {comment.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </a>
          </li>
        ))}
      </ul>
      <button onClick={handleAddPlace}>Dodaj nowe miejsce</button>
    </div>
  );
}
