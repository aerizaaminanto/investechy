import { verifyToken } from "../helpers/token.js";
import { User } from "../models/index.js";

export const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next({ message: "You should login", status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId || decoded.id);

    if (!user) {
      return next({ message: "You should login", status: 401 });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    next({ message: "You should login", status: 401 });
  }
};

export const authorization = (req, res, next) => {
  User.findById(req.params.id)
    .then((data) => {
      if (data && data._id.toString() === req.userId.toString()) {
        next();
      } else {
        next({ message: "You are not allowed", status: 401 });
      }
    })
    .catch(() => {
      next({ message: "You are not allowed", status: 401 });
    });
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next({ message: "You should login", status: 401 });
  }

  if (!roles.includes(req.user.role)) {
    return next({ message: "You are not allowed", status: 403 });
  }

  next();
};
