import { z } from "zod";

// Utility to check valid MongoDB ObjectId (24 hex chars)
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ObjectId format" });

// Recursive subCategory schema (self-referencing)
const subCategorySchema: z.ZodType<any> = z.lazy(() =>
    z.object({
        _id: objectIdSchema.optional(),
        name: z.string().nonempty({ message: "Sub-category name is required" }).min(2, {
            message: "Sub-category name must have at least 2 characters",
        }),
        subCategories: z.array(subCategorySchema).optional(),
    }),
);

// ✅ Create Category Schema
export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().nonempty({ message: "Category name is required" }).min(2, {
            message: "Category name must have at least 2 characters",
        }),
        products: z.array(objectIdSchema).optional(),
        subCategories: z.array(subCategorySchema).optional(), // recursive structure
    }),
});

// ✅ Update Category Schema
export const updateCategorySchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, {
                message: "Category name must have at least 2 characters",
            })
            .optional(),
        products: z.array(objectIdSchema).optional(),
        subCategories: z.array(subCategorySchema).optional(), // recursive update allowed
    }),
});

// ✅ TS types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
