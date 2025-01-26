"use client";

import { useUser } from "../../../context/UserContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [message, setMessage] = useState("");

  // if (!user) {
  //   router.push("/login");
  //   return <p>Przekierowywanie do strony logowania...</p>;
  // }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage("Nowe hasła nie są zgodne");
      return;
    }

    try {
      const res = await fetch(`/api/users/${user._id}`, { 
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword || undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        setUser({
          ...user,
          username: formData.username,
          email: formData.email
        });
        setMessage("Profil zaktualizowany pomyślnie");
      } else {
        setMessage(data.error || "Wystąpił błąd podczas aktualizacji profilu");
      }
    } catch (error) {
      console.error("Błąd:", error);
      setMessage("Wystąpił błąd podczas aktualizacji profilu");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna.")) {
      try {
        const res = await fetch(`/api/users/${user._id}`, { 
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          setUser(null);
          router.push("/");
        } else {
          const data = await res.json();
          setMessage(data.error || "Wystąpił błąd podczas usuwania konta");
        }
      } catch (error) {
        console.error("Błąd:", error);
        setMessage("Wystąpił błąd podczas usuwania konta");
      }
    }
  };

  return (
    <div className="settings-container">
      <h1>Ustawienia konta</h1>
      {message && <div className="message">{message}</div>}

      <form onSubmit={handleUpdateProfile}>
        <div>
          <label htmlFor="username">Nazwa użytkownika:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="currentPassword">Aktualne hasło:</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="newPassword">Nowe hasło (opcjonalne):</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="confirmNewPassword">Potwierdź nowe hasło:</label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Zapisz zmiany</button>
      </form>

      <div className="danger-zone">
        <h2>Strefa niebezpieczna</h2>
        <button onClick={handleDeleteAccount} className="delete-account">
          Usuń konto
        </button>
      </div>
    </div>
  );
}