"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import InteractionSection from '@/app/components/InteractionSection';
import PostEdit from '@/app/components/PostEdit';
import Image from 'next/image';
import ImagePreview from '@/app/components/ImagePreview';

export default function PostPage() {
  const { postId } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
    if (!window.confirm('Czy na pewno chcesz usunąć ten post?')) return;

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

  if (!post) return <div className="p-4">Ładowanie...</div>;

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {isEditing ? (
        <PostEdit post={post} onSave={handleEdit} onCancel={() => setIsEditing(false)}/>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold">{post.title}</h1>
              {(user?._id === post.author._id || user?.role === 'admin') && (
                <div className="space-x-2">
                  {(user?._id === post.author._id) && (
                    <button onClick={() => setIsEditing(true)}className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edytuj</button>
                  )}
                  <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Usuń</button>
                </div>
              )}
            </div>
            <p className="mt-2 text-gray-600">
              Autor: {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
              {post.city && ` • Miasto: ${post.city.name}`}
            </p>
          </div>

          <div className="prose max-w-none mb-8">
            {renderContent(post.content)}
          </div>

          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
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
        </>
      )}
    </div>
  );
}