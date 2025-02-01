import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import Message from "./models/Message.js"; 
import { connectToDB } from "./utils/database.js"; 
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI nie jest zdefiniowany w zmiennych środowiskowych');
}

const onlineUsers = new Map();

try {
  await connectToDB();
  console.log('Połączono z MongoDB');

  app.prepare().then(() => {
    const server = createServer((req, res) => handle(req, res));
    const io = new Server(server, {
      cors: { origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" }
    });

    io.on("connection", (socket) => {
      console.log("Klient połączony:", socket.id);

      socket.on("join-room", async ({ room, user }) => {
        try {
          socket.join(room);
          console.log(`Użytkownik ${user} dołączył do pokoju ${room}`);
          
          if (!onlineUsers.has(room)) {
            onlineUsers.set(room, new Set());
          }
          if (user) {
            onlineUsers.get(room).add(user);
          }

          const messages = await Message.find({ room })
            .sort({ timestamp: 1 })
            .populate('author', 'username')
            .lean(); 
          
          socket.emit("load-messages", messages);
          io.to(room).emit("users-update", Array.from(onlineUsers.get(room)));
        } catch (error) {
          console.error("Błąd w join-room:", error);
          socket.emit("error", "Nie udało się załadować wiadomości");
        }
      });

      socket.on("message", async ({ room, message, author }) => {
        try {
          const newMessage = new Message({
            room,
            message,
            author,
            timestamp: new Date()
          });
          await newMessage.save();
          io.to(room).emit("message", newMessage);
        } catch (error) {
          console.error("Błąd zapisywania wiadomości:", error);
        }
      });

      socket.on("disconnect", () => {
        onlineUsers.forEach((users, room) => {
          if (socket.rooms.has(room)) {
            const user = Array.from(users).find(u => u.id === socket.id);
            if (user) {
              users.delete(user);
              io.to(room).emit("users-update", Array.from(users));
            }
          }
        });
      });
    });

    server.listen(4000, (err) => {
      if (err) throw err;
      console.log('Gotowy na 4000');
    });
  });
} catch (error) {
  console.error('Nie udało się uruchomić serwera:', error);
  process.exit(1);
}