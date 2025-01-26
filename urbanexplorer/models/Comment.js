import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  targetType: { 
    type: String, 
    enum: ['post', 'place'],
    required: true 
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, { 
  timestamps: true 
});

const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
export default Comment;
