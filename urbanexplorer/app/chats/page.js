"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Chat from '../components/Chat';
import io from 'socket.io-client';

export default function ChatRoomsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket"]
    });

    newSocket.on("new-room", (newRoom) => {
      if (newRoom.creator !== user._id) {
        setRooms(prevRooms => [newRoom, ...prevRooms]);
      }
    });

    setSocket(newSocket);
    fetchRooms();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [user, router]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/chatrooms');
      if (res.ok) {
        const data = await res.json();
        const sortedRooms = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRooms(sortedRooms);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania pokoi:', error);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/chatrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRoomName,
          description: newRoomDescription,
          creator: user._id
        }),
      });

      if (res.ok) {
        const newRoom = await res.json();

        setRooms(prev => [newRoom, ...prev]);
        setNewRoomName('');
        setNewRoomDescription('');
        setIsCreating(false);
        
        if (socket) {
          socket.emit("room-created", newRoom);
        }
      }
    } catch (error) {
      console.error('Błąd podczas tworzenia pokoju:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-slate-600 animate-pulse">Aby korzystać z czatów, zaloguj się...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 min-h-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Pokoje czatu</h2>
                <button onClick={() => setIsCreating(!isCreating)} className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    {isCreating ? (
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    )}
                  </svg>
                  {isCreating ? 'Anuluj' : 'Nowy pokój'}
                </button>
              </div>

              {isCreating && (
                <form onSubmit={handleCreateRoom} className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa pokoju</label>
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Wprowadź nazwę pokoju"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Opis</label>
                    <textarea
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      placeholder="Opisz pokój"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      rows={3}
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">Utwórz pokój</button>
                </form>
              )}

              <div className="space-y-2 overflow-y-auto" style={{ height: '560px' }}>
                {rooms.map((room) => (
                  <button key={room._id} onClick={() => setSelectedRoom(room)} className={`w-full text-left p-4 rounded-lg transition-colors ${selectedRoom?._id === room._id ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <h3 className="font-semibold mb-1">{room.name}</h3>
                    <p className={`text-sm ${selectedRoom?._id === room._id ? 'text-blue-100' : 'text-slate-500'}`}>{room.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-6 min-h-[calc(100vh-200px)]">
              {selectedRoom ? (
                <>
                  <div className="border-b border-slate-200 pb-4 mb-4">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{selectedRoom.name}</h3>
                    <p className="text-slate-600">{selectedRoom.description}</p>
                  </div>
                  <div style={{ height: 'auto' }}>
                    <Chat room={selectedRoom.name} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg">Wybierz pokój czatu aby rozpocząć rozmowę</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}