"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";

export default function PostsList({ city = null, place = null, user123 = null }) {
  const router = useRouter();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const query = [];
        if (city) query.push(`city=${city._id}`);
        if (place) query.push(`place=${place._id}`);
        if (user123) query.push(`author=${user123._id}`);
        
        const queryString = query.length > 0 ? `?${query.join("&")}` : "";
        const res = await fetch(`/api/posts${queryString}`);

        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Błąd sieci:", error);
      }
    }

    fetchPosts();
  }, [city, place, user123]);

  return (
    <div className="space-y-4">
      {posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <div key={post._id} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer mb-4" onClick={() => router.push(`/posts/${post._id}`)}>
              <div>
                <h3 className="font-bold text-lg">{post.title}</h3>
                <p className="text-sm text-gray-500 mt-2">Autor: {post.author?.username}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">
          Brak postów do wyświetlenia.
        </p>
      )}
    </div>
  );
}
