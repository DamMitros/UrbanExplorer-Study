import { connectToDB } from "../../../../utils/database";
import City from "../../../../models/City";

export async function POST(req, { params }) {
  const { name, description, latitude, longitude } = await req.json();
  const { CitySlug } = await params;

  try {
    await connectToDB();
    const city = await City.findOne({ slug: CitySlug });
    if (!city) {
      return new Response("Miasto nie znalezione", { status: 404 });
    }

    city.places.push({
      name,
      description,
      latitude,
      longitude,
    });
    await city.save();

    return new Response(
      JSON.stringify({ message: "Dodano miejsce", place: { name, description, latitude, longitude } }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Błąd podczas dodawania miejsca:", error);
    return new Response("Błąd serwera", { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectToDB();

    const url = new URL(req.url);
    const citySlug = url.pathname.split("/").pop();
    const keyword = url.searchParams.get("keyword");

    let city = await City.findOne({ slug: citySlug });

    if (!city) {
      return new Response("Miasto nie znalezione", { status: 404 });
    }

    if (keyword) {
      city.places = city.places.filter(place =>
        place.name.toLowerCase().includes(keyword.toLowerCase()) ||
        place.description.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    return new Response(JSON.stringify(city), { status: 200 });
  } catch (error) {
    console.error("Błąd podczas pobierania miast:", error);
    return new Response("Błąd serwera", { status: 500 });
  }
}
 