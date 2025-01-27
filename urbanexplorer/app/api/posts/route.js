import { connectToDB } from "@/utils/database";
import models from "@/models";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const place = searchParams.get('place'); 
    const blog = searchParams.get('blog');
    const author = searchParams.get('author');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const searchQuery = searchParams.get('searchQuery');

    await connectToDB();

    const query = {};
    if (city) query.city = city;
    if (place) query.place = place;
    if (blog) query.blog = blog;
    if (author) query.author = author;
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    let posts = await models.Post.find(query)
      .populate('author', 'username')
      .populate('city', 'name slug')
      .lean();

    const postsWithVotes = await Promise.all(posts.map(async (post) => {
      const votes = await models.Vote.find({ targetId: post._id, targetType: 'post' });
      const upvotes = votes.filter(v => v.value === 1).length;
      const downvotes = votes.filter(v => v.value === -1).length;
      const comments = await models.Comment.countDocuments({ targetId: post._id, targetType: 'post' });
      
      return {
        ...post,
        upvotes,
        downvotes,
        totalVotes: upvotes + downvotes,
        score: upvotes - downvotes,
        controversy: Math.min(upvotes, downvotes),
        activity: comments + upvotes + downvotes
      };
    }));

    switch (sortBy) {
      case 'newest':
        postsWithVotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        postsWithVotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'most_liked':
        postsWithVotes.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'most_disliked':
        postsWithVotes.sort((a, b) => b.downvotes - a.downvotes);
        break;
      case 'controversial':
        postsWithVotes.sort((a, b) => b.controversy - a.controversy);
        break;
      case 'most_active':
        postsWithVotes.sort((a, b) => b.activity - a.activity);
        break;
    }

    return new Response(JSON.stringify(postsWithVotes), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return new Response(JSON.stringify({ error: 'Nie udało się pobrać postów' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    
    const { title, content, city, place, blog, author } = await req.json();

    if (!title || !content || !author) {
      return new Response(
        JSON.stringify({ error: "Brak wymaganych pól" }), 
        { status: 400 }
      );
    }

    const newPost = new models.Post({
      title,
      content,
      city,
      place,
      blog,
      author
    });

    const savedPost = await newPost.save();
    await savedPost.populate('author', 'username');

    return new Response(
      JSON.stringify(savedPost), 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return new Response(
      JSON.stringify({ error: "Błąd podczas tworzenia posta" }), 
      { status: 500 }
    );
  }
}