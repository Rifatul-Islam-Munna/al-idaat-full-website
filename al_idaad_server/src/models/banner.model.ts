import { Schema, Document, model, Model } from "mongoose";

export interface IBanner extends Document {
    url: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const BannerSchema = new Schema<IBanner>(
    {
        url: { type: String, required: true, unique: true },
    },
    { timestamps: true },
);

const Banner: Model<IBanner> = model<IBanner>("Banner", BannerSchema);

export default Banner;
