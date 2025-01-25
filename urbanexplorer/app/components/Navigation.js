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
    <nav className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-3xl font-extrabold tracking-widest">UrbanExplorer</h1>
        <div className="flex space-x-6 justify-center flex-grow">
          <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-110" onClick={()=> router.push("/")}>Strona główna</a>
          <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-110" onClick={()=> router.push("/explore")}>Odkrywaj</a>
          <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-110" onClick={()=> router.push("blogs")}>Blogi</a>
          <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-110" onClick={()=> router.push("/contact")}>Kontakt</a>
          {user ? (
            <>
              {user?.role === 'admin' && (
                <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-110" onClick={() => router.push("/admin")}>Panel admina</a>
              )}
              <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-110" onClick={()=> router.push("/profile")}>Witaj, {user.username}!</a>
            </>
          ) : (
            <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-110" onClick={()=> router.push("/login")}>Zaloguj się</a>
          )}
        </div>
        {user && (
          <button className="text-white bg-red-500 hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-110 px-4 py-2 rounded" onClick={handleLogout}>Wyloguj się</button>
        )}
      </div>
    </nav>
  );
}
