import Navigation from "./components/Navigation";
import { UserProvider } from "../context/UserContext";
import { GoogleMapsProvider } from "../context/MapWrapper";
import './globals.css';

export const metadata = {
  title: "UrbanExplorer",
  description: "Odkrywaj miasta z nami",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>UrbanExplorer</title>  
      </head>
      <body>
        <UserProvider>
          <GoogleMapsProvider>
            <Navigation />
            {children}
          </GoogleMapsProvider>
        </UserProvider>
      </body>
    </html>
  );
}
