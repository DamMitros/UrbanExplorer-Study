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
    <div className="space-y-4">
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow duration-200"
            placeholder="Napisz komentarz..."
            rows="3"
          />
          <div className="flex justify-end mt-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">Opublikuj</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            {editingId === comment._id ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200">Anuluj</button>
                  <button onClick={() => handleEdit(comment._id)} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200">Zapisz</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">{comment.author.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{comment.author.username}</p>
                      <p className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {(user?._id === comment.author._id || user?.role === 'admin') && (
                    <div className="flex items-center space-x-2">
                      {user._id === comment.author._id && (
                        <button onClick={() => {
                            setEditingId(comment._id);
                            setEditContent(comment.content);
                          }} className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                      )}
                      <button onClick={() => handleDelete(comment._id)} className="text-gray-600 hover:text-red-600 transition-colors duration-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}