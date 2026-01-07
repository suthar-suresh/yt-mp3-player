import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import {
  addSong,
  addGlobalSong,
  getSongs
} from "../controllers/song.controller.js";

const router = express.Router();

router.get("/", protect, getSongs);
router.post("/", protect, addSong);
router.post("/admin", protect, adminOnly, addGlobalSong);

export default router;
