import mongoose from "mongoose";
import dotenv from "dotenv";
import { Quadrant } from "../models/index.js";

dotenv.config();

const seedQuadrants = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI?.trim(), {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Connected to MongoDB for seeding...");

    await Quadrant.deleteMany({});
    console.log("Menghapus data koleksi Quadrant sebelumnya...");

    const quadrantsData = [
      {
        name: "Strategic",
        description: "Aplikasi yang kritis untuk strategi bisnis saat ini dan masa depan.",
        businessDomain: {
          SM: 4, CA: 6, MI: 2, CR: 4, OR: -1,
        },
        technologyDomain: {
          SA: 1, DU: -2, TU: -1, IR: 1,
        },
        ROI: 2,
      },
      {
        name: "Investment",
        description: "Aplikasi yang mungkin penting untuk strategi bisnis di masa depan.",
        businessDomain: {
          SM: 0, CA: 0, MI: 2, CR: 8, OR: -2,
        },
        technologyDomain: {
          SA: 8, DU: -4, TU: -4, IR: 0,
        },
        ROI: 2,
      },
      {
        name: "Breakthrough Management",
        description: "Aplikasi yang kritis untuk operasi bisnis saat ini, tapi kurang penting di masa depan.",
        businessDomain: {
          SM: 6, CA: 0, MI: 4, CR: 0, OR: -4,
        },
        technologyDomain: {
          SA: 6, DU: -2, TU: -2, IR: -2,
        },
        ROI: 4,
      },
      {
        name: "Infrastructure",
        description: "Aplikasi yang mendukung bisnis namun tidak secara langsung terkait kesuksesan kompetitif.",
        businessDomain: {
          SM: 4, CA: 0, MI: 4, CR: 2, OR: -4,
        },
        technologyDomain: {
          SA: 8, DU: -4, TU: -2, IR: 0,
        },
        ROI: 2,
      },
    ];

    await Quadrant.insertMany(quadrantsData);
    console.log("Seed data Quadrant berhasil ditambahkan!");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error saat melakukan seeding Quadrant:", error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedQuadrants();
