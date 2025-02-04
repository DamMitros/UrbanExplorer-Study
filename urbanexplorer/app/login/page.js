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
    <div className="min-h-[89vh] bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">{isLoginMode ? "Witaj ponownie!" : "Dołącz do nas"}</h2>

          {message && (
            <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-700 text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="twoj@email.com"
                />
              </div>

              {!isLoginMode && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Nazwa użytkownika</label>
                  <input
                    type="text"
                    id="username"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Twoja nazwa"
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Hasło</label>
                <input
                  type="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {!isLoginMode && (
                <div>
                  <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-slate-700 mb-1">Potwierdź hasło</label>
                  <input
                    type="password"
                    id="passwordConfirmation"
                    required
                    value={formData.passwordConfirmation}
                    onChange={(e) => setFormData({...formData, passwordConfirmation: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
              {isLoginMode ? "Zaloguj się" : "Zarejestruj się"}
            </button>
          </form>

          <button onClick={() => setIsLoginMode(!isLoginMode)} className="w-full mt-6 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
            {isLoginMode ? "Nie masz konta? Zarejestruj się" : "Masz już konto? Zaloguj się"}
          </button>
        </div>
      </div>
    </div>
  );
}