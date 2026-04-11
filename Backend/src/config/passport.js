import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";
import { generateToken } from "../helpers/token.js";

dotenv.config();

// =====================================
// GOOGLE OAUTH STRATEGY (FINAL CLEAN)
// =====================================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;
        const avatar = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new Error("Email not available from Google"), null);
        }

        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: email },
          ],
        });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar,
          });
        } else {
          if (!user.googleId) {
            user.googleId = profile.id;
          }
          if (avatar && !user.avatar) {
            user.avatar = avatar;
          }
          await user.save();
        }

        const token = generateToken({
          id: user._id,
          name: user.name,
          email: user.email,
        });

        return done(null, {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
          token,
        });

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// =====================================
// OPTIONAL (ONLY IF USE SESSION)
// =====================================
passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

export default passport;