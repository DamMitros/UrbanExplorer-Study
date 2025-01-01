import { connectToDB } from '@/utils/database';
import Comment from '@/models/Comment';

export async function GET(req) {
  await connectToDB();
  const comments = await Comment.find({});
  return new Response(JSON.stringify(comments), { status: 200 });
}

export async function POST(req) {
  const { content, author } = await req.json();
  await connectToDB();
  const newComment = await Comment.create({ content, author });
  return new Response(JSON.stringify(newComment), { status: 201 });
}

export async function PUT(req) {
  const { id, content } = await req.json();
  await connectToDB();
  const updatedComment = await Comment.findByIdAndUpdate(id, { content }, { new: true });
  return new Response(JSON.stringify(updatedComment), { status: 200 });
}

export async function DELETE(req) {
  const { id } = await req.json();
  await connectToDB();
  await Comment.findByIdAndDelete(id);
  return new Response(null, { status: 204 });
}
