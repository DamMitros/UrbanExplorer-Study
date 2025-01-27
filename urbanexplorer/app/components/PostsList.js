"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostsList({ city = null, place = null, blog = null }) {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const queryParams = new URLSearchParams();
        if (blog) {
          queryParams.append('blog', blog._id);
        } else if (city) {
          queryParams.append('city', city._id);
          if (place) queryParams.append('place', place._id);
        }

        const res = await fetch(`/api/posts?${queryParams}`);
        
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        } else {
          console.error('Nie udało się pobrać postów:', await res.text());
        }
      } catch (error) {
        console.error('Błąd sieci:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [city, place, blog]);

  if (loading) {
    return <div className="text-center p-4 text-gray-500">Ładowanie postów...</div>;
  }

  return (
    <div className="max-h-[600px] overflow-y-auto shadow-sm rounded-lg">
      {posts.length > 0 ? (
        <div className="space-y-2 p-2">
          {posts.map((post) => (
            <div key={post._id}  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer border border-gray-200" onClick={() => router.push(`/posts/${post._id}`)}>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{post.title}</h3>
              <div className="flex justify-between items-center">
                <nav className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">Autor: <span className="font-medium">{post.author?.username}</span>,</p>
                  {post.city && <p className="text-sm text-gray-500">Miasto: <span className="font-medium">{post.city?.name}</span></p>}
                </nav>
                <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-500 text-center">Nie znaleziono żadnych postów</p>
          <p className="text-sm text-gray-400 mt-2">Bądź pierwszy i dodaj post!</p>
        </div>
      )}
    </div>
  );
}
