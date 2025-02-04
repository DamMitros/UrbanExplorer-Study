"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import CreatePost from '@/app/components/CreatePost';
import PostsList from '@/app/components/PostsList';
import { useRouter, useParams } from 'next/navigation';
import ConfirmDialog from '../../components/ConfirmDialogs';

export default function BlogDetailsPage() {
  const [blog, setBlog] = useState(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { blogId } = useParams();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleDeleteBlog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleteDialogOpen(false);
    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        router.push('/blogs');
      }
    } catch (error) {
      console.error('Błąd podczas usuwania bloga:', error);
    }
  };

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-slate-600 animate-pulse">Ładowanie...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">{blog.name}</h1>
                <p className="text-lg text-slate-600 mb-4">{blog.description}</p>
                <div className="flex items-center flex-wrap gap-4 text-sm text-slate-500">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{blog.author?.username}</span>
                  </div>
                  {blog.city && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{blog.city}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              {(user?._id === blog.author._id || user?.role === 'admin') && (
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/blogs/${blog._id}/edit`)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edytuj
                  </button>
                  <button onClick={handleDeleteBlog} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Usuń
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Posty</h2>
              {user && (
                <button onClick={() => setIsCreatingPost(!isCreatingPost)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isCreatingPost ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                  {isCreatingPost ? 'Anuluj' : 'Dodaj post'}
                </button>
              )}
            </div>

            {isCreatingPost && (
              <div className="mb-6 border-b border-slate-200 pb-6">
                <CreatePost blogId={blogId} onPostCreated={() => {setIsCreatingPost(false)}}/>
              </div>
            )}
            <PostsList blog={blog} />
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => router.push('/blogs')} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Powrót do listy blogów
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        message="Czy na pewno chcesz usunąć ten blog?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}