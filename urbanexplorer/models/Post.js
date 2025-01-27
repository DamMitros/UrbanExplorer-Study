import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tytuł jest wymagany']
  },
  content: {
    type: String,
    required: [true, 'Treść jest wymagana']
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City', 
    required: false
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: false
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Autor jest wymagany']
  }
}, {
  timestamps: true
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
export default Post;
