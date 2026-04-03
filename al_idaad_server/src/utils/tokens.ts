import jwt, { SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";
import { env } from "../config/env";

export interface AccessTokenPayload {
    id: string;
    role: "admin" | "user";
}

export interface RefreshTokenPayload {
    sid: string;
}

export const createAccessToken = (user: { _id: Types.ObjectId; role: "admin" | "user" }): string => {
    if (!env.ACCESS_SECRET) {
        throw new Error("ACCESS_SECRET not configured");
    }

    const payload: AccessTokenPayload = {
        id: user._id.toString(),
        role: user.role,
    };

    const options: SignOptions = {
        expiresIn: "15min",
    };

    return jwt.sign(payload, env.ACCESS_SECRET, options);
};

export const createRefreshToken = (sessionId: Types.ObjectId): string => {
    if (!env.REFRESH_SECRET) {
        throw new Error("REFRESH_SECRET not configured");
    }

    const payload: RefreshTokenPayload = {
        sid: sessionId.toString(),
    };

    const options: SignOptions = {
        expiresIn: "10d",
    };

    return jwt.sign(payload, env.REFRESH_SECRET, options);
};
