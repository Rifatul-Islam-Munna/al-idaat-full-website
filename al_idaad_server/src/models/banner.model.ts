import { Schema, Document, model, Model } from "mongoose";

export interface IBanner extends Document {
    url: string;
    desktopUrl?: string;
    mobileUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const BannerSchema = new Schema<IBanner>(
    {
        url: { type: String, required: true, unique: true },
        desktopUrl: { type: String, required: true },
        mobileUrl: { type: String, required: true },
    },
    { timestamps: true },
);

const Banner: Model<IBanner> = model<IBanner>("Banner", BannerSchema);

export default Banner;
