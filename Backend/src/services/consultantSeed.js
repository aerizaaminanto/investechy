import { Consultant } from "../models/index.js";
import dbConnection from "./db.js";

const consultantSeedData = [
  {
    id: "consultant-001",
    nama: "Muhammad Wijaya",
    spesialisasi: ["Backend Engineer", "Cloud Engineer", "DevOps"],
    whatsapp: "https://wa.me/6281234567801",
    email: "mailto:jaya.consult@beitinvestment.id",
    fee: 150000,
  },
  {
    id: "consultant-002",
    nama: "Achmad Eriza Aminanto",
    spesialisasi: ["Backend Engineer", "Data Scientist", "Product Consultant", "ERP Consultant"],
    whatsapp: "https://wa.me/6285183032549",
    email: "mailto:eriza.consult@beitinvestment.id",
    fee: 175000,
  },
  {
    id: "consultant-003",
    nama: "Dimas Ardiansyah",
    spesialisasi: ["Data Scientist", "AI Engineer", "Machine Learning Engineer"],
    whatsapp: "https://wa.me/6281234567803",
    email: "mailto:dimas.consult@beitinvestment.id",
    fee: 200000,
  },
  {
    id: "consultant-004",
    nama: "Salsa Maharani",
    spesialisasi: ["Mobile Developer", "Flutter Developer", "Frontend Engineer"],
    whatsapp: "https://wa.me/6281234567804",
    email: "mailto:salsa.consult@beitinvestment.id",
    fee: 160000,
  },
  {
    id: "consultant-005",
    nama: "Fajar Nugroho",
    spesialisasi: ["Cyber Security", "Network Engineer", "DevSecOps"],
    whatsapp: "https://wa.me/6281234567805",
    email: "mailto:fajar.consult@beitinvestment.id",
    fee: 225000,
  },
  {
    id: "consultant-006",
    nama: "Aulia Rahman",
    spesialisasi: ["QA Engineer", "Automation Tester", "Backend Engineer"],
    whatsapp: "https://wa.me/6281234567806",
    email: "mailto:aulia.consult@beitinvestment.id",
    fee: 145000,
  },
  {
    id: "consultant-007",
    nama: "Tania Wibowo",
    spesialisasi: ["Business Analyst", "System Analyst", "Product Consultant"],
    whatsapp: "https://wa.me/6281234567807",
    email: "mailto:tania.consult@beitinvestment.id",
    fee: 180000,
  },
  {
    id: "consultant-008",
    nama: "Bagas Saputra",
    spesialisasi: ["Data Engineer", "Data Analyst", "BI Developer"],
    whatsapp: "https://wa.me/6281234567808",
    email: "mailto:bagas.consult@beitinvestment.id",
    fee: 170000,
  },
  {
    id: "consultant-009",
    nama: "Keisha Anindita",
    spesialisasi: ["UI/UX Designer", "Frontend Engineer", "Design System"],
    whatsapp: "https://wa.me/6281234567809",
    email: "mailto:keisha.consult@beitinvestment.id",
    fee: 155000,
  },
  {
    id: "consultant-010",
    nama: "Yoga Firmansyah",
    spesialisasi: ["AI Engineer", "MLOps", "Python Developer"],
    whatsapp: "https://wa.me/6281234567810",
    email: "mailto:yoga.consult@beitinvestment.id",
    fee: 210000,
  },
];

const seedConsultants = async () => {
  await dbConnection;

  const totalConsultants = await Consultant.countDocuments();

  if (totalConsultants > 0) {
    await Consultant.updateMany(
      { fee: { $exists: false } },
      { $set: { fee: 150000 } }
    );
    return;
  }

  await Consultant.insertMany(consultantSeedData);
  console.log("Consultant dummy data seeded");
};

seedConsultants().catch((error) => {
  console.error("Failed to seed consultants:", error.message);
});
