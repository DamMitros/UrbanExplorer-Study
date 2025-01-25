"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import CreatePost from "../../components/CreatePost";
import PostsList from "../../components/PostsList";

export default function CityPage({ params }) {
  const { city } = React.use(params);
  const [cityData, setCityData] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    async function fetchCityData() {
      const res = await fetch(`/api/cities/${city}?keyword=${encodeURIComponent(keyword)}`);
      if (res.ok) {
        setCityData(await res.json());
      }
    }
    fetchCityData();
  }, [city, keyword]);

  const handleAddPlace = async () => {
    window.location.href = `/explore/${city}/addplace`;
  };

  if (!cityData) return <p>Ładowanie danych...</p>;

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const center = {
    lat: cityData.geolocation.latitude,
    lng: cityData.geolocation.longitude,
  };

  return (
    <div>
      <h1>Eksploracja: {cityData.name}</h1>
      <input
        type="text"
        placeholder="Szukaj miejsc..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
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
      <LoadScript googleMapsApiKey="AIzaSyCEGWjV-pmk4uV7lx9JXVCst0jI_yghgeY">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
        >
          {cityData.places && cityData.places.map((place, index) => (
            <Marker
              key={index}
              position={{ lat: place.latitude, lng: place.longitude }}
              title={place.name}
              onClick={() => setSelectedPlace(place)}
            />
          ))}
          {selectedPlace && (
            <InfoWindow
              position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div>
                <h2>{selectedPlace.name}</h2>
                <p>{selectedPlace.description}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      <div>
        <CreatePost />
        <PostsList city={cityData} user123={null}/>
      </div>
      <div> 
        <a href="/explore">Wróć do listy miast</a>
      </div>
    </div>
  );
}
