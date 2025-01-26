import { connectToDB } from "@/utils/database";
import Blog from "@/models/Blog";

export async function PUT(req, { params }) {
  try {
    const { blocked } = await req.json();
    const { blogId } = params;

    await connectToDB();
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { blocked },
      { new: true }
    ).populate('author');

    if (!blog) {
      return new Response(
        JSON.stringify({ error: "Blog not found" }), 
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(blog), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error" }), 
      { status: 500 }
    );
  }
}