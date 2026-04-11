import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";

import "./config/passport.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:7510",
  "http://127.0.0.1:7510",
  "http://localhost:63255",
  "http://127.0.0.1:63255",
  "https://unvicarious-camelia-porky.ngrok-free.dev",
  "https://unvicarious-camelia-porky"
];

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti Postman/curl)
    if (!origin) return callback(null, true);
    // Izinkan semua URL ngrok
    if (origin.endsWith(".ngrok-free.dev") || origin.endsWith(".ngrok.io")) {
      return callback(null, true);
    }
    // Izinkan origin yang ada di whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin '${origin}' tidak diizinkan`));
  },
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
