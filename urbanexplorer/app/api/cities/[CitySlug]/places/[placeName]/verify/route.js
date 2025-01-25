import { connectToDB } from "@/utils/database";
import City from "@/models/City";

export async function PUT(req, { params }) {
  const { action } = await req.json();
  const { CitySlug, placeName } = await params;

  try {
    await connectToDB();
    const city = await City.findOne({ slug: CitySlug });
    
    if (!city) {
      return new Response("Miasto nie znalezione", { status: 404 });
    }

    const place = city.places.find(p => p.name === placeName);
    if (!place) {
      return new Response("Miejsce nie znalezione", { status: 404 });
    }

    place.isVerified = action === 'verify';
    place.verifiedBy = action === 'verify' ? req.user?._id : null;
    place.verifiedAt = action === 'verify' ? new Date() : null;
    
    await city.save();

    return new Response(JSON.stringify(place), { status: 200 });
  } catch (error) {
    console.error("Błąd weryfikując miejsce:", error);
    return new Response("Błąd serwera", { status: 500 });
  }
}