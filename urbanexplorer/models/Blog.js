import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Nazwa bloga jest wymagana']},
  description: { type: String, required: [true, 'Opis bloga jest wymagany']},
  city: { type: String, default: null},
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Autor jest wymagany']},
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
  blocked: { type: Boolean, default: false}
}, {
  timestamps: true
});

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
export default Blog;