"use client";

import ConfirmDialog from '../../components/ConfirmDialogs';
import { useUser } from "../../../context/UserContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDialogOpen(false);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {message && (
          <div className="mb-8 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-center">
            {message}
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-8 mb-8">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Nazwa użytkownika</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Zmiana hasła</h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">Aktualne hasło</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">Nowe hasło (opcjonalne)</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-700 mb-1">Potwierdź nowe hasło</label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">Zapisz zmiany</button>
          </form>
        </div>

        <div className="bg-red-50/80 backdrop-blur-sm rounded-xl shadow-lg border border-red-200 p-8">
          <h2 className="text-xl font-bold text-red-800 mb-4">Strefa niebezpieczna</h2>
          <p className="text-red-600 mb-6">Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane zostaną permanentnie usunięte.</p>
          <button onClick={handleDeleteAccount} className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200">Usuń konto</button>
        </div>
      </div>

      <div className="text-center">
        <button onClick={()=> router.push('/profile')} className="text-blue-600 hover:text-blue-800 transition-colors duration-200">← Powrót do profilu</button>
      </div>

      <ConfirmDialog 
        isOpen={isDialogOpen}
        message="Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna."
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDialogOpen(false)}
      />
    </div>
  );
}