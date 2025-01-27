import { connectToDB } from "@/utils/database";
import models from "@/models";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const place = searchParams.get('place'); 
    const blog = searchParams.get('blog');
    const author = searchParams.get('author');

    await connectToDB();

    const query = {};
    
    if (city) query.city = city;
    if (place) query.place = place;
    if (blog) query.blog = blog;
    if (author) query.author = author;

    const posts = await models.Post.find(query)
      .populate('author', 'username')
      .populate('city', 'name slug')
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(posts), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
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

    const newPost = new models.Post({
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