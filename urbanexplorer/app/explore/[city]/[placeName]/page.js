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
import ConfirmDialog from '../../../components/ConfirmDialogs';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleteDialogOpen(false);
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

  if (!placeData) return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-xl text-slate-600">Ładowanie...</div>
    </div>
  );

  const mapCenter = isEditing 
    ? { lat: editData.latitude || placeData.latitude, lng: editData.longitude || placeData.longitude }
    : { lat: placeData.latitude, lng: placeData.longitude };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-slate-800">
                {placeData.name}
                {isVerified && (
                  <span className="ml-2 text-green-500 inline-block">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </h1>
              {(user?.role === 'guide' || user?.role === 'admin') && (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edytuj
                  </button>
                  <button onClick={() => handleVerifyPlace(isVerified)} className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${isVerified ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}>
                    {isVerified ? 'Cofnij weryfikację' : 'Zweryfikuj'}
                  </button>
                  <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Usuń
                  </button>
                </div>
              )}
            </div>

            <p className="text-lg text-slate-600 mb-6">{placeData.description}</p>

            {isEditing && (
              <form onSubmit={handleEdit} className="space-y-6">
                {isVerified && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-yellow-800">Uwaga: Edycja miejsca spowoduje usunięcie weryfikacji.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa:</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lokalizacja:</label>
                    <p className="text-sm text-slate-600">Szerokość: {editData.latitude?.toFixed(6)}, Długość: {editData.longitude?.toFixed(6)}</p>
                    <p className="text-sm text-slate-500 italic mt-1">Kliknij na mapie lub przeciągnij marker, aby zmienić lokalizację</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Opis:</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-h-[150px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Zdjęcia:</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAttachmentUpload}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {editData.attachments.map((url, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={url}
                          alt={`Zdjęcie ${index + 1}`}
                          width={200}
                          height={200}
                          className="rounded-lg object-cover w-full h-48"
                        />
                        <button type="button" className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditData(prev => ({
                            ...prev,
                            attachments: prev.attachments.filter((_, i) => i !== index)
                          }))}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">Zapisz zmiany</button>
                  <button type="button" className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-200 transition-colors duration-200" onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        name: placeData.name,
                        description: placeData.description,
                        latitude: placeData.latitude,
                        longitude: placeData.longitude,
                        attachments: placeData.attachments || []
                      });
                    }}
                    >Anuluj</button>
                </div>
              </form>
            )}
          </div>

          {!isEditing && placeData.attachments && placeData.attachments.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Galeria</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
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
            <InteractionSection targetType="place" targetId={placeData._id} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Posty o tym miejscu</h2>
                {user && (
                  <button onClick={() => setIsCreatingPost(!isCreatingPost)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    {isCreatingPost ? 'Anuluj' : 'Dodaj post'}
                  </button>
                )}
              </div>

              {isCreatingPost ? (
                <CreatePost 
                  defaultCity={city} 
                  defaultPlace={placeData._id} 
                  onPostCreated={() => {setIsCreatingPost(false)}}
                />
              ) : (
                <PostsList place={placeData} />
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Czat miejsca na żywo</h2>
              <Chat room={`${city}-${placeName}`} />
            </div>
          </div>

          <div className="text-center">
            <button onClick={()=> router.push(`/explore/${city}`)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200">← Powrót do {city}</button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        message="Czy na pewno chcesz usunąć to miejsce?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}
