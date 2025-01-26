import { connectToDB } from "@/utils/database";
import City from "@/models/City";

export async function GET(req, { params }) {
  const { CitySlug, placeName } = params;

  try {
    await connectToDB();
    const cityData = await City.findOne({ slug: CitySlug });
    
    if (!cityData) {
      return new Response("Miasto nie znalezione", { status: 404 });
    }
    
    const place = cityData.places.find(p => p.name === placeName);
    if (!place) {
      return new Response("Miejsce nie znalezione", { status: 404 });
    }

    return new Response(JSON.stringify({
      ...place.toObject(),
      _id: place._id.toString(),
      type: 'place'
    }), { status: 200 });
  } catch (error) {
    return new Response("Błąd serwera", { status: 500 });
  }
}
