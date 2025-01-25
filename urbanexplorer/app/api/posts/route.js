import { connectToDB } from "@/utils/database";
import Post from "@/models/Post";
import City from "@/models/City"; 
import User from "@/models/User";

export async function POST(req) {
  const { title, content, slug, placeId, author } = await req.json();
  try {
    await connectToDB();
    
    let city = null;
    if (slug) {
      city = await City.findOne({ slug: slug });
      if (!city) {
        return new Response("Miasto nie znalezione", { status: 404 });
      }
    }    
    const user = await User.findOne({ username: author.username });
    if (!user) {
      console.log("Użytkownik nie znaleziony");
      return new Response("Użytkownik nie znaleziony", { status: 404 });
    }

    const newPost = new Post({
      title,
      content,
      author: user,
      city: city._id || null,
      place: placeId || null,
    });

    await newPost.save();

    return new Response(
      JSON.stringify({ success: true, message: "Post został utworzony!", post: newPost }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Błąd podczas tworzenia posta:", error);
    return new Response("Błąd serwera", { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const author = searchParams.get("author");
  const city = searchParams.get("city");
  const user = searchParams.get("user");
  
  try {
    await connectToDB();

    const query = {};
    if (author) {
      query.author = author;
    }

    const posts = await Post.find(query).populate('author').populate('city');

    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    console.error("Błąd podczas pobierania postów:", error);
    return new Response("Błąd serwera", { status: 500 });
  }
}