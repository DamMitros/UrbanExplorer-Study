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
      description: String,
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      comments: [
        {
          username: String,
          content: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
  ],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
});

const City = mongoose.models.City || mongoose.model("City", CitySchema);

export default City;
