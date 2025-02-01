import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) {
    console.log('Używanie istniejącego połączenia z bazą danych');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('Nawiązano nowe połączenie z bazą danych');
    return db;
  } catch (error) {
    console.error('Błąd podczas łączenia z bazą danych:', error);
    isConnected = false;
    throw error;
  }
};