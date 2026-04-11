import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../models/index.js";
import { generateToken } from "../helpers/token.js";

/* ===============================
   🔵 GOOGLE STRATEGY (OAuth)
================================ */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // ✅ HARUS STRING & sesuai Google Console
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        // 🔍 cari user
        let user = await User.findOne({ googleId: profile.id });

        // 🆕 jika belum ada → buat
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar,
          });
        }

        // 🔑 generate JWT (SINKRON dengan controller & middleware)
        const token = generateToken({
          id: user._id,
          email: user.email,
          name: user.name,
        });

        // 🔥 return user + token
        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/* ===============================
   🔐 JWT STRATEGY (OPTIONAL)
   (dipakai kalau mau passport protect API)
================================ */
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;