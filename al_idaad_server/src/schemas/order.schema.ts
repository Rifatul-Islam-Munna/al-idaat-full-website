import { z } from "zod";

export const createOrderSchema = z.object({
    body: z.object({
        fullName: z.string().min(1, { message: "Full name is required" }),
        phone: z.string().min(1, { message: "Phone number is required" }),
        altPhone: z.string().optional(),
        address: z.string().min(1, { message: "Address is required" }),
        city: z.string().min(1, { message: "City is required" }),
        district: z.string().min(1, { message: "District is required" }),
        note: z.string().optional(),

        items: z
            .array(
                z.object({
                    productId: z.string().min(1, { message: "Product ID is required" }),
                    name: z.string().min(1, { message: "Product name is required" }),
                    quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
                    price: z.number().min(0, { message: "Price must be positive" }),
                    thumbnail: z.string().min(1, { message: "Thumbnail is required" }),

                    attarSize: z
                        .object({
                            ml: z.number().min(0, { message: "ML must be positive" }),
                            price: z.number().min(0, { message: "Price must be positive" }),
                            _id: z.string().min(1, { message: "Attar size ID is required" }),
                        })
                        .optional(),

                    variant: z
                        .object({
                            size: z.string().min(1, { message: "Variant size is required" }),
                            color: z.string().min(1, { message: "Variant color is required" }),
                            chest: z.number().min(0, { message: "Chest must be positive" }),
                            length: z.number().min(0, { message: "Length must be positive" }),
                            _id: z.string().min(1, { message: "Variant ID is required" }),
                        })
                        .optional(),
                }),
            )
            .min(1, { message: "Order must contain at least one item" }),

        subtotal: z.number().min(0, { message: "Subtotal must be positive" }),
        deliveryCharge: z.number().min(0, { message: "Delivery charge must be positive" }),
        grandTotal: z.number().min(0, { message: "Grand total must be positive" }),
        paymentMethod: z.string().min(1, { message: "Payment method is required" }),

        // Remaining fields from model
        steadfastTrackingCode: z.string().optional(),
        steadfastConsignmentId: z.string().optional(),
        deliveryStatus: z.string().optional(),
    }),
});

export const updateOrderSchema = z.object({
    body: createOrderSchema.shape.body.partial(),
});
