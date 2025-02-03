import mongoose from 'mongoose';

const ChatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nazwa pokoju jest wymagana'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Opis pokoju jest wymagany']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.ChatRoom || mongoose.model('ChatRoom', ChatRoomSchema);