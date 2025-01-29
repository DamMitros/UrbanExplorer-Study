import { connectToDB } from "@/utils/database";
import Post from "@/models/Post";

export async function GET(request, { params }) {
  const { postId } = await params; 
  
  try {
    await connectToDB();
    const post = await Post.findById(postId)
      .populate('author', 'username')
      .populate('city', 'name');

    if (!post) {
      return new Response(JSON.stringify({ error: "Post nie znaleziony" }), { status: 404 });
    }

    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Błąd serwera" }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { postId } = await params;

  try {
    const { title, content, attachments } = await request.json();
    await connectToDB();

    const post = await Post.findByIdAndUpdate(
      postId,
      { 
        title, 
        content,
        attachments 
      },
      { new: true }
    ).populate('author', 'username');

    if (!post) {
      return new Response(
        JSON.stringify({ error: "Post nie znaleziony" }), 
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Błąd serwera" }), 
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { postId } = await params;
  
  try {
    await connectToDB();
    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      return new Response(JSON.stringify({ error: "Post nie znaleziony" }), { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Błąd serwera" }), { status: 500 });
  }
}