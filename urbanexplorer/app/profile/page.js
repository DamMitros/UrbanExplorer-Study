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
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <p className="text-xl text-slate-600">Przekierowywanie do strony logowania...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Twój Profil</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Informacje o koncie</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Nazwa użytkownika</span>
                  <span className="font-medium text-slate-800">{user.username}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Email</span>
                  <span className="font-medium text-slate-800">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Rola</span>
                  <span className="font-medium text-slate-800">
                    {user.role === 'admin' ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">Administrator</span>
                    ) : user.role === 'guide' ? (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Przewodnik</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Użytkownik</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <button onClick={() => router.push("/profile/settings")} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ustawienia konta
                </button>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
              <NotificationSettings />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Twoje posty</h2>
            <PostsList user123={user} sortBy="newest"/>
          </div>
        </div>
      </div>
    </div>
  );
}