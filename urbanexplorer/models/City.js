import mongoose from "mongoose";

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
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
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      verifiedAt: { type: Date, default: null },
    },
  ],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, {
  timestamps: true
});

const City = mongoose.models.City || mongoose.model("City", CitySchema);

export default City;
