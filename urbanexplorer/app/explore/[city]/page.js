"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useUser } from "@/context/UserContext";
import MapWrapper from "@/context/MapWrapper";
import PostsList from "@/app/components/PostsList";
import CreatePost from "@/app/components/CreatePost";
import Chat from "@/app/components/Chat";
import Image from "next/image";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

export default function CityPage() {
  const router = useRouter();
  const params = useParams();
  const { city } = params;
  const { user } = useUser();
  const [cityData, setCityData] = useState(null);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    searchType: 'name',
    sortBy: 'newest'
  });
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); 
  const [showPlaces, setShowPlaces] = useState(true); 

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const handleSearchChange = useCallback(
    debounce((value) => {
      setFilters(prev => ({ ...prev, searchQuery: value }));
    }, 300),
    []
  );

  useEffect(() => {
    async function fetchCityData() {
      try {
        const queryParams = new URLSearchParams();
        if (filters.searchQuery) {
          queryParams.append('searchQuery', filters.searchQuery);
          queryParams.append('searchType', filters.searchType);
        }
        queryParams.append('sortBy', filters.sortBy);

        const res = await fetch(`/api/cities/${city}?${queryParams}`);
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
  }, [city, filters]);

  if (!cityData) return <div className="p-4">Ładowanie...</div>;

  const center = {
    lat: cityData.geolocation?.latitude || 0,
    lng: cityData.geolocation?.longitude || 0,
  };

  return (
    <div className="min-h-auto pb-5 bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{cityData?.name}</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">Odkryj unikalne miejsca i historie w {cityData?.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Szukaj miejsc..."
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <select value={filters.searchType} onChange={(e) => setFilters({...filters, searchType: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="name">Nazwa</option>
                <option value="description">Opis</option>
                <option value="all">Wszystko</option>
              </select>
            </div>

            <select value={filters.sortBy} onChange={(e) => setFilters({...filters, sortBy: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="newest">Najnowsze</option>
              <option value="oldest">Najstarsze</option>
              <option value="most_liked">Najbardziej lubiane</option>
              <option value="most_disliked">Najmniej lubiane</option>
              <option value="controversial">Kontrowersyjne</option>
            </select>

            <div className="flex justify-end gap-4">
              <button onClick={() => router.push(`/explore/${city}/addplace`)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold">
                Dodaj nowe miejsce
              </button>
              <button onClick={() => setShowPlaces(!showPlaces)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-200 transition-colors duration-200 font-semibold">
                {showPlaces ? 'Ukryj miejsca' : 'Pokaż miejsca'}
              </button>
            </div>
          </div>
        </div>

        {showPlaces && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Miejsca w {cityData?.name}</h2>
              <div className="flex gap-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'} max-h-[600px] overflow-y-auto pr-2`}>
              {filteredPlaces.map((place, index) => (
                <div key={index} className={`bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer ${viewMode === 'list' ? 'p-4' : ''}`} onClick={() => router.push(`/explore/${city}/${place.name}`)}>
                  {viewMode === 'grid' && place.attachments && place.attachments.length > 0 && (
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <Image
                        src={place.attachments[0]}
                        alt={place.name}
                        width={400}
                        height={300}
                        className="rounded-t-lg object-cover w-full h-48"
                      />
                    </div>
                  )}
                  <div className={viewMode === 'grid' ? 'p-4' : ''}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{place.name} {place.isVerified && "✓"}</h3>
                    </div>
                    <p className="text-gray-600 mt-2 line-clamp-3">{place.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <MapWrapper>
              <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12}>
                {filteredPlaces.map((place, index) => (
                  <Marker 
                    key={index} 
                    position={{ lat: place.latitude, lng: place.longitude }} 
                    onClick={() => setSelectedPlace(place)}
                  />
                ))}
                {selectedPlace && (
                  <InfoWindow 
                    position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }} 
                    onCloseClick={() => setSelectedPlace(null)}
                  >
                    <div>
                      <h3 className="font-bold">{selectedPlace.name}</h3>
                      <p>{selectedPlace.description}</p>
                      {selectedPlace.attachments && selectedPlace.attachments.length > 0 && (
                        <Image
                          src={selectedPlace.attachments[0]}
                          alt={selectedPlace.name}
                          width={200}
                          height={150}
                          className="rounded-lg object-cover mt-2"
                        />
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </MapWrapper>
          </div>

          <div className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Posty z {cityData?.name}</h2>
              {user && (
                <button onClick={() => setIsCreatingPost(!isCreatingPost)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold">
                  {isCreatingPost ? 'Anuluj' : 'Dodaj post'}
                </button>
              )}
            </div>

            {isCreatingPost ? (
              <div className="mb-6">
                <CreatePost defaultCity={city} onPostCreated={() => {setIsCreatingPost(false)}}/>
              </div>
            ):(
              <PostsList city={cityData} sortBy="newest"/>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Czat miasta {cityData?.name} na żywo</h2>
          <Chat room={city} />
        </div>
      </div>
    </div>
  );
}
