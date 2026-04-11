import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js";

dotenv.config();

const [nama, email, password] = process.argv.slice(2);

if (!nama || !email || !password) {
  console.error("Usage: node scripts/seedAdmin.js <nama> <email> <password>");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI?.trim(), {
    serverSelectionTimeoutMS: 10000,
  });

  const existing = await User.findOne({ email });
  if (existing) {
    console.error("Admin dengan email tersebut sudah ada.");
    process.exit(1);
  }

  const admin = await User.create({
    name: nama,
    email,
    password,
    role: "admin",
  });

  console.log(`Admin created: ${admin.email}`);
  process.exit(0);
} catch (error) {
  console.error("Failed to seed admin:", error.message);
  process.exit(1);
}
