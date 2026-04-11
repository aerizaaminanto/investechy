import mongoose from "mongoose";
import dotenv from "dotenv";
import { setServers } from "node:dns/promises";
import { Quadrant } from "../models/index.js";

setServers(["1.1.1.1","8.8.8.8"]);
dotenv.config();

const seedQuadrants = async () => {
  try {
    // 1. Connect ke Database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for Seeding...");

    // 2. Hapus data Quadrant yang lama agar tidak duplikat
    await Quadrant.deleteMany({});
    console.log("Menghapus data koleksi Quadrant sebelumnya...");

    // 3. Persiapkan data seed Quadrant
    // Anda dapat memodifikasi nilai-nilai variabel ini sesuai kebutuhan angka spesifik Anda
    const quadrantsData = [
  {
    name: 'Strategic',
    description: 'Aplikasi yang kritis untuk strategi bisnis saat ini dan masa depan.',
    businessDomain: {
      SM: 4, CA: 6, MI: 2, CR: 4, OR: -1
    },
    technologyDomain: {
      SA: 1, DU: -2, TU: -1, IR: 1
    },
    ROI: 2
  },
  {
    name: 'Investment',
    description: 'Aplikasi yang mungkin penting untuk strategi bisnis di masa depan.',
    businessDomain: {
      SM: 0, CA: 0, MI: 2, CR: 8, OR: -2
    },
    technologyDomain: {
      SA: 8, DU: -4, TU: -4, IR: 0
    },
    ROI: 2
  },
  {
    name: 'Breakthrough Management',
    description: 'Aplikasi yang kritis untuk operasi bisnis saat ini, tapi kurang penting di masa depan.',
    businessDomain: {
      SM: 6, CA: 0, MI: 4, CR: 0, OR: -4
    },
    technologyDomain: {
      SA: 6, DU: -2, TU: -2, IR: -2
    },
    ROI: 4
  },
  {
    name: 'Infrastructure',
    description: 'Aplikasi yang mendukung bisnis namun tidak secara langsung terkait kesuksesan kompetitif.',
    businessDomain: {
      SM: 4, CA: 0, MI: 4, CR: 2, OR: -4
    },
    technologyDomain: {
      SA: 8, DU: -4, TU: -2, IR: 0  
    },
    ROI: 2
  }
];

    // 4. Masukkan ke Database
    await Quadrant.insertMany(quadrantsData);
    console.log("Seed data Quadrant berhasil ditambahkan!");

    // 5. Tutup koneksi dan keluar
    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error("Error saat melakukan seeding Quadrant:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedQuadrants();
