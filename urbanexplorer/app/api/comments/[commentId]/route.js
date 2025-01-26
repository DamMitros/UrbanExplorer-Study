// app/api/comments/[commentId]/route.js
import { connectToDB } from '@/utils/database';
import Comment from '@/models/Comment';

export async function PUT(req, { params }) {
  const { commentId } = params;
  const { content } = await req.json();

  try {
    await connectToDB();
    const comment = await Comment.findById(commentId).populate('author', 'username');
    
    if (!comment) {
      return new Response('Komentarz nie znaleziony', { status: 404 });
    }

    comment.content = content;
    await comment.save();
    
    return new Response(JSON.stringify(comment), { status: 200 });
  } catch (error) {
    return new Response('Błąd podczas aktualizacji komentarza', { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { commentId } = params;

  try {
    await connectToDB();
    const comment = await Comment.findByIdAndDelete(commentId);
    
    if (!comment) {
      return new Response('Komentarz nie znaleziony', { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response('Błąd podczas usuwania komentarza', { status: 500 });
  }
}