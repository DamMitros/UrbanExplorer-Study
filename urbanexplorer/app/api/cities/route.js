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

export async function POST(req) {
  try {
    await connectToDB();
    const { name, slug, geolocation } = await req.json();

    if (!name || !slug || !geolocation) {
      return new Response(
        JSON.stringify({ error: "Wszystkie pola są wymagane" }), 
        { status: 400 }
      );
    }

    const existingCity = await City.findOne({ slug });
    if (existingCity) {
      return new Response(
        JSON.stringify({ error: "Miasto o takim slugu już istnieje" }), 
        { status: 409 }
      );
    }
    
    const newCity = new City({
      name,
      slug,
      geolocation,
      places: []
    });
    
    await newCity.save();
    return new Response(JSON.stringify(newCity), { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Błąd podczas dodawania miasta:", error);
    return new Response(
      JSON.stringify({ error: "Błąd serwera" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}