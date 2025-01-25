import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";

export default function PostsList({ city = null, place = null, user123 = null }) {
  const [posts, setPosts] = useState([]);
  const user = useUser();

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
        } else {
          console.error("Błąd przy pobieraniu listy postów.");
        }
      } catch (error) {
        console.error("Błąd sieci:", error);
      }
    }

    fetchPosts();
  }, [city, place, user123]);

  const handleVerify = async (postId, currentStatus) => {
    try {
      const res = await fetch(`/api/posts/${postId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId,
          action: currentStatus ? 'unverify' : 'verify'
        })
      });

      if (res.ok) {
        setPosts(posts.map(post => 
          post._id === postId 
            ? {...post, isVerified: !currentStatus} 
            : post
        ));
      }
    } catch (error) {
      console.error('Error verifying post:', error);
    }
  };

  return (
    <div>
      <h1>Lista postów</h1>
      {posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post._id}>
              <h2>{post.title} {post.isVerified && "✓"}</h2>
              <p>{post.content}</p>
              {(user?.role === 'guide' || user?.role === 'admin') && (
                <button onClick={() => handleVerify(post._id, post.isVerified)}>
                  {post.isVerified ? 'Cofnij weryfikację' : 'Zweryfikuj'}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Brak postów do wyświetlenia.</p>
      )}
    </div>
  );
}
