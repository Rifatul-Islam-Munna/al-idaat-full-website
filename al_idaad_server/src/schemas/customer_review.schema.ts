import { z } from "zod";

export const createCustomerReviewSchema = z.object({
    body: z.object({
        name: z.string().min(1, { message: "Customer name is required" }).max(80, { message: "Customer name is too long" }),
        location: z.string().max(80, { message: "Location is too long" }).optional().or(z.literal("")),
        review: z.string().min(1, { message: "Review is required" }).max(1000, { message: "Review is too long" }),
        rating: z.number().int({ message: "Rating must be a whole number" }).min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating cannot exceed 5" }),
    }),
});
