import express from "express";
import cors from "cors";
import passport from "passport";
import dotenv from "dotenv";

const app = express();
app.use(cors());
dotenv.config();
app.use(express.json());
app.use(passport.initialize());

export default app;
