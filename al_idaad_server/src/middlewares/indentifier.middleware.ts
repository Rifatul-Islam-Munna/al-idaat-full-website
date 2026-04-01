import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { env } from "../config/env";
import AppError from "../utils/AppError";

/* ------------------------------------
   Extend Express Request Type
------------------------------------- */

declare module "express-serve-static-core" {
    interface Request {
        user?: {
            id: string;
            role: "admin" | "user";
        };
    }
}

/* ------------------------------------
   Auth Protection Middleware
------------------------------------- */

export const identifier = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // ✅ Check Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Authorization token missing", 401));
    }

    // ✅ Safe token extraction
    const token = authHeader.split(" ")[1];

    if (!token) {
        return next(new AppError("Token not found", 401));
    }

    try {
        // ✅ Environment safety
        if (!env.ACCESS_SECRET) {
            return next(new AppError("ACCESS_SECRET not configured", 500));
        }

        // ✅ Verify token (NOW token is string)
        const decoded = jwt.verify(token, env.ACCESS_SECRET) as JwtPayload;

        // ✅ Attach user info
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (error) {
        // ✅ Token expired
        if (error instanceof TokenExpiredError) {
            return next(new AppError("Access token expired", 401));
        }

        // ✅ Invalid token
        if (error instanceof JsonWebTokenError) {
            return next(new AppError("Invalid access token", 403));
        }

        // ✅ Fallback
        return next(new AppError("Authentication failed", 401));
    }
};

/* ------------------------------------
   role check Middleware
------------------------------------- */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
    }

    next();
};
