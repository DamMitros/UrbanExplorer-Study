"use client";

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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      if (user?.username && room) {
        newSocket.emit("join-room", { room, user: user.username });
      }
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
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    });

    newSocket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit("leave-room", { room, user: user?.username });
        newSocket.disconnect();
      }
    };
  }, [room, user]);

  useEffect(() => {
    if (socket) {
      socket.on("load-messages", (loadedMessages) => {
        setMessages(loadedMessages);
      });
    }
  }, [socket]);

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

    socket.emit("message", {
      room,
      message: message.trim(),
      author: user.username,
    });
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
        <div ref={messagesEndRef} />
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
