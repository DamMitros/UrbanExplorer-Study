"use client";

import {useRouter} from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Panel Administratora</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a onClick={()=> router.push("/admin/users/")} className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold">Zarządzaj użytkownikami</h2>
          <p className="text-gray-600">Dodawaj, edytuj i usuwaj użytkowników</p>
        </a>
        <a onClick={()=> router.push("/admin/blogs")} className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold">Zarządzaj blogami</h2>
          <p className="text-gray-600">Dodawaj, edytuj i usuwaj blogi</p>
        </a>
        <a onClick={()=> router.push("/admin/posts")}className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold">Zarządzaj postami</h2>
          <p className="text-gray-600">Dodawaj, edytuj i usuwaj posty</p>
        </a>
      </div>
    </div>
  );
}