import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Types } from "mongoose";

/* ------------------------------------
   Access Token Payload Type
------------------------------------- */

export interface AccessTokenPayload {
    id: string;
    role: "admin" | "user";
}

/* ------------------------------------
   Refresh Token Payload Type
------------------------------------- */

export interface RefreshTokenPayload {
    sid: string;
}

/* ------------------------------------
   Create Access Token
------------------------------------- */

export const createAccessToken = (user: { _id: Types.ObjectId; role: "admin" | "user" }): string => {
    if (!env.ACCESS_SECRET) {
        throw new Error("ACCESS_SECRET not configured");
    }

    const payload: AccessTokenPayload = {
        id: user._id.toString(),
        role: user.role,
    };

    const options: SignOptions = {
        expiresIn: "15min", // ✅ Production recommended
    };

    return jwt.sign(payload, env.ACCESS_SECRET, options);
};

/* ------------------------------------
   Create Refresh Token
------------------------------------- */

export const createRefreshToken = (sessionId: Types.ObjectId): string => {
    if (!env.REFRESH_SECRET) {
        throw new Error("REFRESH_SECRET not configured");
    }

    const payload: RefreshTokenPayload = {
        sid: sessionId.toString(),
    };

    const options: SignOptions = {
        expiresIn: "7d", // ✅ Standard refresh lifespan
    };

    return jwt.sign(payload, env.REFRESH_SECRET, options);
};
