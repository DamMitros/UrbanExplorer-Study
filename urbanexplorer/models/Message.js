import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  room: String,
  message: String,
  author: String,  
  timestamp: { type: Date, default: Date.now },
  reactions: { type: Object, default: {} },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null},
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);