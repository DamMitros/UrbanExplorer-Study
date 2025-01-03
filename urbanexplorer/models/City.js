import mongoose from "mongoose";

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  places: [
    {
      name: { type: String, required: true },
      description: String,
      comments: [
        {
          username: String,
          content: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
  ],
});

const City = mongoose.models.City || mongoose.model("City", CitySchema);

export default City;
