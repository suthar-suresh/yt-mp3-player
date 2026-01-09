import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  googleId: String,
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
