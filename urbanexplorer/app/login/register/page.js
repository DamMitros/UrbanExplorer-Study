"use client";

import { useState } from "react";

export default function registerPage() {
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    passwordConfirmation: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
  
    if (formData.password !== formData.passwordConfirmation) {
      setMessage("Hasła nie są zgodne");
      return;
    }
  
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });
  
      if (res.ok) {
        const data = await res.json();
        setMessage("Rejestracja udana");
      } else if (res.status === 409) {
        setMessage("Użytkownik o podanej nazwie już istnieje");
      } else {
        setMessage("Błąd serwera");
      }
    } catch (error) {
      console.error("Błąd podczas rejestracji:", error);
      setMessage("Błąd serwera");
    }
  };
  
  return (
    <div>
      <h1>Zarejestruj się</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required onChange={handleChange} />
        <label htmlFor="username">Nazwa:</label>
        <input type="text" id="username" name="username" required onChange={handleChange} />
        <label htmlFor="password">Hasło:</label>
        <input type="password" id="password" name="password" required onChange={handleChange} />
        <label htmlFor="passwordConfirmation">Potwierdź hasło:</label>
        <input type="password" id="passwordConfirmation" name="passwordConfirmation" required onChange={handleChange} />
        <button type="submit">Zarejestruj się</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}