"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import MapWrapper from "@/context/MapWrapper";
import Image from "next/image";
import {useRouter} from "next/navigation";

export default function AddPlacePage({ params }) {
  const { city } = React.use(params);   //do poprawy
  const router = useRouter();
  const [cityData, setCityData] = useState(null);
  const [newPlace, setNewPlace] = useState({
    name: "",
    description: "",
    latitude: null,
    longitude: null,
    attachments: [] 
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

  const handleMapClick = (event) => {
    setNewPlace({
      ...newPlace,
      latitude: event.latLng.lat(),
      longitude: event.latLng.lng(),
    });
  };

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
    setNewPlace(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...urls]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPlace.name || newPlace.latitude === null || newPlace.longitude === null) {
      return alert("Wszystkie pola, w tym lokalizacja, są wymagane!");
    }

    try {
      const res = await fetch(`/api/cities/${city}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPlace,
          attachments: newPlace.attachments || []
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/explore/${city}/${newPlace.name}`);
      } else {
        alert("Błąd podczas dodawania miejsca.");
      }
    } catch (error) {
      console.error('Error adding place:', error);
      alert("Błąd podczas dodawania miejsca.");
    }
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
        <MapWrapper>
          <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={13} onClick={handleMapClick}>
            {newPlace.latitude && newPlace.longitude && (
              <Marker position={{ lat: newPlace.latitude, lng: newPlace.longitude }} />
            )}
          </GoogleMap>
        </MapWrapper>
        {newPlace.latitude && newPlace.longitude && (
          <p>Wybrana lokalizacja: {newPlace.latitude.toFixed(5)}, {newPlace.longitude.toFixed(5)}</p>
        )}
        <div className="mt-4">
          <h3>Zdjęcia:</h3>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAttachmentUpload}
            className="mb-4"
          />
          <div className="grid grid-cols-3 gap-4">
            {newPlace.attachments.map((url, index) => (
              <div key={index} className="relative">
                <Image
                  src={url}
                  alt={`Zdjęcie ${index + 1}`}
                  width={200}
                  height={200}
                  className="rounded object-cover"
                />
                <button className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600" onClick={() => setNewPlace(prev => ({
                    ...prev,
                    attachments: prev.attachments.filter((_, i) => i !== index)
                  }))}>×</button>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleSubmit}>Dodaj miejsce</button>
        {isExisting && <p>Miejsce o tej nazwie już istnieje!</p>}
      </div>
      <a href={`/explore/${city}`}>Wróć do eksploracji</a>
    </div>
  );
}
