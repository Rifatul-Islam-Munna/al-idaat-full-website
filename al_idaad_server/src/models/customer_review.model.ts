import { Document, Model, Schema, model } from "mongoose";

export interface ICustomerReview extends Document {
    name: string;
    location?: string;
    review: string;
    rating: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const CustomerReviewSchema = new Schema<ICustomerReview>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        review: {
            type: String,
            required: true,
            trim: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
    },
    { timestamps: true },
);

const CustomerReview: Model<ICustomerReview> = model<ICustomerReview>("CustomerReview", CustomerReviewSchema);

export default CustomerReview;
