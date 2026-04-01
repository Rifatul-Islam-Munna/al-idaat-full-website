import { z } from "zod";

const imageUrlSchema = z
    .string()
    .min(1, { message: "Offer image URL is required" })
    .regex(/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i, {
        message: "Offer URL must be a valid image URL (jpg, jpeg, png, webp)",
    });

export const createOfferSchema = z.object({
    body: z.object({
        url: imageUrlSchema,
        productId: z.string().min(1, { message: "Product ID is required" }),
    }),
});

export const updateOfferSchema = z.object({
    body: z.object({
        url: imageUrlSchema.optional(),
        productId: z.string().optional(),
    }),
});
