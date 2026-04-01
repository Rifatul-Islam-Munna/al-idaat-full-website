import { Schema, Document, model, Model } from "mongoose";

export interface ICategoryImage extends Document {
    url: string;
    categoryId: string;
    categoryName: string;
    categoryParentName: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const CategoryImageSchema = new Schema<ICategoryImage>(
    {
        url: { type: String, required: true },
        categoryId: { type: String, required: true },
        categoryName: { type: String, required: true },
        categoryParentName: { type: String, required: true },
    },
    { timestamps: true },
);

const CategoryImage: Model<ICategoryImage> = model<ICategoryImage>("CategoryImage", CategoryImageSchema);

export default CategoryImage;
