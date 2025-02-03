import { connectToDB } from '@/utils/database';
import ChatRoom from '@/models/ChatRoom';

export async function GET() {
  try {
    await connectToDB();
    const rooms = await ChatRoom.find().populate('creator', 'username');
    return new Response(JSON.stringify(rooms), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Błąd serwera' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, description, creator } = await req.json();
    await connectToDB();
    
    const newRoom = new ChatRoom({
      name,
      description,
      creator
    });

    await newRoom.save();
    return new Response(JSON.stringify(newRoom), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Błąd serwera' }), { status: 500 });
  }
}