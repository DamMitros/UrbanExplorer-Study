"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useUser } from "@/context/UserContext";
import MapWrapper from "@/context/MapWrapper";
import InteractionSection from "@/app/components/InteractionSection";
import PostsList from "@/app/components/PostsList";
import CreatePost from "@/app/components/CreatePost";
import { useRouter } from "next/navigation";

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

  if (!placeData) return <div className="p-4">Ładowanie...</div>;

  const mapCenter = { 
    lat: placeData.latitude, 
    lng: placeData.longitude 
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold"> {placeData.name}  {isVerified && <span className="ml-2 text-green-500">✓</span>}</h1>
          {(user?.role === 'guide' || user?.role === 'admin') && (
            <button onClick={() => handleVerifyPlace(isVerified)} className={`px-4 py-2 rounded-lg ${
                isVerified ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              } text-white transition`}
            >
              {isVerified ? 'Cofnij weryfikację' : 'Zweryfikuj'}
            </button>
          )}
        </div>
        <p className="mt-2 text-gray-600">{placeData.description}</p>
      </div>

      <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
        <MapWrapper>
          <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={16}>
            <Marker position={mapCenter} />
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
              <div className="mb-4">
                <CreatePost defaultCity={city} defaultPlace={placeData._id} onPostCreated={() => {
                    setIsCreatingPost(false);
                  }} 
                />
              </div>
            ) : (
              <PostsList place={placeData} />
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <a onClick={()=> router.push(`/explore/${city}`)} className="text-blue-500 hover:underline"> Powrót do {city}</a>
      </div>
    </div>
  );
}
