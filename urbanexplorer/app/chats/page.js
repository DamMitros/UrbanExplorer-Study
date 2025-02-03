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

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
        <div className="md:col-span-1 bg-white rounded-lg shadow-lg p-4 overflow-y-auto max-h-screen">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-2xl font-bold text-gray-800">Pokoje czatu</h2>
            <button onClick={() => setIsCreating(!isCreating)} className="text-blue-500 hover:text-blue-600">
              {isCreating ? 'Anuluj' : '+ Nowy'}
            </button>
          </div>

          {isCreating && (
            <form onSubmit={handleCreateRoom} className="mb-4 space-y-3">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Nazwa pokoju"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
                placeholder="Opis pokoju"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Utwórz pokój</button>
            </form>
          )}

          <div className="space-y-2">
            {rooms.map((room) => (
              <button key={room._id} onClick={() => setSelectedRoom(room)} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedRoom?._id === room._id? 'bg-blue-500 text-white': 'hover:bg-gray-100 text-gray-700'}`}>
                <span className="font-medium block">{room.name}</span>
                <span className="text-sm text-gray-500">{room.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 bg-white rounded-lg shadow-lg p-4">
          {selectedRoom ? (
            <>
              <div className="border-b pb-4 mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedRoom.name}</h3>
                <p className="text-sm text-gray-600">{selectedRoom.description}</p>
              </div>
              <Chat room={selectedRoom.name} />
            </>
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-200px)] text-gray-500">
              <p>Wybierz pokój czatu aby rozpocząć rozmowę</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}