import { z } from "zod";

const variantSchema = z.object({
    size: z.string().min(1, { message: "Size is required" }),
    color: z.string().optional(),
    chest: z.number().positive({ message: "Chest must be positive" }).optional(),
    length: z.number().positive({ message: "Length must be positive" }).optional(),
    price: z.number().positive({ message: "Variant price must be positive" }).optional(),
});

const attarSizeSchema = z.object({
    ml: z.number().positive({ message: "ML must be positive" }),
    price: z.number().positive({ message: "Attar size price must be positive" }),
});

export const createProductSchema = z.object({
    body: z
        .object({
            name: z.string().min(1, { message: "Product name is required" }),
            description: z.string().min(1, { message: "Description is required" }),
            brand: z.string().optional(),

            category: z.object({
                _id: z.string().min(1, { message: "Category ID is required" }),
                name: z.string().min(1, { message: "Category name is required" }),
            }),

            categoryIdList: z
                .array(z.string().min(1, { message: "Category ID is required in list" }))
                .min(1, { message: "At least one category ID is required" }),

            categoryIdListFilter: z
                .array(z.string().min(1, { message: "Category ID is required in list" }))
                .min(1, { message: "At least one category ID is required" }),

            price: z.number().min(0, { message: "Price is required and cannot be negative" }),
            priceRange: z
                .object({
                    min: z.number().min(0, { message: "Minimum price cannot be negative" }).default(0),
                    max: z.number().min(0, { message: "Maximum price cannot be negative" }).default(1),
                })
                .optional(),
            discountPercentage: z
                .number()
                .min(0, { message: "Discount cannot be negative" })
                .max(100, { message: "Discount cannot exceed 100" })
                .optional(),

            inStock: z.boolean().optional(),

            variants: z.array(variantSchema).min(1, { message: "At least one variant is required if variants are provided" }).optional(),

            attarSizes: z.array(attarSizeSchema).min(1, { message: "At least one attar size is required if attarSizes are provided" }).optional(),

            thumbnail: z.string().url({ message: "Thumbnail must be a valid URL" }),

            images: z.array(z.string().url({ message: "Each image must be a valid URL" })),

            ratings: z.number().min(0, { message: "Ratings cannot be less than 0" }).max(5, { message: "Ratings cannot exceed 5" }).optional(),

            deliveryCharge: z.object({
                regular: z.object({
                    charge: z.number().min(0, { message: "Regular delivery charge cannot be negative" }).default(120),

                    city: z.literal("all"),
                }),

                special: z.object({
                    charge: z.number().min(0, { message: "Special delivery charge cannot be negative" }),

                    city: z.string().min(1, { message: "Special delivery city is required" }),
                }),
            }),
            isFeatured: z.boolean().optional(),
            isBestSelling: z.boolean().optional(),
        })

        // ❗ Prevent both variants and attarSizes at same time
        .refine((data) => !(data.variants && data.attarSizes), {
            message: "A product cannot have both variants and attarSizes — choose one",
            path: ["variants"],
        }),
});

export const updateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, { message: "Product name is required" }).optional(),
        description: z.string().min(1, { message: "Description is required" }).optional(),
        brand: z.string().optional(),

        category: z
            .object({
                _id: z.string().min(1, { message: "Category ID is required" }),
                name: z.string().min(1, { message: "Category name is required" }),
            })
            .optional(),
        categoryIdList: z.array(z.string().min(1, { message: "Category ID is required in list" })).optional(),
        categoryIdListFilter: z.array(z.string().min(1, { message: "Category ID is required in list" })).optional(),

        price: z.number().min(0, { message: "Price is required and cannot be negative" }).optional(),
        priceRange: z
            .object({
                min: z.number().min(0, { message: "Minimum price cannot be negative" }).default(0),
                max: z.number().min(0, { message: "Maximum price cannot be negative" }).default(1),
            })
            .optional(),
        discountPercentage: z
            .number()
            .min(0, { message: "Discount cannot be negative" })
            .max(100, { message: "Discount cannot exceed 100" })
            .optional(),

        inStock: z.boolean().optional(),

        variants: z.array(variantSchema).optional(),

        attarSizes: z.array(attarSizeSchema).optional(),

        thumbnail: z.string().url({ message: "Thumbnail must be a valid URL" }).optional(),

        images: z.array(z.string().url({ message: "Each image must be a valid URL" })).optional(),

        ratings: z.number().min(0, { message: "Ratings cannot be less than 0" }).max(5, { message: "Ratings cannot exceed 5" }).optional(),

        deliveryCharge: z
            .object({
                regular: z.object({
                    charge: z.number().min(0, { message: "Regular delivery charge cannot be negative" }),
                    city: z.literal("all"),
                }),
                special: z.object({
                    charge: z.number().min(0, { message: "Special delivery charge cannot be negative" }),
                    city: z.string().min(1, { message: "Special delivery city is required" }),
                }),
            })
            .optional(),

        isFeatured: z.boolean().optional(),
        isBestSelling: z.boolean().optional(),
    }),
    // .refine((data) => !(data.variants && data.attarSizes), {
    //     message: "A product cannot have both variants and attarSizes — choose one",
    //     path: ["variants"],
    // }),
});

// ✅ TS types
// export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
// export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
