"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { GoogleMap, Marker } from '@react-google-maps/api';
import MapWrapper from '../../../context/MapWrapper';
import ConfirmDialog from '../../components/ConfirmDialogs';

export default function AdminCities() {
  const { user } = useUser();
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [newCity, setNewCity] = useState({
    name: '',
    slug: '',
    geolocation: {
      latitude: 52.237049, 
      longitude: 19.017532
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({
    lat: 52.237049,
    lng: 19.017532
  });
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchCities();
  }, [user, router]);

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/cities');
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania miast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewCity({
      ...newCity,
      [field]: value
    });
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setNewCity({
      ...newCity,
      geolocation: {
        latitude: lat,
        longitude: lng
      }
    });
    setMapCenter({ lat, lng });
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCity.name.trim() || !newCity.geolocation.latitude || !newCity.geolocation.longitude) {
      setIsValidationDialogOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCity)
      });

      if (res.ok) {
        const addedCity = await res.json();
        setCities([...cities, addedCity]);
        setNewCity({
          name: '',
          slug: '',
          geolocation: {
            latitude: 52.237049,
            longitude: 19.017532
          }
        });
        setMapCenter({
          lat: 52.237049,
          lng: 19.017532
        });
      }
    } catch (error) {
      console.error('Błąd podczas dodawania miasta:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Ładowanie...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-600">Brak dostępu</p>
      </div>
    );
  }

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Zarządzaj miastami</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Dodaj nowe miasto</h2>
          <form onSubmit={handleAddCity} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa miasta:</label>
              <input
                type="text"
                value={newCity.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nazwa miasta"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug:</label>
              <input
                type="text"
                value={newCity.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="slug-miasta"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lokalizacja:</label>
              <div className="rounded-lg overflow-hidden border border-slate-200">
                <MapWrapper>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={6}
                    onClick={handleMapClick}
                    options={{ draggableCursor: 'crosshair' }}
                  >
                    <Marker
                      position={mapCenter}
                      draggable={true}
                      onDragEnd={handleMapClick}
                    />
                  </GoogleMap>
                </MapWrapper>
              </div>
              <p className="text-sm text-slate-600 mt-1">Współrzędne: {newCity.geolocation.latitude.toFixed(6)}, {newCity.geolocation.longitude.toFixed(6)}</p>
            </div>

            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">Dodaj miasto</button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-gray-50">Lista miast</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nazwa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cities.map((city) => (
                  <tr key={city._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{city.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{city.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isValidationDialogOpen}
        message="Nazwa miasta i lokalizacja są wymagane"
        onConfirm={() => setIsValidationDialogOpen(false)}
        onCancel={() => setIsValidationDialogOpen(false)}
      />
    </div>
  );
}