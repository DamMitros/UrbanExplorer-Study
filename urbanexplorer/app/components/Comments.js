'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

export default function Comments({ targetType, targetId }) {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [targetType, targetId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?targetType=${targetType}&targetId=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania komentarzy:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          targetType,
          targetId,
          authorId: user._id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setComments([...comments, data]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Błąd podczas dodawania komentarza:', error);
    }
  };

  const handleEdit = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });

      if (res.ok) {
        const updatedComment = await res.json();
        setComments(comments.map(c => 
          c._id === commentId ? updatedComment : c
        ));
        setEditingId(null);
      }
    } catch (error) {
      console.error('Błąd podczas edycji komentarza:', error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setComments(comments.filter(c => c._id !== commentId));
      }
    } catch (error) {
      console.error('Błąd podczas usuwania komentarza:', error);
    }
  };

  return (
    <div className="comments-section mt-4">
      <h3 className="text-xl font-bold mb-4">Komentarze</h3>
      
      {user && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Dodaj komentarz..."
          />
          <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Dodaj komentarz</button>
        </form>
      )}

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment._id} className="p-3 bg-gray-50 rounded">
            {editingId === comment._id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="mt-2 space-x-2">
                  <button onClick={() => handleEdit(comment._id)} className="bg-green-500 text-white px-3 py-1 rounded">Zapisz</button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-3 py-1 rounded">Anuluj</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-bold">{comment.author.username}</p>
                <p>{comment.content}</p>
                {(user?._id === comment.author._id || user?.role === 'admin') && (
                  <div className="mt-2 space-x-2">
                    {user._id === comment.author._id && (
                      <button onClick={() => {
                        setEditingId(comment._id);
                        setEditContent(comment.content);
                      }}className="text-blue-500 hover:underline">Edytuj</button>
                    )}
                    <button onClick={() => handleDelete(comment._id)} className="text-red-500 hover:underline">Usuń</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}