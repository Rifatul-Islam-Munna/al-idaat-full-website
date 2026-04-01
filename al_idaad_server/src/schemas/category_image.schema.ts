import { z } from "zod";

const imageUrlSchema = z
    .string()
    .min(1, { message: "Offer image URL is required" })
    .regex(/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i, {
        message: "Offer URL must be a valid image URL (jpg, jpeg, png, webp)",
    });

export const createCategoryImageSchema = z.object({
    body: z.object({
        url: imageUrlSchema,
        categoryId: z.string().min(1, { message: "Product ID is required" }),
        categoryName: z.string().min(1, { message: "Category name is required" }),
        categoryParentName: z.string().min(1, { message: "Parent category name ID is required" }),
    }),
});

export const updateCategoryImageSchema = z.object({
    body: z.object({
        url: imageUrlSchema.optional(),
        categoryId: z.string().optional(),
        categoryName: z.string().min(1, { message: "Category name is required" }).optional(),
        categoryParentName: z.string().min(1, { message: "Parent category name ID is required" }).optional(),
    }),
});
