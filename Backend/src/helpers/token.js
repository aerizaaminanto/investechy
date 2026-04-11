import jwt from "jsonwebtoken";

const TOKEN_ISSUER = "your-app";

const signToken = (payload, options = {}) => {
  const { expiresIn = "1d", purpose } = options;

  return jwt.sign(
    {
      ...payload,
      ...(purpose ? { purpose } : {}),
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
      issuer: TOKEN_ISSUER,
    }
  );
};

export const generateToken = (payload, options = {}) => {
  try {
    return signToken(
      {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        ...(payload.role ? { role: payload.role } : {}),
      },
      options
    );
  } catch (error) {
    throw new Error("Error generating token");
  }
};

export const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(
      {
        id: payload.id,
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      {
        expiresIn: "7d",
        issuer: TOKEN_ISSUER,
      }
    );
  } catch (error) {
    throw new Error("Error generating refresh token");
  }
};

export const generatePasswordResetToken = (payload) => {
  try {
    return generateToken(payload, {
      expiresIn: "15m",
      purpose: "password_reset",
    });
  } catch (error) {
    throw new Error("Error generating password reset token");
  }
};

export const verifyToken = (token, options = {}) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      options.requiredPurpose &&
      decoded.purpose !== options.requiredPurpose
    ) {
      throw new Error("Invalid token purpose");
    }

    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

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
