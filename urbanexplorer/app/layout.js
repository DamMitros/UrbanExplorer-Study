import Navigation from "./components/Navigation";
// import "./styles/styles.css";

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
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
