import { connectToDB } from "@/utils/database";
import Post from "@/models/Post";

export async function PUT(req) {
  const { postId, action } = await req.json();
  const guideId = user._id;

  try {
    await connectToDB();
    const post = await Post.findById(postId);
    
    if (!post) {
      return new Response("Post nie znaleziony", { status: 404 });
    }

    post.isVerified = action === 'verify';
    post.verifiedBy = action === 'verify' ? guideId : null;
    post.verifiedAt = action === 'verify' ? new Date() : null;
    await post.save();

    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error) {
    return new Response("Błąd serwera", { status: 500 });
  }
}
