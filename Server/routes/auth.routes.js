import express from "express";
import passport from "passport";
import "../config/passport.js";
import { googleCallback } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

export default router;
