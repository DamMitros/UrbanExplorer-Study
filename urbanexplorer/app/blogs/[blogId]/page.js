"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import CreatePost from '@/app/components/CreatePost';
import PostsList from '@/app/components/PostsList';
import { useRouter, useParams } from 'next/navigation';

export default function BlogDetailsPage() {
  const [blog, setBlog] = useState(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { blogId } = useParams();

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blogs/${blogId}`);
        if (res.ok) {
          const data = await res.json();
          setBlog(data);
        } else {
          console.error("Błąd podczas pobierania bloga");
        }
      } catch (error) {
        console.error("Błąd:", error);
      }
    }
    fetchBlog();
  }, [blogId]);

  const handleDeleteBlog = async () => {
    const shouldDeletePosts = window.confirm(
      "Czy chcesz usunąć wszystkie posty związane z tym blogiem?"
    );

    if (!window.confirm("Czy na pewno chcesz usunąć ten blog?")) return;

    try {
      const res = await fetch(`/api/blogs/${blogId}?deletePosts=${shouldDeletePosts}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        router.push('/blogs');
      } else {
        const data = await res.json();
        console.error('Błąd podczas usuwania bloga:', data.error);
      }
    } catch (error) {
      console.error('Błąd podczas usuwania bloga:', error);
    }
  };

  if (!blog) {
    return <div className="text-center py-10">Ładowanie...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-4">{blog.name}</h1>
            <p className="text-gray-600 mb-4">{blog.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span>Autor: {blog.author?.username}</span>
              {blog.city && <span className="ml-4">Miasto: {blog.city}</span>}
              <span className="ml-4">Utworzono: {new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {(user?._id === blog.author._id || user?.role === 'admin') && (
            <div className="flex gap-2">
              <button onClick={() => router.push(`/blogs/${blog._id}/edit`)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edytuj</button>
              <button onClick={handleDeleteBlog} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Usuń</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Posty</h2>
          {user && (
            <button onClick={() => setIsCreatingPost(!isCreatingPost)} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
              {isCreatingPost ? 'Anuluj' : 'Dodaj post'}
            </button>
          )}
        </div>

        {isCreatingPost && (
          <div className="mb-8">
            <CreatePost blogId={blogId} onPostCreated={() => {setIsCreatingPost(false)}}/>
          </div>
        )}
        <PostsList blog={blog} />
      </div>

      <div className="mt-6">
        <button onClick={() => router.push('/blogs')} className="text-blue-500 hover:text-blue-700">← Powrót do listy blogów</button>
      </div>
    </div>
  );
}