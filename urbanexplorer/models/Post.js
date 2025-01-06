import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: false },
  place: { type: mongoose.Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      username: String,
      content: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});


export default mongoose.models.Post || mongoose.model("Post", PostSchema);
