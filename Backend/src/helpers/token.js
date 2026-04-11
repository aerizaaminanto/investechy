import jwt from "jsonwebtoken";

// =======================
// 🔐 GENERATE ACCESS TOKEN
// =======================
export const generateToken = (payload) => {
  try {
    return jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        name: payload.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
        issuer: "your-app",
      }
    );
  } catch (error) {
    throw new Error("Error generating token");
  }
};

// =======================
// 🔁 GENERATE REFRESH TOKEN 
// =======================
export const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(
      {
        id: payload.id,
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      {
        expiresIn: "7d",
        issuer: "your-app",
      }
    );
  } catch (error) {
    throw new Error("Error generating refresh token");
  }
};

// =======================
// 🔍 VERIFY ACCESS TOKEN
// =======================
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// =======================
// 🔍 VERIFY REFRESH TOKEN
// =======================
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};