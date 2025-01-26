'use client';

import { createContext, useContext } from 'react';
import { LoadScript } from "@react-google-maps/api";

const GoogleMapsContext = createContext(null);

export function GoogleMapsProvider({ children }) {
  return (
    <LoadScript googleMapsApiKey="AIzaSyCEGWjV-pmk4uV7lx9JXVCst0jI_yghgeY">
      <GoogleMapsContext.Provider value={true}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}

export default function MapWrapper({ children }) {
  return children;
}