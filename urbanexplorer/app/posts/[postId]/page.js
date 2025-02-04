"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import InteractionSection from '@/app/components/InteractionSection';
import PostEdit from '@/app/components/PostEdit';
import Image from 'next/image';
import ImagePreview from '@/app/components/ImagePreview';
import ConfirmDialog from '../../components/ConfirmDialogs';

export default function PostPage() {
  const { postId } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania posta:', error);
    }
  };

  const handleEdit = async (editData) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji posta:', error);
    }
  };

  const handleDelete = async () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleteDialogOpen(false);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        router.push('/posts');
      }
    } catch (error) {
      console.error('Błąd podczas usuwania posta:', error);
    }
  };

  const renderContent = (content) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('![')) {
        const match = line.match(/!\[.*?\]\((.*?)\)/);
        if (match) {
          return (
            <div key={i} className="my-4">
              <Image
                src={match[1]}
                alt="Zdjęcie w poście"
                width={800}
                height={600}
                className="rounded-lg"
              />
            </div>
          );
        }
      }
      return <p key={i} className="my-2">{line}</p>;
    });
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-slate-600 animate-pulse">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isEditing ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6">
            <PostEdit post={post} onSave={handleEdit} onCancel={() => setIsEditing(false)}/>
          </div>
        ) : (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-slate-800">{post.title}</h1>
                {(user?._id === post.author._id || user?.role === 'admin') && (
                  <div className="flex gap-2">
                    {(user?._id === post.author._id) && (
                      <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edytuj
                      </button>
                    )}
                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Usuń
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {post.author.username}
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                {post.city && (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {post.city.name}
                  </span>
                )}
              </div>

              <div className="prose max-w-none">
                {renderContent(post.content)}
              </div>

              {post.attachments && post.attachments.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {post.attachments.map((url, index) => (
                    <ImagePreview
                      key={index}
                      src={url}
                      alt={`Zdjęcie ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              <InteractionSection targetType="post" targetId={post._id} />
            </div>
          </>
        )}
      </div>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        message="Czy na pewno chcesz usunąć ten post?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}