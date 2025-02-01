import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema({
  room: String,
  message: String,
  author: String,
  timestamp: { type: Date, default: Date.now },
  reactions: [String],
});
export default mongoose.models.Message || mongoose.model("Message", MessageSchema);