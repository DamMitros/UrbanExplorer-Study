import { connectToDB } from "@/utils/database";
import Post from "@/models/Post";
import City from "@/models/City"; 
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get("city");
    const authorId = searchParams.get("author");
    const placeId = searchParams.get("place");

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

    const posts = await Post.find(query)
      .populate('author', 'username')
      .populate('city', 'name slug')
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
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    
    const { title, content, city, place, blog, author } = await req.json();

    if (!title || !content || !author) {
      return new Response(
        JSON.stringify({ error: "Brak wymaganych pól" }), 
        { status: 400 }
      );
    }

    const newPost = new Post({
      title,
      content,
      city,
      place,
      blog,
      author
    });

    const savedPost = await newPost.save();
    await savedPost.populate('author', 'username');

    return new Response(
      JSON.stringify(savedPost), 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return new Response(
      JSON.stringify({ error: "Błąd podczas tworzenia posta" }), 
      { status: 500 }
    );
  }
}