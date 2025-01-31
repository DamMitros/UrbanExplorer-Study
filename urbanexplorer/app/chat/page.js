"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Chat from '../components/Chat';

export default function ChatRoomsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  const createRoom = async () => {
    if (!newRoomName.trim()) return;

    setRooms([...rooms, {
      id: Date.now(),
      name: newRoomName,
      createdBy: user.username,
      participants: []
    }]);
    setNewRoomName('');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Czaty na żywo</h2>
          
          {user && (
            <div className="mb-4">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Nazwa pokoju"
                className="w-full p-2 border rounded mb-2"
              />
              <button onClick={createRoom} className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Utwórz pokój</button>
            </div>
          )}

          <div className="space-y-2">
            {rooms.map(room => (
              <div key={room.id} onClick={() => setSelectedRoom(room)} className={`p-2 rounded cursor-pointer ${
                  selectedRoom?.id === room.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
              >
                <p className="font-medium">{room.name}</p>
                <p className="text-sm text-gray-500">Utworzony przez: {room.createdBy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3">
          {selectedRoom ? (
            <Chat room={selectedRoom.name} />
          ) : (
            <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
              Wybierz pokój aby rozpocząć czat
            </div>
          )}
        </div>
      </div>
    </div>
  );
}