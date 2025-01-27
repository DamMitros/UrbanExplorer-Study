import { connectToDB } from "@/utils/database";
import Blog from "@/models/Blog";

export async function PUT(req, { params }) {
  try {
    await connectToDB();
    const { blogId } = params;
    const { name, description, city } = await req.json();

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { name, description, city },
      { new: true }
    );

    if (!updatedBlog) {
      return new Response("Blog nie znaleziony", { status: 404 });
    }

    return new Response(JSON.stringify(updatedBlog), { status: 200 });
  } catch (error) {
    return new Response("Błąd podczas aktualizacji bloga", { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    await connectToDB();
    const { blogId } = params;

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