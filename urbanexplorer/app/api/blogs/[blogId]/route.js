import { connectToDB } from "@/utils/database";
import Blog from "@/models/Blog";
import User from "@/models/User";
import Post from "@/models/Post";  // Add this import
import City from "@/models/City"; 

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

export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get("city");
    const authorId = searchParams.get("author");
    const placeId = searchParams.get("place");
    const blogId = searchParams.get("blog");

    const query = {};

    if (citySlug) {
      const city = await City.findOne({ slug: citySlug });
      if (city) {
        query.city = city._id;
      }
    }

    if (authorId) {
      query.author = authorId;
    }

    if (placeId) {
      query.place = placeId;
    }

    if (blogId) {
      query.blog = blogId;
    }

    const posts = await Post.find(query)
      .populate('author', 'username')
      .populate('blog', 'name')
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(posts), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }), 
      { status: 500 }
    );
  }
}