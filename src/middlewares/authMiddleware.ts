import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { type JwtPayload } from "../types/definitions.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Extract the token string (format is "Bearer <token>")
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token found" });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Attach user info to request object
    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: "Forbidden: You do not have permission to perform this action",
      });
      return;
    }
    next();
  };
};
