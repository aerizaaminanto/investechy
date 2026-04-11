import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL || "dummy@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "dummypass",
  },
});

export default transporter;
