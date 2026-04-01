import mongoose, { Schema, Document, Model, model } from "mongoose";

// -----------------------------
// SubCategory interface
// -----------------------------
export interface ISubCategory extends Document {
    _id: mongoose.Types.ObjectId; // ensure each subcategory has an _id
    name: string;
    subCategories: ISubCategory[];
}

// -----------------------------
// Category interface
// -----------------------------
export interface ICategory extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    subCategories: ISubCategory[];
}

// -----------------------------
// SubCategory Schema
// -----------------------------
const SubCategorySchema: Schema<ISubCategory> = new Schema(
    {
        name: { type: String, required: true, trim: true },
        subCategories: { type: [], default: [] }, // recursion will be patched below
    },
    { _id: true }, // ensures every level gets its own _id
);

// IMPORTANT: add recursion after defining schema
SubCategorySchema.add({
    subCategories: [SubCategorySchema],
});

// -----------------------------
// Category Schema
// -----------------------------
const CategorySchema: Schema<ICategory> = new Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        subCategories: { type: [SubCategorySchema], default: [] },
    },
    { timestamps: true },
);

// -----------------------------
// Category Model
// -----------------------------
const Category: Model<ICategory> = model<ICategory>("Category", CategorySchema);

export default Category;
