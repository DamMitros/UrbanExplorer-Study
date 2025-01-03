"use client";

import { useUser } from "../../context/UserContext";

export default function Navigation() {
  const { user } = useUser(); 

  return (
    <nav>
      <h1>UrbanExplorer</h1>
      <a href="/">Strona główna</a>
      <a href="/explore">Odkrywaj</a>
      <a href="/contact">Kontakt</a>
      {user ? (
        <section>
          <a href="/{user.id}">Witaj, {user.username}!</a>
        </section>
      ) : (
        <section>
          <a href="/login">Zaloguj się</a>
        </section>
      )}
    </nav>
  );
}
