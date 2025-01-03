import { connectToDB } from '../../../utils/database';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { username, email, password, role = 'user' } = await req.json();
    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: 'Brak wymaganych danych' }), { status: 400 });
    }
    console.log('Próba rejestracji:', username, email, role);
    await connectToDB();

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Użytkownik o podanej nazwie już istnieje' }), { status: 409 });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return new Response(JSON.stringify({ error: 'Email już zarejestrowany' }), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    return new Response(
      JSON.stringify({ message: 'Rejestracja udana', username: newUser.username }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Błąd podczas rejestracji:', error);
    return new Response(JSON.stringify({ error: 'Błąd serwera' }), { status: 500 });
  }
}
