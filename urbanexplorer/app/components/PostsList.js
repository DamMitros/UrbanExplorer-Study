import { useState, useEffect } from "react";

export default function PostsList({ city, place, user }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const query = [];
        if (city) query.push(`city=${city._id}`);
        if (place) query.push(`place=${place._id}`);
        if (user) query.push(`author=${user._id}`);
        
        const queryString = query.length > 0 ? `?${query.join("&")}` : "";

        const res = await fetch(`/api/posts/list${queryString}`);

        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        } else {
          console.error("Błąd przy pobieraniu listy postów.");
        }
      } catch (error) {
        console.error("Błąd sieci:", error);
      }
    }

    fetchPosts();
  }, [city, place, user]);

  return (
    <div>
      <h1>Lista postów</h1>
      <ul>
        {posts.map((post) => (
          <li key={post._id}>
            <a href={`/blog/${post.author}`}>
              <h2>{post.title}</h2>
              <p>{post.content}</p> 
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
