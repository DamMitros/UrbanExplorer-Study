"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-600">Brak dostępu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">Panel Administratora</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => router.push("/admin/users")} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Zarządzaj użytkownikami</h2>
            <p className="text-slate-600">Dodawaj, edytuj i usuwaj użytkowników</p>
          </div>

          <div onClick={() => router.push("/admin/blogs")} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Zarządzaj blogami</h2>
            <p className="text-slate-600">Dodawaj, edytuj i usuwaj blogi</p>
          </div>

          <div onClick={() => router.push("/admin/posts")} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Zarządzaj postami</h2>
            <p className="text-slate-600">Dodawaj, edytuj i usuwaj posty</p>
          </div>

          <div onClick={() => router.push("/admin/cities")} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Zarządzaj miastami</h2>
            <p className="text-slate-600">Dodawaj miasta</p>
          </div>
        </div>
      </div>
    </div>
  );
}