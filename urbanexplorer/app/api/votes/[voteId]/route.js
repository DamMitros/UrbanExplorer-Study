// app/api/votes/[voteId]/route.js
import { connectToDB } from "@/utils/database";
import Vote from "@/models/Vote";

export async function PUT(req, { params }) {
  try {
    const { voteId } = params;
    const { value } = await req.json();
    await connectToDB();

    const vote = await Vote.findById(voteId);
    if (!vote) {
      return new Response("Vote not found", { status: 404 });
    }

    vote.value = value;
    await vote.save();

    const votes = await Vote.find({ targetId: vote.targetId, targetType: vote.targetType });
    const upvotes = votes.filter(v => v.value === 1).length;
    const downvotes = votes.filter(v => v.value === -1).length;

    return new Response(JSON.stringify({
      upvotes,
      downvotes,
      userVote: value,
      voteId: vote._id
    }), { status: 200 });
  } catch (error) {
    return new Response("Błąd serwera", { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { voteId } = params;
    await connectToDB();

    const vote = await Vote.findById(voteId);
    if (!vote) {
      return new Response("Vote not found", { status: 404 });
    }

    const { targetId, targetType } = vote;
    await vote.delete();

    const votes = await Vote.find({ targetId, targetType });
    const upvotes = votes.filter(v => v.value === 1).length;
    const downvotes = votes.filter(v => v.value === -1).length;

    return new Response(JSON.stringify({
      upvotes,
      downvotes,
      userVote: null,
      voteId: null
    }), { status: 200 });
  } catch (error) {
    return new Response("Błąd serwera", { status: 500 });
  }
}