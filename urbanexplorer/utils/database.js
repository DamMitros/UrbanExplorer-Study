import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    isConnected = true;
    console.log('Połączono z bazą danych');
  } catch (error) {
    console.error('Błąd podczas łączenia z bazą danych:', error);
    isConnected = false;
    throw error;
  }
};