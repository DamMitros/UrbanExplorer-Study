"use client";

import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import CreatePost from '@/app/components/CreatePost';

export default function NewPostPage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-slate-600 animate-pulse">
          Zaloguj się aby tworzyć posty...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Utwórz nowy post</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
          <CreatePost 
            onPostCreated={() => {
              router.push('/posts');
            }}
          />
        </div>
        
        <div className="flex justify-center">
          <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Powrót
          </button>
        </div>
      </div>
    </div>
  );
}