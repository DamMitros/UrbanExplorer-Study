import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['blog', 'post', 'place'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  value: {
    type: Number,
    enum: [-1, 1],
    required: true
  }
}, {
  timestamps: true
});

VoteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

const Vote = mongoose.models.Vote || mongoose.model('Vote', VoteSchema);
export default Vote;