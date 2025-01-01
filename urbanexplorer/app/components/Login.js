"use client";

import { useState } from "react";

export default function login() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "email") {
      setEmail(e.target.value);
    } else {
      setPassword(e.target.value);
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage("Zalogowano");
      } else if (res.status === 401) {
        setMessage("Nieprawidłowe dane logowania");
      } else {
        setMessage("Błąd serwera");
      }
    } catch (error) {
      console.error("Błąd podczas logowania:", error);
      setMessage("Błąd serwera");
    }
  };      

  return (
    <section>
      <h1>Zaloguj się</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required onChange={handleChange} />
        <label htmlFor="password">Hasło:</label>
        <input type="password" id="password" name="password" required onChange={handleChange} />
        <button type="submit">Zaloguj się</button>
      </form>
      {message && <p>{message}</p>}
    </section>
  );
}