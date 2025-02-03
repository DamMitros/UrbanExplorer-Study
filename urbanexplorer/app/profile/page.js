"use client";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import PostsList from "../components/PostsList";
import NotificationSettings from "../components/NotificationSettings";

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return <p>Przekierowywanie do strony logowania...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profil użytkownika</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Informacje o koncie</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Nazwa użytkownika:</span> {user.username}</p>
              <p><span className="font-semibold">Email:</span> {user.email}</p>
              <p><span className="font-semibold">Rola:</span> {user.role || "Użytkownik"}</p>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => router.push("/profile/settings")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Ustawienia konta
              </button>
            </div>
          </div>
          
          <NotificationSettings />
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Twoje posty</h2>
          <PostsList user123={user} />
        </div>
      </div>
    </div>
  );
}