"use client";

import React, { useState, useEffect } from "react";

export default function CityPage({ params }) {
  const { city } = React.use(params);
  const [cityData, setCityData] = useState(null);
  const [newPlace, setNewPlace] = useState({ name: "", description: "" });
  const [isExisting, setIsExisting] = useState(false);
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
    if (!newPlace.name) return alert("Nazwa miejsca jest wymagana!");
    if (cityData.places.some(place => place.name === newPlace.name)) {
      setIsExisting(true);
      return;
    }
    const res = await fetch(`/api/cities/${city}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPlace),
    });

    if (res.ok) {
      const updatedCity = await res.json();
      setCityData(updatedCity);
      setNewPlace({ name: "", description: "" });
      window.locali
    window.location.href = `/explore/${city}/${newPlace.name}`;
    } else {
      alert("Błąd podczas dodawania miejsca.");
    }
  };
  return (
    <div>
      <h1>Dodaj nowe miejsce do listy zobaczenia w {cityData?.name}</h1>
      <div>
        <h2>Dodaj nowe miejsce:</h2>
        <input
          type="text"
          placeholder="Nazwa miejsca"
          value={newPlace.name}
          onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
        />
        <textarea
          placeholder="Opis miejsca"
          value={newPlace.description}
          onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
        />
        <button onClick={handleAddPlace}>Dodaj miejsce</button>
        {isExisting && <p>Miejsce o tej nazwie już istnieje!</p>}
      </div>
      <a href={`/explore/${city}`}>Wróć do eksploracji</a>
    </div>
  );
}
