import { connectToDB } from "@/utils/database";
import Post from "@/models/Post";
import City from "@/models/City"; 

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const author = searchParams.get("author");
  const city = searchParams.get("city");

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
