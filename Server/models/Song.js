import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  youtubeUrl: String,
  thumbnail: String,

  // owner
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // admin/global song
  isGlobal: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Song", songSchema);
