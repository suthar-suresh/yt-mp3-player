import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import songRoutes from "./routes/song.routes.js";

connectDB();

app.use("/auth", authRoutes);
app.use("/songs", songRoutes);

export default function handler(req, res) {
  res.json({ ok: true });
}
