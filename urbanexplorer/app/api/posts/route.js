import { connectToDB } from "@/utils/database";
import models from "@/models";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get('city');
    const placeId = searchParams.get('place');
    const blogId = searchParams.get('blog');
    const sortBy = searchParams.get('sortBy');
    const searchQuery = searchParams.get('searchQuery');
    const searchType = searchParams.get('searchType');

    await connectToDB();
    
    let query = {};

    if (citySlug) {
      const city = await models.City.findOne({ slug: citySlug });
      if (city) {
        query.city = city._id;
        if (placeId) query.place = placeId;
      }
    }

    if (placeId) query.place = placeId;
    if (blogId) query.blog = blogId;

    if (searchQuery) {
      if (searchType === 'title') {
        query.title = { $regex: searchQuery, $options: 'i' };
      } else if (searchType === 'content') {
        query.content = { $regex: searchQuery, $options: 'i' };
      } else if (searchType === 'author') {
        const users = await models.User.find({ username: { $regex: searchQuery, $options: 'i' } });
        const userIds = users.map(user => user._id);
        query.author = { $in: userIds };
      } else if (searchType === 'all') {
        query.$or = [
          { title: { $regex: searchQuery, $options: 'i' } },
          { content: { $regex: searchQuery, $options: 'i' } },
          { author: { $in: await models.User.find({ username: { $regex: searchQuery, $options: 'i' } }).distinct('_id') } }
        ];
      }
    }

    const posts = await models.Post.find(query)
      .populate('author', 'username')
      .populate('city', 'name')
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
    console.error('Error pobierając posty:', error);
    return new Response(JSON.stringify({ error: 'Nie udało się pobrać postów' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

export async function POST(req) {
  try {
    const { title, content, attachments, author, city, place, blog } = await req.json();

    await connectToDB();

    const newPost = new models.Post({
      title,
      content,
      attachments,
      author,
      city,
      place,
      blog
    });

    await newPost.save();

    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Błąd tworząc post:', error);
    return new Response(JSON.stringify({ error: 'Błąd tworząc post' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}