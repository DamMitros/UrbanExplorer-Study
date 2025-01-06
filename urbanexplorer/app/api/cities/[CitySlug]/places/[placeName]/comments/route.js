  import { connectToDB } from "../../../../../../../utils/database";
  import City from "../../../../../../../models/City";

  export async function POST(req, { params }) {
    const { CitySlug, placeName } = await params;
    const { username, content } = await req.json();

    try {
      await connectToDB();
      const city = await City.findOne({ slug: CitySlug });
      if (!city) {
        return new Response("Miasto nie znalezione", { status: 404 });
      }
      const place = city.places.find(p => p.name === placeName);
      if (!place) {
        return new Response(`Miejsce nie znalezione: ${placeName}`, { status: 404 });
      }

      place.comments.push({ username, content });
      await city.save();

      return new Response(JSON.stringify(place), { status: 201 });
    } catch (error) {
      console.error("Błąd podczas dodawania komentarza:", error);
      return new Response("Błąd serwera", { status: 500 });
    }
  }

  export async function PUT(req, { params }) {
    const { CitySlug, placeName } = await params;
    const { content, commentId } = await req.json();
    try {
      await connectToDB();
      const city = await City.findOne({ slug: CitySlug });
      if (!city) {
        return new Response("Miasto nie znalezione", { status: 404 });
      }
      const place = city.places.find(p => p.name === placeName);
      if (!place) {
        return new Response(`Miejsce nie znalezione: ${placeName}`, { status: 404 });
      }
      const comment = place.comments.find(c => c._id == commentId);
      if (!comment) {
        return new Response("Komentarz nie znaleziony", { status: 404 });
      }
      comment.content = content;
      await city.save();

      return new Response(JSON.stringify(place), { status: 200 });
    } catch (error) {
      console.error("Błąd podczas edytowania komentarza:", error);
      return new Response("Błąd serwera", { status: 500 });
    }
  }

  export async function DELETE(req, { params }) {
    const { CitySlug, placeName } = await params;
    const { commentId } = await req.json();
    
    try {
      await connectToDB();
      const city = await City.findOne({ slug: CitySlug });
      if (!city) {
        return new Response("Miasto nie znalezione", { status: 404 });
      }
      const place = city.places.find(p => p.name === placeName);
      if (!place) {
        return new Response(`Miejsce nie znalezione: ${placeName}`, { status: 404 });
      }

      const commentIndex = place.comments.findIndex(c => c._id == commentId);
      if (commentIndex === -1) {
        return new Response("Komentarz nie znaleziony", { status: 404 });
      }

      place.comments.splice(commentIndex, 1);
      await city.save();

      return new Response(JSON.stringify(place), { status: 200 });
    } catch (error) {
      console.error("Błąd podczas usuwania komentarza:", error);
      return new Response("Błąd serwera", { status: 500 });
    }
  }
