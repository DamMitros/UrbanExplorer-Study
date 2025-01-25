import mongoose from "mongoose";

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  geolocation: { 
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true},
  },
  places: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      isVerified: { type: Boolean, default: false },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comments: [
        {
          username: String,
          content: String,
          isModefied: { type: Boolean, default: false },
          createdAt: { type: Date, default: Date.now },
          modifyAt: {type: Date, default: Date.now},
        },
      ],
    },
  ],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
});

const City = mongoose.models.City || mongoose.model("City", CitySchema);

export default City;
