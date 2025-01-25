"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function BlogDetailsPage({ params }) {
  const router = useRouter();
  const { user } = useUser();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blogs/${params.blogId}`);
        if (!res.ok) {
          throw new Error('Blog nie został znaleziony');
        }
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.blogId) {
      fetchBlog();
    }
  }, [params.blogId]);

  if (isLoading) {
    return <div className="text-center py-10">Ładowanie...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <Link href="/blogs" className="text-blue-500 hover:underline mt-4 inline-block">Wróć do listy blogów</Link>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{blog.name}</h1>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Autor: {blog.author.username}</span>
              {blog.city && (
                <span className="ml-4">Miasto: {blog.city}</span>
              )}
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700">{blog.description}</p>
          </div>

          {blog.posts && blog.posts.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Posty</h2>
              <div className="space-y-4">
                {blog.posts.map((post) => (
                  <div key={post._id} className="border rounded p-4">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-gray-600 mt-2">{post.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-8">Ten blog nie ma jeszcze żadnych postów.</p>
          )}

          {user && user._id === blog.author._id && (
            <div className="mt-6 flex gap-4">
              <button onClick={() => router.push(`/blogs/${blog._id}/edit`)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edytuj blog</button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link href="/blogs" className="text-blue-500 hover:underline">← Wróć do listy blogów</Link>
      </div>
    </div>
  );
}