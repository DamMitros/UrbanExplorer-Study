"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InteractionSection from './InteractionSection';

export default function PostsList({ city = null, place = null, blog = null, user123 = null, sortBy = "newest", searchQuery = "", searchType = "default" }) {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const queryParams = new URLSearchParams();
        if (user123?._id) queryParams.append('author', user123._id);
        if (blog?._id) queryParams.append('blog', blog._id);
        if (city?.slug) queryParams.append('city', city.slug);
        if (place?._id) queryParams.append('place', place._id);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (searchQuery) {
          queryParams.append('searchQuery', searchQuery);
          queryParams.append('searchType', searchType);
        }
        
        const res = await fetch(`/api/posts?${queryParams}`);
        
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania postów:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [city, place, blog, user123, sortBy, searchQuery, searchType]);

  if (loading) {
    return <div className="text-center p-4 text-gray-500">Ładowanie postów...</div>;
  }

  return (
    blog ? (
      <div className="max-w-4xl mx-auto">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post._id} className="mb-16 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                <h2 onClick={() => router.push(`/posts/${post._id}`)} className="text-3xl font-semibold mb-4 hover:text-blue-600 cursor-pointer">{post.title}</h2>
                
                <div className="flex items-center text-sm text-gray-600 mb-6">
                  <div className="flex items-center">
                    <span className="font-medium">{post.author?.username || "Nieznany autor"}</span>
                  </div>
                  <span className="mx-3">•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                  {post.city && (
                    <>
                      <span className="mx-3">•</span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        {post.city.name}
                      </span>
                    </>
                  )}
                </div>

                <div className="prose max-w-none">
                  <div className="text-gray-800 leading-relaxed mb-6">
                    {post.content.split('\n').map((paragraph, index) => {
                      if (paragraph.startsWith('![')) {
                        const match = paragraph.match(/!\[.*?\]\((.*?)\)/);
                        if (match) {
                          return (
                            <div key={index} className="my-6">
                              <img src={match[1]} alt="Post image" className="w-full rounded-lg" />
                            </div>
                          );
                        }
                      }
                      return <p key={index} className="mb-4">{paragraph}</p>;
                    })}
                  </div>
                </div>
                
                <InteractionSection targetType="post" targetId={post._id} />
              </div>
            </article>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-900">Autor nie podzielił się jeszcze żadną historią w tym blogu</h3>
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="max-h-[500px] overflow-y-auto shadow-sm rounded-lg">
        {posts.length > 0 ? (
          <div className="space-y-2 p-2">
            {posts.map((post) => (
              <div key={post._id} onClick={() => router.push(`/posts/${post._id}`)} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer border border-gray-200">
                <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span>Autorstwa: {post.author?.username || "Nieznany autor"}</span>
                  {post.city && (
                    <>
                      <span className="mx-2">•</span>
                      <span>Miasto: {post.city.name}</span>
                    </>
                  )}
                  <span className="mx-2">•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-500 text-center">Nie znaleziono żadnych postów</p>
            <p className="text-sm text-gray-500">Bądź pierwszy i podziel się swoją historią!</p>
          </div>
        )}
      </div>
    )
  );
}
