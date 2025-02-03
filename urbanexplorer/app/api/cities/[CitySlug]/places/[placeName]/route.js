import { publishMessage } from '@/utils/mqtt.js';
import { connectToDB } from "@/utils/database";
import City from "@/models/City";

export async function GET(req, { params }) {
  const { CitySlug, placeName } = await params; 

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

export async function PUT(req, { params }) {
  const { CitySlug, placeName } = await params;
  const { name, description, latitude, longitude, attachments } = await req.json();

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

    place.name = name;
    place.description = description;
    place.latitude = latitude;
    place.longitude = longitude;
    place.attachments = attachments || [];
    place.isVerified = false;
    place.verifiedBy = null;
    place.verifiedAt = null;

    await city.save();
    
    publishMessage('places/update', {
      title: 'Zaktualizowano miejsce',
      message: `Zaktualizowano miejsce: ${placeName} w ${CitySlug}`,
      timestamp: new Date(),
      type: 'place',
      data: {
        citySlug: CitySlug,
        placeName
      }
    });
    
    return new Response(JSON.stringify(place), { status: 200 });
  } catch (error) {
    console.error('Error updating place:', error);
    return new Response("Błąd serwera", { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { CitySlug, placeName } = params;

  try {
    await connectToDB();
    const city = await City.findOne({ slug: CitySlug });
    if (!city) {
      return new Response("Miasto nie znalezione", { status: 404 });
    }

    city.places = city.places.filter(p => p.name !== placeName);
    await city.save();
    
    publishMessage('places/delete', {
      title: 'Usunięto miejsce',
      message: `Usunięto miejsce: ${placeName} w ${CitySlug}`,
      timestamp: new Date(),
      type: 'place',
      data: {
        citySlug: CitySlug,
        placeName
      }
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("Błąd serwera", { status: 500 });
  }
}
