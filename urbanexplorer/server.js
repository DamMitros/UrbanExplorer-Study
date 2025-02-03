import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import Message from "./models/Message.js"; 
import { connectToDB } from "./utils/database.js"; 
import dotenv from 'dotenv';
import { connectMQTT, publishMessage } from './utils/mqtt.js';

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

  const mqttClient = await connectMQTT();
  mqttClient.on('connect', () => {
    console.log('MQTT Broker połączony i gotowy do publikowania');
    const topics = ['chats/#', 'blogs/#', 'posts/#', 'comments/#', 'places/#'];
    topics.forEach(topic => {
      mqttClient.subscribe(topic, { qos: 1 }, (err) => {
        if (err) console.error(`Błąd subskrypcji do ${topic}:`, err);
        else console.log(`Zasubskrybowano do ${topic}`);
      });
    });
  });

  mqttClient.on('error', (err) => {
    console.error('Błąd MQTT:', err);
  });

  app.prepare().then(() => {
    const server = createServer((req, res) => handle(req, res));
    const io = new Server(server, {
      cors: { origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true
      }
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
            .populate({
              path: 'replyTo',
              select: 'message author',
              populate: {
                path: 'author',
                select: 'username'
              }
            })
            .lean();
          
          socket.emit("load-messages", messages);
          io.to(room).emit("users-update", Array.from(onlineUsers.get(room)));
        } catch (error) {
          console.error("Błąd w join-room:", error);
        }
      });

      socket.on("message", async ({ room, message, author, replyTo }) => {
        try {
          const newMessage = new Message({
            room,
            message,
            author,
            replyTo, 
            timestamp: new Date(),
          });
          await newMessage.save();

          const populatedMessage = await Message.findById(newMessage._id)
            .populate('author', 'username')
            .populate({
              path: 'replyTo',
              select: 'message author',
              populate: {
                path: 'author',
                select: 'username'
              }
            })
            .lean();
          
          io.to(room).emit("message", populatedMessage);

          publishMessage('chats/new', {
            title: 'Nowa wiadomość',
            message: `${author} wysłał wiadomość w pokoju ${room}`,
            timestamp: new Date(),
            type: 'chat'
          });
        } catch (error) {
          console.error("Błąd w zapisie wiadomości:", error);
        }
      });

      const typingUsers = new Map();

      socket.on("typing", ({ room, username }) => {
        if (!typingUsers.has(room)) {
          typingUsers.set(room, new Set());
        }
        typingUsers.get(room).add(username);
        io.to(room).emit("user-typing", { username });
      });
      
      socket.on("stop-typing", ({ room, username }) => {
        if (typingUsers.has(room)) {
          typingUsers.get(room).delete(username);
          io.to(room).emit("user-stopped-typing", { username });
        }
      });

      socket.on("add-reaction", async ({ messageId, room, emoji, userId }) => {
        try {
          const message = await Message.findById(messageId);
          if (!message) return;
      
          if (!message.reactions) {
            message.reactions = {};
          }
      
          if (!message.reactions[emoji]) {
            message.reactions[emoji] = [];
          }
      
          const userIndex = message.reactions[emoji].indexOf(userId);
      
          if (userIndex === -1) {
            message.reactions[emoji].push(userId);
          } else {
            message.reactions[emoji].splice(userIndex, 1);
            if (message.reactions[emoji].length === 0) {
              delete message.reactions[emoji];
            }
          }

          message.markModified("reactions");
          await message.save();
      
          io.to(room).emit("reaction-updated", {
            messageId: message._id,
            reactions: message.reactions
          });
      
        } catch (error) {
          console.error("Błąd obsługi reakcji:", error);
        }
      });
      
      socket.on("leave-room", ({ room, user }) => {
        if (room && user && onlineUsers.has(room)) {
          onlineUsers.get(room).delete(user);
          io.to(room).emit("users-update", Array.from(onlineUsers.get(room)));
          console.log(`Użytkownik ${user} opuścił pokój ${room}`);
        }
      });

      socket.on("room-created", (newRoom) => {
        io.emit("new-room", newRoom);
        
        publishMessage('chats/new', {
          title: 'Nowy pokój rozmów',
          message: `Utworzono nowy pokój: ${newRoom.name}`,
          timestamp: new Date(),
          type: 'chat',
          data: { roomId: newRoom._id }
        });
      });

      socket.on("disconnect", () => {
        onlineUsers.forEach((users, room) => {
          if (socket.rooms.has(room)) {
            users.forEach(username => {
              if (users.has(username)) {
                users.delete(username);
                io.to(room).emit("users-update", Array.from(users));
              }
            });
          }
        });
        console.log("Klient rozłączony:", socket.id);
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