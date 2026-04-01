import crypto from "crypto";
import { Request } from "express";

export const createDeviceId = (req: Request): string => {
    const userAgent = req.headers["user-agent"] || "unknown";
    const ip = req.ip || "unknown";

    const raw: string = `${userAgent}${ip}`;

    return crypto.createHash("sha256").update(raw).digest("hex");
};
