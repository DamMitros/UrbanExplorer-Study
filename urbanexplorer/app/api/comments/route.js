import { connectToDB } from '@/utils/database';
import Comment from '@/models/Comment';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');

  try {
    await connectToDB();
    const comments = await Comment.find({ targetType, targetId }).populate('author', 'username');
    return new Response(JSON.stringify(comments), { status: 200 });
  } catch (error) {
    return new Response('Błąd podczas pobierania komentarzy', { status: 500 });
  }
}

export async function POST(req) {
  const { content, targetType, targetId, authorId } = await req.json();

  try {
    await connectToDB();
    const newComment = await Comment.create({ 
      content, 
      targetType, 
      targetId, 
      author: authorId 
    });
    await newComment.populate('author', 'username');
    return new Response(JSON.stringify(newComment), { status: 201 });
  } catch (error) {
    return new Response('Błąd podczas dodawania komentarza', { status: 500 });
  }
}