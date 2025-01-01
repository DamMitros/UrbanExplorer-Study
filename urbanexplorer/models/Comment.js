import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
