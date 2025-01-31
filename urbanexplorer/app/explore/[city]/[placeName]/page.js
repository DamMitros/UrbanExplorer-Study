"use client";
import Chat from '@/app/components/Chat'
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useUser } from "@/context/UserContext";
import MapWrapper from "@/context/MapWrapper";
import InteractionSection from "@/app/components/InteractionSection";
import PostsList from "@/app/components/PostsList";
import CreatePost from "@/app/components/CreatePost";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import ImagePreview from '@/app/components/ImagePreview';

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

export default function PlacePage() {
  const params = useParams();
  const router = useRouter();
  const { city, placeName } = params;
  const { user } = useUser();
  const [placeData, setPlaceData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    latitude: null,
    longitude: null,
    attachments: []
  });

  useEffect(() => {
    async function fetchPlaceData() {
      try {
        const res = await fetch(`/api/cities/${city}/places/${placeName}`);
        if (res.ok) {
          const data = await res.json();
          setPlaceData(data);
          setIsVerified(data.isVerified || false);
        } else {
          console.error("Error pobierając dane miejsca:", res.statusText);
        }
      } catch (error) {
        console.error("Error pobierając dane miejsca:", error);
      }
    }

    if (city && placeName) {
      fetchPlaceData();
    }
  }, [city, placeName]);

  useEffect(() => {
    if (placeData) {
      setEditData({
        name: placeData.name,
        description: placeData.description,
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        attachments: placeData.attachments || []
      });
    }
  }, [placeData]);

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
      console.error('Error weryfikując miejsce', error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/cities/${city}/places/${placeName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        const updatedPlace = await res.json();
        setPlaceData(updatedPlace);
        setIsEditing(false);
        setIsVerified(false); 
        router.refresh();
      } else {
        console.error('Błąd podczas edycji miejsca');
      }
    } catch (error) {
      console.error('Błąd podczas edycji miejsca:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć to miejsce?')) return;

    try {
      const res = await fetch(`/api/cities/${city}/places/${placeName}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        router.push(`/explore/${city}`);
      }
    } catch (error) {
      console.error('Błąd podczas usuwania miejsca:', error);
    }
  };

  const handleMapClick = (e) => {
    if (isEditing) {
      setEditData({
        ...editData,
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng()
      });
    }
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
    setEditData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...urls]
    }));
  };

  if (!placeData) return <div className="p-4">Ładowanie...</div>;

  const mapCenter = isEditing 
    ? { lat: editData.latitude || placeData.latitude, lng: editData.longitude || placeData.longitude }
    : { lat: placeData.latitude, lng: placeData.longitude };

  return (

      <div className="container mx-auto p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold"> {placeData.name}  {isVerified && <span className="ml-2 text-green-500">✓</span>}</h1>
            {(user?.role === 'guide' || user?.role === 'admin') && (
              <div className="flex gap-2">

                <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edytuj</button>
                <button onClick={() => handleVerifyPlace(isVerified)} className={`px-4 py-2 rounded-lg ${
                    isVerified ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white transition`}
                >
                  {isVerified ? 'Cofnij weryfikację' : 'Zweryfikuj'}
                </button>
                <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Usuń</button>
              </div>
            )}
          </div>
          <p className="mt-2 text-gray-600">{placeData.description}</p>
        </div>

        {isEditing && (
          <form onSubmit={handleEdit} className="mt-4 space-y-4">
            {isVerified && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                <p>Uwaga: Edycja miejsca spowoduje usunięcie weryfikacji.</p>
              </div>
            )}
            <div>
              <label className="block mb-2">Nazwa:</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Opis:</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                className="w-full p-2 border rounded min-h-[100px]"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Lokalizacja:</label>
              <p className="text-sm text-gray-600 mb-2">Szerokość: {editData.latitude?.toFixed(6)}, Długość: {editData.longitude?.toFixed(6)}</p>
              <p className="text-sm text-gray-500 italic">Kliknij na mapie lub przeciągnij marker, aby zmienić lokalizację</p>
            </div>
            <div className="mt-4">
              <label className="block mb-2">Zdjęcia:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAttachmentUpload}
                className="mb-4"
              />
              <div className="grid grid-cols-3 gap-4">
                {editData.attachments.map((url, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={url}
                      alt={`Zdjęcie ${index + 1}`}
                      width={200}
                      height={200}
                      className="rounded object-cover"
                    />
                    <button type="button" className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600" onClick={() => setEditData(prev => ({
                        ...prev,
                        attachments: prev.attachments.filter((_, i) => i !== index)
                      }))}>×</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Zapisz</button>
              <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    name: placeData.name,
                    description: placeData.description,
                    latitude: placeData.latitude,
                    longitude: placeData.longitude,
                    attachments: placeData.attachments || []
                  });
                }}>Anuluj</button>
            </div>
          </form>
        )}

        {!isEditing && placeData.attachments && placeData.attachments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Zdjęcia:</h3>
            <div className="grid grid-cols-3 gap-4">
              {placeData.attachments.map((url, index) => (
                <ImagePreview 
                  key={index}
                  src={url}
                  alt={`Zdjęcie ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
          <MapWrapper>
            <GoogleMap 
              mapContainerStyle={mapContainerStyle} 
              center={mapCenter} 
              zoom={16}
              onClick={handleMapClick}
              options={{ draggableCursor: isEditing ? 'crosshair' : 'default' }}
            >
              <Marker 
                position={mapCenter}
                draggable={isEditing}
                onDragEnd={(e) => {
                  if (isEditing) {
                    setEditData({
                      ...editData,
                      latitude: e.latLng.lat(),
                      longitude: e.latLng.lng()
                    });
                  }
                }}
              />
            </GoogleMap>
          </MapWrapper>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <InteractionSection targetType="place" targetId={placeData._id}/>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Posty o tym miejscu</h2>
                {user && (
                  <button onClick={() => setIsCreatingPost(!isCreatingPost)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                    {isCreatingPost ? 'Anuluj' : 'Dodaj post'}
                  </button>
                )}
              </div>

              {isCreatingPost ? (
                <CreatePost defaultCity={city} defaultPlace={placeData._id} onPostCreated={() => {setIsCreatingPost(false)}}/>
              ) : (
                <PostsList place={placeData} />
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Czat miejsca na żywo</h2>
          <Chat room={`${city}-${placeName}`} />
        </div>

        <div className="mt-6">
          <a onClick={()=> router.push(`/explore/${city}`)} className="text-blue-500 hover:underline"> Powrót do {city}</a>
        </div>
      </div>
  );
}
