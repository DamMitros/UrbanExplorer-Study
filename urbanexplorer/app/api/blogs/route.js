import { connectToDB } from "@/utils/database";
import Blog from "@/models/Blog";
import User from "@/models/User"; 

export async function POST(req) {
  try {
    await connectToDB();
    const { name, description, city, author } = await req.json();

    if (!name || !description || !author) {
      return new Response(
        JSON.stringify({ error: "Brak wymaganych pól" }), 
        { status: 400 }
      );
    }

    const newBlog = new Blog({
      name,
      description,
      city: city || null,
      author,
      posts: []
    });

    const savedBlog = await newBlog.save();
    await savedBlog.populate('author', 'username');
    
    return new Response(
      JSON.stringify(savedBlog), 
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Błąd podczas tworzenia bloga:", error);
    return new Response(
      JSON.stringify({ error: "Błąd podczas tworzenia bloga", details: error.message }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function GET() {
  try {
    await connectToDB();
    console.log("Połączenie z bazą nawiązane");
    
    const blogs = await Blog.find({})
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .lean(); 

    return new Response(JSON.stringify(blogs), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error pobierając blogi:", error);
    return new Response(
      JSON.stringify({ error: "Error pobierając blogi", details: error.message }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}