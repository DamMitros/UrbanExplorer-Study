import { connectToDB } from "@/utils/database";
import { publishMessage } from '@/utils/mqtt';
import Post from "@/models/Post";
import City from "@/models/City";

export async function GET(request, { params }) {
  const { postId } = await params; 
  
  try {
    await connectToDB();
    const post = await Post.findById(postId)
      .populate('author', 'username')
      .populate('city', 'name');

    if (!post) {
      return new Response(JSON.stringify({ error: "Post nie znaleziony" }), { status: 404 });
    }

    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Błąd serwera" }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { postId } = await params;

  try {
    const { title, content, attachments, city: citySlug, place, blog } = await request.json();
    await connectToDB();

    let cityId = null;
    let placeData = null;
    
    if (citySlug) {
      const cityDoc = await City.findOne({ slug: citySlug });
      if (cityDoc) {
        cityId = cityDoc._id;
        if (place) {
          placeData = cityDoc.places.id(place);
        }
      }
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      { 
        title, 
        content,
        attachments,
        city: cityId,
        place: placeData ? placeData._id : null,
        blog: blog || null
      },
      { new: true }
    )
    .populate('author', 'username')
    .populate('city', 'name');

    if (!post) {
      return new Response(
        JSON.stringify({ error: "Post nie znaleziony" }), 
        { status: 404 }
      );
    }

    publishMessage('posts/update', {
      title: 'Zaktualizowano post',
      message: `Post "${post.title}" został zaktualizowany`,
      timestamp: new Date(),
      type: 'post'
    });

    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
    return new Response(
      JSON.stringify({ error: "Błąd podczas aktualizacji posta" }), 
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { postId } = await params;
  
  try {
    await connectToDB();
    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      return new Response(JSON.stringify({ error: "Post nie znaleziony" }), { status: 404 });
    }

    publishMessage('posts/delete', {
      title: 'Usunięto post',
      message: `Post "${post.title}" został usunięty`,
      timestamp: new Date(),
      type: 'post',
      data: { postId: postId }
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Błąd serwera" }), { status: 500 });
  }
}