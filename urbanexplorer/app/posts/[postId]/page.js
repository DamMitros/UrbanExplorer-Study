"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import Image from 'next/image';
import Comments from '@/app/components/Comments';
import InteractionSection from '@/app/components/InteractionSection';

export default function PostPage() {
  const { postId } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    content: '',
  });
  const [images, setImages] = useState([]);
  const imageInputRef = useRef(null);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        setEditData({
          title: data.title,
          content: data.content,
        });
      }
    } catch (error) {
      console.error('Błąd podczas pobierania posta:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    
    files.forEach((file, i) => {
      formData.append('images', file);
    });

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setImages(prev => [...prev, ...data.urls]);

        const imageUrls = data.urls.map(url => `\n![image](${url})\n`).join('');
        setEditData(prev => ({
          ...prev,
          content: prev.content + imageUrls
        }));
      }
    } catch (error) {
      console.error('Błąd podczas przesyłania zdjęć:', error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
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

  if (!post) return <div>Ładowanie...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {isEditing ? (
        <form onSubmit={handleEdit} className="space-y-4">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            className="w-full p-2 text-2xl font-bold border rounded"
          />
          
          <div className="mb-4">
            <button type="button" onClick={() => imageInputRef.current?.click()} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Dodaj zdjęcia</button>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

          <textarea
            value={editData.content}
            onChange={(e) => setEditData({...editData, content: e.target.value})}
            className="w-full p-2 min-h-[300px] border rounded"
          />

          <div className="flex space-x-4">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Zapisz zmiany</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Anuluj</button>
          </div>
        </form>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold">{post.title}</h1>
              {(user?._id === post.author._id || user?.role === 'admin') && (
                <div className="space-x-2">
                  <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edytuj</button>
                  <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Usuń</button>
                </div>
              )}
            </div>
            
            <div className="mt-2 text-gray-600">
              <span>Autor: {post.author.username}</span>
              <span className="mx-2">•</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              {post.city && (
                <>
                  <span className="mx-2">•</span>
                  <span>Miasto: {post.city.name}</span>
                </>
              )}
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            {post.content.split('\n').map((paragraph, idx) => {
              if (paragraph.startsWith('![image]')) {
                const imageUrl = paragraph.match(/\((.*?)\)/)[1];
                return (
                  <div key={idx} className="my-4">
                    <Image
                      src={imageUrl}
                      alt="Post content"
                      width={800}
                      height={400}
                      className="rounded-lg"
                    />
                  </div>
                );
              }
              return <p key={idx}>{paragraph}</p>;
            })}
          </div>

          <InteractionSection targetType="post" targetId={post._id} />
        </>
      )}
    </div>
  );
}