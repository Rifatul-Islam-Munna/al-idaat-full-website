import mongoose, { Schema, Document, Model, model } from "mongoose";

export interface IProduct extends Document {
    name: string;
    shortDescription: string;
    description: string;
    brand?: string;

    category: {
        _id: mongoose.Types.ObjectId;
        name: string;
    };
    categoryIdList: mongoose.Types.ObjectId[];
    categoryIdListFilter: mongoose.Types.ObjectId[];
    price: number;
    priceRange: { min: number; max: number };
    discountPercentage: number;

    inStock: boolean; // Only stock control

    // For Thobe / T-shirt
    variants?: {
        size: string;
        color?: string;
        chest?: number;
        length?: number;
        price?: number;
    }[];

    // For Attar (ml based selling)
    attarSizes?: {
        ml: number; // 3ml, 6ml, 12ml
        price: number; // 150, 250
    }[];

    // Product flags
    isFeatured?: boolean;
    isBestSelling?: boolean;

    thumbnail: string;
    images: string[];

    ratings?: number;
    reviews?: mongoose.Types.ObjectId[];

    deliveryCharge: {
        regular: {
            charge: number;
            city: string;
        };
        special: {
            charge: number;
            city: string;
        };
    };
}

const ProductSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        shortDescription: { type: String, required: true },
        description: { type: String, required: true },
        brand: { type: String },

        category: {
            _id: { type: mongoose.Schema.Types.ObjectId, required: true },
            name: { type: String, required: true },
        },
        categoryIdList: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
                required: true,
            },
        ],
        categoryIdListFilter: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
                required: true,
            },
        ],
        price: { type: Number, required: true, default: 0 },
        priceRange: {
            min: { type: Number, required: true, default: 0 },
            max: { type: Number, required: true, default: 1 },
        },

        discountPercentage: { type: Number, min: 0, max: 100, default: 0 },

        // Only stock indicator
        inStock: { type: Boolean, default: true },

        variants: [
            {
                size: { type: String, required: true },
                color: { type: String },
                chest: { type: Number },
                length: { type: Number },
                price: { type: Number },
            },
        ],

        attarSizes: [
            {
                ml: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],

        // New flags
        isFeatured: { type: Boolean, default: false },
        isBestSelling: { type: Boolean, default: false },

        thumbnail: { type: String, required: true },
        images: { type: [String], required: true },

        ratings: { type: Number, default: 0 },
        reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

        deliveryCharge: {
            regular: {
                charge: {
                    type: Number,
                    required: true,
                    default: 120,
                },
                city: {
                    type: String,
                    enum: ["all"],
                    required: true,
                    default: "all",
                },
            },
            special: {
                charge: {
                    type: Number,
                    required: true,
                    default: 60,
                },
                city: {
                    type: String,
                    required: true,
                },
            },
        },
    },
    { timestamps: true },
);

const Product: Model<IProduct> = model<IProduct>("Product", ProductSchema);

export default Product;
