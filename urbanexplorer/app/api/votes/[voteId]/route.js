import { connectToDB } from "@/utils/database";
import Vote from "@/models/Vote";

export async function PUT(req, { params }) {
  const { voteId } = await params;
  const { value } = await req.json();
  
  try {
    await connectToDB();
    const vote = await Vote.findById(voteId);
    if (!vote) {
      return new Response(JSON.stringify({ error: "Głos nie znaleziony" }), { status: 404 });
    }
    
    vote.value = value;
    await vote.save();
    
    return new Response(JSON.stringify({ 
      message: "Głos zaktualizowany pomyślnie",
      vote 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { voteId } = await params;
  
  try {
    await connectToDB();
    await Vote.findByIdAndDelete(voteId);
    
    return new Response(JSON.stringify({
      message: "Głos usunięty pomyślnie" 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 }); 
  }
}