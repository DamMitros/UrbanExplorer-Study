"use client"

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useUser } from "@/context/UserContext";
import ChatMessage from "./ChatMessage";

export default function Chat({ room }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const { user } = useUser();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const socketUrl = "http://localhost:4000";
    const newSocket = io(socketUrl, {
      withCredentials: true,
      reconnection: true,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Połączono z WebSocket:", newSocket.id);
      if (user?.username) {
        newSocket.emit("join-room", { room, user: user.username });
      }
    });

    newSocket.on("connect_error", (err) => {
      console.error("Błąd połączenia z WebSocket:", err);
    });

    newSocket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on("users-update", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("user-typing", ({ username }) => {
      setTypingUsers((prev) =>
        prev.includes(username) ? prev : [...prev, username]
      );
    });

    newSocket.on("user-stopped-typing", ({ username }) => {
      setTypingUsers((prev) => prev.filter((user) => user !== username));
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit("leave-room", { room, user: user?.username });
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket && user?.username) {
      socket.emit("join-room", { room, user: user.username });
    }
  }, [room]);

  const handleTyping = () => {
    if (socket && user) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit("typing", { room, username: user.username });
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", { room, username: user.username });
      }, 2000);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !user || !socket) return;

    const newMessage = {
      room,
      message: message.trim(),
      author: user.username,
      reactions: [],
    };

    socket.emit("message", newMessage);
    setMessage("");
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Pokój: {room}</h3>
        <div className="text-sm text-gray-500">Online: {onlineUsers.length}</div>
      </div>

      <div className="h-96 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} currentUser={user} />
        ))}
      </div>

      {typingUsers.length > 0 && (
        <div className="text-sm text-gray-500 italic mb-2">
          {typingUsers.join(", ")} pisze...
        </div>
      )}

      {user ? (
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Napisz wiadomość..."
            className="flex-1 p-2 border rounded"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Wyślij</button>
        </form>
      ) : (
        <p className="text-center text-gray-500">Zaloguj się aby dołączyć do czatu</p>
      )}
    </div>
  );
}
