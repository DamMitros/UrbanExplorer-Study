import { publishMessage } from '../../../../utils/mqtt';
import { connectToDB } from "@/utils/database";
import Blog from "@/models/Blog";
import Post from "@/models/Post"; 
import User from "@/models/User";

export async function PUT(req, { params }) {
  try {
    await connectToDB();
    const { blogId } = await params;
    const { name, description, city } = await req.json();

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { name, description, city },
      { new: true }
    );

    if (!updatedBlog) {
      return new Response("Blog nie znaleziony", { status: 404 });
    }

    publishMessage('blogs/update', {
      title: 'Zaktualizowano blog',
      message: `Zaktualizowano blog: ${updatedBlog.name}`,
      timestamp: new Date(),
      type: 'blog'
    });

    return new Response(JSON.stringify(updatedBlog), { status: 200 });
  } catch (error) {
    return new Response("Błąd podczas aktualizacji bloga", { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    await connectToDB();
    const { blogId } = await params;

    const blog = await Blog.findById(blogId)
      .populate('author', 'username')

    if (!blog) {
      return new Response(
        JSON.stringify({ error: "Blog nie znaleziony" }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify(blog), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Błąd podczas pobierania bloga:", error);
    return new Response(
      JSON.stringify({ error: "Nie udało się pobrać bloga" }), 
      { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    const { blogId } = await params;
    const blog = await Blog.findByIdAndDelete(blogId);

    if (!blog) {
      return new Response("Blog nie znaleziony", { status: 404 });
    }

    publishMessage('blogs/delete', {
      title: 'Usunięto blog',
      message: `Usunięto blog: ${blog.name}`,
      timestamp: new Date(),
      type: 'blog'
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("Błąd podczas usuwania bloga", { status: 500 });
  }
}