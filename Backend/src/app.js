import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "./config/passport.js";
import routes from "./routes/index.js";
import path from "path";
import { fileURLToPath } from "url";
import connectDatabase from "./services/db.js";
import errorHandler from "./middlewares/errorHandler.js";

console.log("Base imports loaded");
console.log("Routes imported:", typeof routes);
console.log("All imports loaded successfully");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:8080",
  "http://localhost:7510",
  "http://127.0.0.1:7510",
  "http://localhost:50185",
  "http://127.0.0.1:50185",
  "http://localhost:63255",
  "http://127.0.0.1:63255",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      origin.endsWith(".ngrok-free.app") ||
      origin.endsWith(".ngrok-free.dev") ||
      origin.endsWith(".ngrok.io")
    ) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: Origin '${origin}' tidak diizinkan`));
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "..", "FE-Test")));

app.use(passport.initialize());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

app.get("/consul", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "FE-Test", "consul.html"));
});

app.get("/test", (req, res) => {
  res.status(200).json({
    message: "Backend is running",
  });
});

console.log("Routes object:", routes);
console.log(
  "Router paths:",
  routes.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }))
);

app.use("/api", routes);

app.get("/api/test-direct", (req, res) => {
  res.json({ success: true, message: "Direct test route works!" });
});

app.use(errorHandler);

app.use((err, req, res, next) => {
  console.error("Global error handler triggered:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
