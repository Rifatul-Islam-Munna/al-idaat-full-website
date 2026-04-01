import { Schema, Document, Model, model, Types } from "mongoose";

export interface IPCJunction extends Document {
    _id: Types.ObjectId;

    categoryId: Types.ObjectId;
    productId: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}

const PCJunctionSchema: Schema<IPCJunction> = new Schema(
    {
        categoryId: {
            type: Schema.Types.ObjectId,
            // ref: "Category",
            required: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            // ref: "Product",
            required: true,
        },
    },
    { timestamps: true },
);
// ✅ ADD INDEX HERE
PCJunctionSchema.index({ categoryId: 1, productId: 1 }, { unique: true });

const PCJunction: Model<IPCJunction> = model<IPCJunction>("PCJunction", PCJunctionSchema);

export default PCJunction;
