import { z } from "zod";

const imageUrlSchema = z
    .string()
    .min(1, { message: "Banner URL is required" })
    .regex(/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i, {
        message: "Banner URL must be a valid image URL (jpg, jpeg, png, webp)",
    });

export const createBannerSchema = z.object({
    body: z.object({
        urls: z.array(imageUrlSchema).min(1, { message: "At least one banner URL is required" }),
    }),
});

export const updateBannerSchema = z.object({
    body: z.object({
        urls: z.array(imageUrlSchema).optional(),
    }),
});
