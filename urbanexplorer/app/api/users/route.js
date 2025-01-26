import { connectToDB } from '../../../utils/database';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export async function GET(req) {
  try {
    await connectToDB();
    const users = await User.find({}, '-password');
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error('Błąd podczas pobierania użytkowników:', error);
    return new Response(JSON.stringify({ error: 'Błąd serwera' }), { status: 500 });
  }
}
export async function POST(req) {
  try {
    //REJESTRACJA
    const { email, password, username, mode } = await req.json();
    await connectToDB();

    if (mode === 'register') {
      if (!email || !password || !username) {
        return new Response(JSON.stringify({ error: 'Brak wymaganych danych' }), { status: 400 });
      }

      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }]
      });
      
      if (existingUser) {
        return new Response(JSON.stringify({ error: 'Email lub nazwa użytkownika już zajęte' }), { status: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        username,
        password: hashedPassword,
      });

      await newUser.save();
      return new Response(JSON.stringify({ message: 'Rejestracja udana' }), { status: 201 });
    }

    //LOGOWANIE
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'Nieprawidłowe dane' }), { status: 401 });
    }

    const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordMatch) {
      return new Response(JSON.stringify({ error: 'Nieprawidłowe hasło' }), { status: 401 });
    }

    return new Response(JSON.stringify({
      message: 'Zalogowano',
      _id: existingUser._id,
      username: existingUser.username,
      role: existingUser.role,
      email: existingUser.email,
    }), { status: 200 });

  } catch (error) {
    console.error('Błąd:', error);
    return new Response(JSON.stringify({ error: 'Błąd serwera' }), { status: 500 });
  }
}
