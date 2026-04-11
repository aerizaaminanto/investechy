import nodemailer from "nodemailer";

// 🔒 ENV VALIDATION
if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
  throw new Error("EMAIL and EMAIL_PASSWORD must be defined in .env");
}

// 📧 SMTP TRANSPORTER (GMAIL PRODUCTION SAFE)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL required

  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD, // Gmail App Password
  },
});

// 🔍 CONNECTION CHECK
transporter.verify((error) => {
  if (error) {
    console.error("❌ Mailer connection failed:", error.message);
  } else {
    console.log("✅ Mailer is ready to send emails");
  }
});

export default transporter;