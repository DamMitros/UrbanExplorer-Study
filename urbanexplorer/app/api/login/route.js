import { connectToDB } from '@/utils/database';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { username, password } = await req.json();

  try{
    await connectToDB();
    const existingUser = await User.findOne({username});
    if(!existingUser){
      return new Response('Nieprawidłowe dane', {status: 401});
    }
    if(!(await bcrypt.compare(password, existingUser.password))){
      return new Response('Nieprawidłowe dane', {status: 401});
    }
    return new Response(JSON.stringify({messege: 'Zalogowano',username: existingUser.username, role: existingUser.role}), {status: 200});
  } catch(error){
    console.error('Błąd podczas logowania:', error);
    return new Response('Błąd serwera', {status: 500});
  }
}