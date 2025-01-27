import { connectToDB } from '@/utils/database';
import Vote from '@/models/Vote';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('targetId');
  const targetType = searchParams.get('targetType');
  const userId = searchParams.get('userId');

  try {
    await connectToDB();
    
    const query = { targetId, targetType };
    if (userId) query.user = userId;

    const votes = await Vote.find(query);
    const upvotes = votes.filter(v => v.value === 1).length;
    const downvotes = votes.filter(v => v.value === -1).length;
    const userVote = userId ? votes.find(v => v.user.toString() === userId) : null;

    return new Response(JSON.stringify({
      upvotes,
      downvotes,
      userVote: userVote ? userVote.value : null,
      voteId: userVote ? userVote._id : null
    }), { status: 200 });
  } catch (error) {
    return new Response("Błąd serwera", { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { targetType, targetId, userId, value } = await req.json();
    await connectToDB();

    const existingVote = await Vote.findOne({ 
      user: userId,
      targetType,
      targetId
    });

    if (existingVote) {
      return new Response(
        JSON.stringify({ error: "Użytkownik już zagłosował na ten element" }), 
        { status: 400 }
      );
    }

    const newVote = await Vote.create({
      user: userId,
      targetType,
      targetId,
      value
    });

    const votes = await Vote.find({ targetId, targetType });
    const upvotes = votes.filter(v => v.value === 1).length;
    const downvotes = votes.filter(v => v.value === -1).length;

    return new Response(JSON.stringify({
      upvotes,
      downvotes,
      userVote: value,
      voteId: newVote._id
    }), { status: 201 });
  } catch (error) {
    return new Response("Błąd serwera", { status: 500 });
  }
}