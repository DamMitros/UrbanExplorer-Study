"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import MapWrapper from "@/context/MapWrapper";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/app/components/ConfirmDialogs";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

export default function AddPlacePage({ params }) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const { city } = React.use(params);
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
      setDialogMessage("Wszystkie pola, w tym lokalizacja, są wymagane!");
      setIsConfirmDialogOpen(true);
      return;
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
      }
    } catch (error) {
      console.error('Error adding place:', error);
    }
  };

  const defaultCenter = cityData ? {
    lat: cityData.geolocation.latitude,
    lng: cityData.geolocation.longitude,
  } : { lat: 0, lng: 0 };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Dodaj nowe miejsce w {cityData?.name}</h1>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa miejsca</label>
                <input
                  type="text"
                  placeholder="Wprowadź nazwę miejsca"
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Opis miejsca</label>
                <textarea
                  placeholder="Opisz to miejsce"
                  value={newPlace.description}
                  onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-h-[150px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lokalizacja</label>
                <div className="rounded-lg overflow-hidden shadow-lg mb-2">
                  <MapWrapper>
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={defaultCenter}
                      zoom={13}
                      onClick={handleMapClick}
                      options={{ draggableCursor: 'crosshair' }}
                    >
                      {newPlace.latitude && newPlace.longitude && (
                        <Marker position={{ lat: newPlace.latitude, lng: newPlace.longitude }} />
                      )}
                    </GoogleMap>
                  </MapWrapper>
                </div>
                {newPlace.latitude && newPlace.longitude && (
                  <p className="text-sm text-slate-600">Wybrana lokalizacja: {newPlace.latitude.toFixed(5)}, {newPlace.longitude.toFixed(5)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zdjęcia</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAttachmentUpload}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {newPlace.attachments.map((url, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={url}
                        alt={`Zdjęcie ${index + 1}`}
                        width={200}
                        height={200}
                        className="rounded-lg object-cover h-auto w-full"
                      />
                      <button type="button" className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors" onClick={() => setNewPlace(prev => ({
                          ...prev,
                          attachments: prev.attachments.filter((_, i) => i !== index)
                        }))}
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>

              {isExisting && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                  Miejsce o tej nazwie już istnieje!
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold">Dodaj miejsce</button>
                <button onClick={() => router.push(`/explore/${city}`)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-200 transition-colors duration-200 font-semibold">Anuluj</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        message={dialogMessage}
        onConfirm={() => setIsConfirmDialogOpen(false)}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </>
  );
}
