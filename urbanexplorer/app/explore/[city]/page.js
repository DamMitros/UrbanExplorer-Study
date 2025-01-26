"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useUser } from "@/context/UserContext";
import CreatePost from "@/app/components/CreatePost";
import MapWrapper from "@/context/MapWrapper";

export default function CityPage() {
  const router = useRouter();
  const params = useParams();
  const { city } = params;
  const { user } = useUser();
  const [cityData, setCityData] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    async function fetchCityData() {
      try {
        const res = await fetch(`/api/cities/${city}?keyword=${encodeURIComponent(keyword)}`);
        if (res.ok) {
          const data = await res.json();
          setCityData(data);
          setFilteredPlaces(data.places || []);
        }
      } catch (error) {
        console.error("Error pobierając dane miasta:", error);
      }
    }
    if (city) {
      fetchCityData();
    }
  }, [city, keyword]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`/api/posts?city=${city}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Error pobierając posty:", error);
      }
    }
    if (city) {
      fetchPosts();
    }
  }, [city]);

  if (!cityData) return <div className="p-4">Ładowanie...</div>;

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const center = {
    lat: cityData.geolocation?.latitude || 0,
    lng: cityData.geolocation?.longitude || 0,
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value);
    
    if (!value.trim()) {
      setFilteredPlaces(cityData.places);
      return;
    }

    const filtered = cityData.places.filter(place => 
      place.name.toLowerCase().includes(value.toLowerCase()) ||
      place.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPlaces(filtered);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Eksploruj miasto {cityData?.name}</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Szukaj miejsc..."
          value={keyword}
          onChange={handleSearch}
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
        <MapWrapper>
          <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12}>
            {filteredPlaces.map((place, index) => (
              <Marker key={index} position={{ lat: place.latitude, lng: place.longitude }} onClick={() => setSelectedPlace(place)}/>
            ))}
            {selectedPlace && (
              <InfoWindow position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }} onCloseClick={() => setSelectedPlace(null)}>
                <div>
                  <h3 className="font-bold">{selectedPlace.name}</h3>
                  <p>{selectedPlace.description}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </MapWrapper>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Miejsca</h2>
          <div className="space-y-4">
            {filteredPlaces.map((place, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer" onClick={() => router.push(`/explore/${city}/${place.name}`)}>
                <h3 className="font-bold text-lg">{place.name} {place.isVerified && "✓"}</h3>
                <p className="text-gray-600">{place.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Powiązane posty</h2>
            {user && (
              <button onClick={() => setIsCreatingPost(!isCreatingPost)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                {isCreatingPost ? 'Anuluj' : 'Utwórz nowy post'}
              </button>
            )}
          </div>

          {isCreatingPost ? (
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <CreatePost defaultCity={city} onPostCreated={() => {
                setIsCreatingPost(false);
                fetchPosts();
              }} />
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post._id} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer" onClick={() => router.push(`/posts/${post._id}`)}>
                  <h3 className="font-bold text-lg">{post.title}</h3>
                  <p className="text-sm text-gray-500">Autor: {post.author?.username}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 space-x-4">
        <button onClick={() => router.push(`/explore/${city}/addplace`)} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">Dodaj nowe miejsce</button>
        <button onClick={() => router.push('/explore')} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">Powrót do miast</button>
      </div>
    </div>
  );
}
