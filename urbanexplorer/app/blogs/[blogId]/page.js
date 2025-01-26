"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter, useParams } from "next/navigation";
import InteractionSection from "@/app/components/InteractionSection";
import CreatePost from "@/app/components/CreatePost";

export default function BlogDetailPage() {
  const { user } = useUser();
  const { blogId } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    city: ""
  });

  useEffect(() => {
    if (blogId) {
      fetchBlog();
      fetchBlogPosts();
    }
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/blogs/${blogId}`);
      if (res.ok) {
        const data = await res.json();
        setBlog(data);
        setEditForm({
          name: data.name,
          description: data.description,
          city: data.city || ""
        });
      } else {
        router.push("/blogs");
      }
    } catch (error) {
      console.error("Błąd podczas pobierania bloga:", error);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const res = await fetch(`/api/posts?blog=${blogId}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania postów:", error);
    }
  };

  const handleEditBlog = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const updatedBlog = await res.json();
        setBlog(updatedBlog);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji bloga:", error);
    }
  };

  const handleToggleBlock = async () => {
    try {
      const res = await fetch(`/api/blogs/${blogId}/block`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ blocked: !blog.blocked })
      });

      if (res.ok) {
        const updatedBlog = await res.json();
        setBlog(updatedBlog);
      }
    } catch (error) {
      console.error("Błąd podczas zmiany statusu blokady:", error);
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/posts/${editingPost._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPost)
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
        setEditingPost(null);
      }
    } catch (error) {
      console.error("Błąd podczas edycji posta:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Czy na pewno chcesz usunąć ten artykuł?")) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch (error) {
      console.error("Błąd podczas usuwania posta:", error);
    }
  };

  if (!blog) return <div className="p-4">Ładowanie...</div>;

  const isOwner = user && blog.author === user._id;
  const isAdmin = user && user.role === "admin";

  return (
    <div className="max-w-4xl mx-auto p-6">
      {blog.blocked && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Ten blog został zablokowany przez administratora.
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleEditBlog} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nazwa bloga</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Opis</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Miasto</label>
            <input
              type="text"
              value={editForm.city}
              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Zapisz zmiany</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Anuluj</button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{blog.name}</h1>
            <div className="flex space-x-4">
              {isOwner && (
                <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edytuj blog</button>
              )}
              {isAdmin && (
                <button onClick={handleToggleBlock} className={`${
                    blog.blocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                  } text-white px-4 py-2 rounded`}
                >
                  {blog.blocked ? "Odblokuj" : "Zablokuj"}
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">Autor: {blog.author} {blog.city && `| Miasto: ${blog.city}`}</p>
            <p className="text-gray-800">{blog.description}</p>
          </div>

          <InteractionSection targetType="blog" targetId={blog._id} />

          {!blog.blocked && isOwner && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">
                {isCreatingPost ? "Dodaj nowy artykuł" : (
                  <button  onClick={() => setIsCreatingPost(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Dodaj artykuł</button>
                )}
              </h3>
              
              {isCreatingPost && (
                <CreatePost blogId={blogId} onPostCreated={() => {
                    setIsCreatingPost(false);
                    fetchBlogPosts();
                  }}
                />
              )}
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Artykuły</h2>
            <div className="space-y-6">
              {posts.map(post => (
                <div key={post._id} className="bg-white rounded-lg shadow p-6">
                  {editingPost && editingPost._id === post._id && post.author === user?._id ? (
                    <form onSubmit={handleEditPost} className="space-y-4">
                      <input
                        type="text"
                        value={editingPost.title}
                        onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <textarea
                        value={editingPost.content}
                        onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={4}
                      />
                      <div className="flex space-x-4">
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Zapisz</button>
                        <button type="button" onClick={() => setEditingPost(null)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Anuluj</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                          <p className="text-gray-600">{post.content}</p>
                          <p className="text-sm text-gray-500 mt-2">Autor: {post.author.username}</p>
                        </div>
                        {user && post.author._id === user._id && (
                          <div className="flex space-x-2">
                            <button onClick={() => setEditingPost(post)} className="text-blue-500 hover:text-blue-700">Edytuj</button>
                            <button onClick={() => handleDeletePost(post._id)} className="text-red-500 hover:text-red-700">Usuń</button>
                          </div>
                        )}
                      </div>
                      <InteractionSection targetType="post" targetId={post._id} />
                    </>
                  )}
                </div>
              ))}
              {posts.length === 0 && (
                <p className="text-gray-500 text-center">Ten blog nie ma jeszcze żadnych artykułów.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}