"use client";

import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <nav className="min-h-[6vh] bg-gradient-to-r from-slate-100 to-blue-100 px-6 py-[2vh] shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-slate-800 text-3xl font-extrabold hover:text-slate-600 cursor-pointer transition duration-300 tracking-wider flex items-center gap-2" onClick={() => router.push("/")}>
          <span className="bg-slate-800/5 px-3 py-1 rounded">Urban</span>
          <span className="text-blue-700">Explorer</span>
        </h1>

        <div className="flex items-center space-x-8">
          <div className="flex space-x-6">
            {[
              { path: "/", label: "Strona główna" },
              { path: "/explore", label: "Odkrywaj" },
              { path: "/blogs", label: "Blogi" },
              { path: "/posts", label: "Posty" },
              { path: "/chats", label: "Czaty" }
            ].map(({ path, label }) => (
              <a key={path} onClick={() => router.push(path)} className="text-slate-600 text-lg font-medium hover:text-slate-800 hover:scale-105 transform transition duration-200 cursor-pointer">{label}</a>
            ))}
            
            {user?.role === 'admin' && (
              <a onClick={() => router.push("/admin")} className="text-blue-700 text-lg font-medium hover:text-blue-800 hover:scale-105 transform transition duration-200 cursor-pointer">Panel admina</a>
            )}
          </div>

          <div className="flex items-center gap-4 ml-8 pl-8 border-l border-slate-300">
            {user ? (
              <>
                <a onClick={() => router.push("/profile")} className="text-slate-700 hover:text-slate-900 transition duration-200 cursor-pointer flex items-center gap-2">
                  <span className="text-slate-500">Witaj,</span>
                  <span className="font-semibold bg-slate-800/5 px-3 py-1 rounded hover:bg-slate-800/10 transition duration-200">{user.username}</span>
                </a>
                <button onClick={handleLogout} className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-lg transition duration-200 font-medium">Wyloguj</button>
              </>
            ) : (
              <button onClick={() => router.push("/login")} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-2 rounded-lg transition duration-200 font-medium">Zaloguj się</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
