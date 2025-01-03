import mongoose from 'mongoose';

let isConnected = false; 

export async function connectToDB() {
  if (isConnected) return;

  try {
    console.log('Próba połączenia z bazą danych...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Połączono z bazą danych');
  } catch (error) {
    console.error('Błąd podczas łączenia z bazą danych:', error);
    throw error;
  }
}