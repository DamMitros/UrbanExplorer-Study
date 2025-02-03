"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminBlogs() {
  const { user } = useUser();
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania blogów:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBlogs();
  }, [user]);

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten blog?')) {
      return;
    }

    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setBlogs(blogs.filter(blog => blog._id !== blogId));
      }
    } catch (error) {
      console.error('Błąd podczas usuwania bloga:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Ładowanie...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-600">Brak dostępu</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Zarządzaj blogami</h1>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-gray-50">Lista blogów</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nazwa bloga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs.map(blog => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{blog.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{blog.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{blog.author.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => router.push(`/blogs/${blog._id}/edit`)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors">Edytuj</button>
                    <button onClick={() => handleDeleteBlog(blog._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors">Usuń</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}