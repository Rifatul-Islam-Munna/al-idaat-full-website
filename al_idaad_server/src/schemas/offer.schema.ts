import { z } from "zod";

const imageUrlSchema = z
    .string()
    .min(1, { message: "Offer image URL is required" })
    .regex(/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i, {
        message: "Offer URL must be a valid image URL (jpg, jpeg, png, webp)",
    });

export const createOfferSchema = z.object({
    body: z
        .object({
            url: imageUrlSchema.optional(),
            desktopUrl: imageUrlSchema.optional(),
            mobileUrl: imageUrlSchema.optional(),
            productId: z.string().min(1, { message: "Product ID is required" }),
        })
        .refine((data) => Boolean(data.desktopUrl || data.url), {
            message: "Desktop offer image is required",
            path: ["desktopUrl"],
        })
        .refine((data) => Boolean(data.mobileUrl || data.url), {
            message: "Mobile offer image is required",
            path: ["mobileUrl"],
        }),
});

export const updateOfferSchema = z.object({
    body: z
        .object({
            url: imageUrlSchema.optional(),
            desktopUrl: imageUrlSchema.optional(),
            mobileUrl: imageUrlSchema.optional(),
            productId: z.string().optional(),
        })
        .refine((data) => !(data.desktopUrl && !data.mobileUrl) || Boolean(data.mobileUrl), {
            message: "Provide a mobile image when updating the desktop image",
            path: ["mobileUrl"],
        })
        .refine((data) => !(data.mobileUrl && !data.desktopUrl) || Boolean(data.desktopUrl), {
            message: "Provide a desktop image when updating the mobile image",
            path: ["desktopUrl"],
        }),
});
