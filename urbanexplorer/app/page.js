"use client";
import { useUser } from "../context/UserContext";

export default function rootPage() {
  const { user } = useUser();

  return (
    <div className="min-h-[89vh] bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center text-slate-800 mb-16 pt-8">
          <h1 className="text-6xl font-bold mb-6 animate-fade-in">Urban Explorer</h1>
          <p className="text-xl mb-8 text-slate-600">Odkryj, dziel się i poznawaj unikatowe miejsca w miastach razem z nami</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Eksploruj Miejsca</h2>
            <p className="mb-4 text-slate-600">Odkryj nieznane zakamarki miast i podziel się swoimi ulubionymi miejscami</p>
            <a href="/explore" className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-2 rounded-lg transition duration-200">Rozpocznij odkrywanie</a>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Blogi i Posty</h2>
            <p className="mb-4 text-slate-600">Czytaj i twórz własne blogi oraz posty o ciekawych miejscach</p>
            <a href="/blogs" className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-2 rounded-lg transition duration-200">Przeglądaj blogi</a>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Społeczność</h2>
            <p className="mb-4 text-slate-600">Dołącz do społeczności odkrywców i dziel się swoimi doświadczeniami</p>
            <a href="/chats" className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-2 rounded-lg transition duration-200">Dołącz do czatów</a>
          </div>
        </div>

        <div className="text-center">
          <p className="text-slate-600 mb-6">{user ? 'Rozpocznij swoją przygodę z odkrywaniem miast!' : 'Dołącz do nas już dziś i rozpocznij swoją przygodę z odkrywaniem miast!'}</p>
          <div className="space-x-4">
            {user ? (
              <>
                <a href="/explore" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-200">Rozpocznij eksplorację</a>
                <a href="/profile" className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-lg font-bold transition duration-200">Twój profil</a>
              </>
            ) : (
              <>
                <a href="/login" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-200">Zaloguj się</a>
                <a href="/explore" className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-lg font-bold transition duration-200">Przeglądaj miejsca</a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}