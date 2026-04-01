import { Schema, Document, model, Model } from "mongoose";

export interface IOffer extends Document {
    url: string;
    productId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const OfferSchema = new Schema<IOffer>(
    {
        url: { type: String, required: true },
        productId: { type: String, required: true },
    },
    { timestamps: true },
);

const Offer: Model<IOffer> = model<IOffer>("Offer", OfferSchema);

export default Offer;
