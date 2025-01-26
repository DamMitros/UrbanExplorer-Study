"use client";

import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { setUser } = useUser();
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    passwordConfirmation: ""
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isLoginMode && formData.password !== formData.passwordConfirmation) {
      setMessage("Hasła nie są zgodne");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          mode: isLoginMode ? 'login' : 'register'
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLoginMode) {
          setUser(data);
          router.push("/");
        } else {
          setMessage("Rejestracja udana");
          setIsLoginMode(true);
        }
      } else {
        setMessage(data.error || "Błąd serwera");
      }
    } catch (error) {
      console.error("Błąd:", error);
      setMessage("Błąd serwera");
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLoginMode ? "Zaloguj się" : "Zarejestruj się"}</h2>
      
      {message && <div className="message">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        {!isLoginMode && (
          <div>
            <label htmlFor="username">Nazwa użytkownika:</label>
            <input
              type="text"
              id="username"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
        )}

        <div>
          <label htmlFor="password">Hasło:</label>
          <input
            type="password"
            id="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        {!isLoginMode && (
          <div>
            <label htmlFor="passwordConfirmation">Potwierdź hasło:</label>
            <input
              type="password"
              id="passwordConfirmation"
              required
              value={formData.passwordConfirmation}
              onChange={(e) => setFormData({...formData, passwordConfirmation: e.target.value})}
            />
          </div>
        )}

        <button type="submit">
          {isLoginMode ? "Zaloguj się" : "Zarejestruj się"}
        </button>
      </form>

      <button onClick={() => setIsLoginMode(!isLoginMode)}>
        {isLoginMode ? "Nie masz konta? Zarejestruj się" : "Masz już konto? Zaloguj się"}
      </button>
    </div>
  );
}