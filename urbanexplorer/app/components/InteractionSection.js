'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import Comments from './Comments';

export default function InteractionSection({ targetType, targetId }) {
  const { user } = useUser();
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState(null);
  const [voteId, setVoteId] = useState(null);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  useEffect(() => {
    fetchVotes();
  }, [targetId]);

  const fetchVotes = async () => {
    try {
      const queryParams = new URLSearchParams({
        targetType,
        targetId,
        ...(user && { userId: user._id })
      });
      
      const res = await fetch(`/api/votes?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setVotes({
          upvotes: data.upvotes,
          downvotes: data.downvotes
        });
        setUserVote(data.userVote);
        setVoteId(data.voteId);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania głosów:', error);
    }
  };

  const handleVote = async (value) => {
    if (!user) {
      alert('Musisz być zalogowany aby głosować!');
      return;
    }

    try {
      let res;
      
      if (voteId) {
        if (userVote === value) {
          res = await fetch(`/api/votes/${voteId}`, {
            method: 'DELETE'
          });
          
          if (res.ok) {
            setUserVote(null);
            setVoteId(null);
            setVotes(prev => ({
              ...prev,
              [value === 1 ? 'upvotes' : 'downvotes']: prev[value === 1 ? 'upvotes' : 'downvotes'] - 1
            }));
          }
        } else {
          res = await fetch(`/api/votes/${voteId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value })
          });
          
          if (res.ok) {
            setUserVote(value);
            setVotes(prev => ({
              upvotes: prev.upvotes + (value === 1 ? 1 : -1),
              downvotes: prev.downvotes + (value === -1 ? 1 : -1)
            }));
          }
        }
      } else {
        res = await fetch('/api/votes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            targetType,
            targetId,
            userId: user._id,
            value
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          setVoteId(data.voteId);
          setUserVote(value);
          setVotes(prev => ({
            ...prev,
            [value === 1 ? 'upvotes' : 'downvotes']: prev[value === 1 ? 'upvotes' : 'downvotes'] + 1
          }));
        }
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-6">
            <button onClick={() => handleVote(1)} 
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                userVote === 1 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg className="w-6 h-6" fill={userVote === 1 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9"/>
              </svg>
              <span className="font-medium">{votes.upvotes}</span>
            </button>

            <button onClick={() => handleVote(-1)} 
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                userVote === -1 
                  ? 'text-red-600' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <svg className="w-6 h-6" fill={userVote === -1 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4"/>
              </svg>
              <span className="font-medium">{votes.downvotes}</span>
            </button>

            <button onClick={() => setIsCommentsVisible(!isCommentsVisible)} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
              </svg>
              <span className="font-medium">Komentarze</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ${
        isCommentsVisible ? 'max-h-[1000px]' : 'max-h-0'
      }`}>
        <div className="p-4 bg-gray-50">
          <Comments targetType={targetType} targetId={targetId} />
        </div>
      </div>
    </div>
  );
}