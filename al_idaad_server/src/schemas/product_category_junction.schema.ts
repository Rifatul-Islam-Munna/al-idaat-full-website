import { z } from "zod";

// MongoDB ObjectId validation (24 hex characters)
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "Invalid MongoDB ObjectId",
});

export const createPCJunctionSchema = z.object({
    body: z.object({
        categoryId: objectIdSchema,
        productId: objectIdSchema,
    }),
});

export const updatePCJunctionSchema = z.object({
    body: z.object({
        categoryId: objectIdSchema.optional(),
        productId: objectIdSchema.optional(),
    }),
});
