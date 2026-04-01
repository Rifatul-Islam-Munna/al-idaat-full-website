import { z } from "zod";

export const createBlogSchema = z.object({
    body: z.object({
        title: z.string().min(1, {
            message: "Blog title is required",
        }),
        thumbnail: z
            .string()
            .min(1, { message: "Thumbnail is required" })
            .regex(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i, {
                message: "Thumbnail must be a valid image URL (jpg, png, webp, gif)",
            }),
        description: z.string().min(1, {
            message: "Description is required",
        }),
        category: z.object({
            _id: z.string().min(1, {
                message: "Category ID is required",
            }), // ObjectId as string
            name: z.string().min(1, {
                message: "Category name is required",
            }),
        }),
    }),
});

export const updateBlogSchema = z.object({
    body: createBlogSchema.shape.body.partial(),
});
