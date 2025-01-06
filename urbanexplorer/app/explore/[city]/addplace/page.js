"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

export default function AddPlacePage({ params }) {
  const { city } = React.use(params);
  const [cityData, setCityData] = useState(null);
  const [newPlace, setNewPlace] = useState({
    name: "",
    description: "",
    latitude: null,
    longitude: null,
  });
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
    if (!newPlace.name || newPlace.latitude === null || newPlace.longitude === null) {
      return alert("Wszystkie pola, w tym lokalizacja, są wymagane!");
    }
    if (cityData.places.some((place) => place.name === newPlace.name)) {
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
      setNewPlace({ name: "", description: "", latitude: null, longitude: null });
      window.location.href = `/explore/${city}/${newPlace.name}`;
    } else {
      alert("Błąd podczas dodawania miejsca.");
    }
  };

  const handleMapClick = (event) => {
    setNewPlace({
      ...newPlace,
      latitude: event.latLng.lat(),
      longitude: event.latLng.lng(),
    });
  };

  const defaultCenter = cityData ? {
    lat: cityData.geolocation.latitude, 
    lng: cityData.geolocation.longitude,
  } : { lat: 0, lng: 0 };

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
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
        <h3>Wybierz lokalizację na mapie:</h3>
        <LoadScript googleMapsApiKey="AIzaSyCEGWjV-pmk4uV7lx9JXVCst0jI_yghgeY">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={13}
            onClick={handleMapClick}
          >
            {newPlace.latitude && newPlace.longitude && (
              <Marker position={{ lat: newPlace.latitude, lng: newPlace.longitude }} />
            )}
          </GoogleMap>
        </LoadScript>
        {newPlace.latitude && newPlace.longitude && (
          <p>
            Wybrana lokalizacja: {newPlace.latitude.toFixed(5)}, {newPlace.longitude.toFixed(5)}
          </p>
        )}
        <button onClick={handleAddPlace}>Dodaj miejsce</button>
        {isExisting && <p>Miejsce o tej nazwie już istnieje!</p>}
      </div>
      <a href={`/explore/${city}`}>Wróć do eksploracji</a>
    </div>
  );
}
