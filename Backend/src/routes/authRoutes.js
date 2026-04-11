import { Router } from "express";
import { register, login, createAdmin, forgotPassword, verifyOtp, resetPassword, getProfile, updateProfile } from "../controllers/index.js";
import passport from "passport";
import { authentication, authorizeRoles } from "../middlewares/auth.js";
import multer from "multer";


const router = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Contoh batasan ukuran 5MB
});

// =======================
// 🔐 BASIC AUTH (JWT)
// =======================
router.post("/register", register);
router.post("/login", login);
router.post("/admins", authentication, authorizeRoles("admin"), createAdmin);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", authentication, resetPassword);

router.get("/profile", authentication, getProfile);
router.put("/profile", authentication, upload.single("avatar"), updateProfile);

// =======================
// 🔵 GOOGLE AUTH
// =======================

// 🔹 STEP 1: redirect ke Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// 🔹 STEP 2: callback dari Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/failure",
  }),
  (req, res) => {
    const { user, token } = req.user;

    res.json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  }
);

// =======================
// ❌ FAILURE
// =======================
router.get("/failure", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
});

export default router;
