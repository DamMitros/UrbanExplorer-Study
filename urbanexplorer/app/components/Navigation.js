"use client";

import { useUser } from "../../context/UserContext";

export default function Navigation() {
  const { user, setUser } = useUser(); 

  const handleLogout = () => {
    setUser(null);
  };
  return (
    <nav>
      <h1>UrbanExplorer</h1>
      <a href="/">Strona główna</a>
      <a href="/explore">Odkrywaj</a>
      <a href="/contact">Kontakt</a>
      {user ? (
        <div>
          <a href="/{user.id}">Witaj, {user.username}!</a>
          <button onClick={handleLogout}>Wyloguj się</button>
        </div>
      ) : (
        <div>
          <a href="/login">Zaloguj się</a>
        </div>
      )}
    </nav>
  );
}
