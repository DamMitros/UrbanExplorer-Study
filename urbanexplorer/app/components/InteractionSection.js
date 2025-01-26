'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import Comments from './Comments';

export default function InteractionSection({ targetType, targetId }) {
  const { user } = useUser();
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState(null);
  const [voteId, setVoteId] = useState(null);

  useEffect(() => {
    fetchVotes();
  }, [targetId]);

  const fetchVotes = async () => {
    try {
      const res = await fetch(`/api/votes?targetType=${targetType}&targetId=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setVotes({
          upvotes: data.upvotes,
          downvotes: data.downvotes
        });
        setUserVote(data.currentVote);
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

      if (userVote === value) {
        res = await fetch(`/api/votes/${voteId}`, {
          method: 'DELETE'
        });
      } else if (userVote) {
        res = await fetch(`/api/votes/${voteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value })
        });
      } else {
        res = await fetch('/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetType,
            targetId,
            userId: user._id,
            value
          })
        });
      }

      if (res.ok) {
        const data = await res.json();
        setVotes({
          upvotes: data.upvotes,
          downvotes: data.downvotes
        });
        setUserVote(data.currentVote);
        if (data.voteId) setVoteId(data.voteId);
      }
    } catch (error) {
      console.error('Błąd podczas głosowania:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => handleVote(1)} className={`px-4 py-2 rounded flex items-center gap-2 ${
           userVote === 1 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <span>👍</span>
          <span>{votes.upvotes}</span>
        </button>
        <button onClick={() => handleVote(-1)} className={`px-4 py-2 rounded flex items-center gap-2 ${
            userVote === -1 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <span>👎</span>
          <span>{votes.downvotes}</span>
        </button>
      </div>

      <Comments targetType={targetType} targetId={targetId} />
    </div>
  );
}