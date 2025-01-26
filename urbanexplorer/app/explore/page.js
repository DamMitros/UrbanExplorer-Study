"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    async function fetchCities() {
      const res = await fetch("/api/cities");
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      } else {
        console.error("Błąd przy pobieraniu listy miast.");
      }
    }
    fetchCities();
  }, []);

  return (
    <div>
      <h1>Zwiedzaj Unikatowe Miejsca</h1>
      <section>
        <p>Odkrywaj zakamarki i landmarki z naszymi przewodnikami.</p>
        <a>Wybierz miasto</a>
        <ul>
          {cities.map((city) => (
            <li key={city.slug}>
              <a href={`/explore/${city.slug}`}>{city.name}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
