import { connectToDB } from "../../../utils/database";
import City from "../../../models/City";

export async function GET() {
  try {
    await connectToDB();
    const cities = await City.find({}, "name slug");
    return new Response(JSON.stringify(cities), { status: 200 });
  } catch (error) {
    console.error("Błąd podczas pobierania miast:", error);
    return new Response("Błąd serwera", { status: 500 });
  }
}
