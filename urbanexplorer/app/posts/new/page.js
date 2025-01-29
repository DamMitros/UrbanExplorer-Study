"use client";

import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import CreatePost from '@/app/components/CreatePost';

export default function NewPostPage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return <p>Przekierowywanie do strony logowania...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Utwórz nowy post</h1>
        <CreatePost onPostCreated={() => {router.push('/posts')}}/>
      </div>
      
      <div className="mt-6">
        <button onClick={() => router.back()} className="text-blue-500 hover:text-blue-700">← Powrót</button>
      </div>
    </div>
  );
}