import { connectToDB } from "@/utils/database";
import Post from "../../../../models/Post";
import City from "../../../../models/City";
import User from "../../../../models/User";

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
