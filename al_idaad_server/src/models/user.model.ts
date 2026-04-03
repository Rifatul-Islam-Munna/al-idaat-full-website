import { Schema, Document, Model, model, Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phone?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    district?: string | undefined;
    role: string;
    verified: boolean;
    wishlist: Types.ObjectId[];
    verificationCode?: string | null;
    verificationCodeValidation?: number | null;
    forgotPasswordCode?: string | null;
    forgotPasswordCodeValidation?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        district: { type: String, trim: true },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },

        verified: { type: Boolean, default: false },
        wishlist: [{ type: Schema.Types.ObjectId, ref: "Product", default: [] }],
        verificationCode: { type: String, select: false, default: null },
        verificationCodeValidation: {
            type: Number,
            select: false,
            default: null,
        },
        forgotPasswordCode: { type: String, select: false, default: null },
        forgotPasswordCodeValidation: {
            type: Number,
            select: false,
            default: null,
        },
    },
    { timestamps: true },
);

const User: Model<IUser> = model<IUser>("User", UserSchema);

export default User;
