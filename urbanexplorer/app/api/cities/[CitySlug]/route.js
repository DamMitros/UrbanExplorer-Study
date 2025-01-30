import { connectToDB } from "../../../../utils/database";
import City from "../../../../models/City";

export async function POST(req, { params }) {
  const { name, description, latitude, longitude, attachments } = await req.json();
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
      attachments: attachments || [] 
    });
    await city.save();

    return new Response(
      JSON.stringify({ message: "Dodano miejsce", place: city.places[city.places.length - 1] }),
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
    const searchQuery = url.searchParams.get("searchQuery");
    const searchType = url.searchParams.get("searchType");
    const sortBy = url.searchParams.get("sortBy");

    let city = await City.findOne({ slug: citySlug });

    if (!city) {
      return new Response("Miasto nie znalezione", { status: 404 });
    }

    if (searchQuery) {
      city.places = city.places.filter(place => {
        if (searchType === 'name') {
          return place.name.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (searchType === 'description') {
          return place.description.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
          return place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 place.description.toLowerCase().includes(searchQuery.toLowerCase());
        }
      });
    }

    if (sortBy) {
      city.places.sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case 'most_liked':
            return (b.upvotes || 0) - (a.upvotes || 0);
          case 'most_disliked':
            return (b.downvotes || 0) - (a.downvotes || 0);
          case 'controversial':
            const aControversy = (a.upvotes || 0) * (a.downvotes || 0);
            const bControversy = (b.upvotes || 0) * (b.downvotes || 0);
            return bControversy - aControversy;
          default: // newest
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
    }

    return new Response(JSON.stringify(city), { status: 200 });
  } catch (error) {
    console.error("Błąd podczas pobierania miasta:", error);
    return new Response("Błąd serwera", { status: 500 });
  }
}