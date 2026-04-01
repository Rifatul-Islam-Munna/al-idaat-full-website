import { Schema, Document, model, Model, Types } from "mongoose";

export interface IOrder extends Document {
    fullName: string;
    phone: string;
    altPhone?: string;
    address: string;
    city: string;
    district: string;
    note?: string;

    items: {
        productId: Types.ObjectId;
        name: string;
        quantity: number;
        price: number;
        thumbnail: string;

        attarSize?: {
            ml: number;
            price: number;
            _id: Types.ObjectId;
        };

        variant?: {
            size: string;
            color: string;
            chest: number;
            length: number;
            _id: Types.ObjectId;
        };
    }[];

    subtotal: number;
    deliveryCharge: number;
    grandTotal: number;
    paymentMethod: string;

    steadfastTrackingCode?: string;
    steadfastConsignmentId?: string;
    deliveryStatus?: string;
}

const OrderSchema = new Schema<IOrder>(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        altPhone: { type: String },
        address: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        note: { type: String },

        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                thumbnail: { type: String, required: true },

                attarSize: {
                    ml: { type: Number },
                    price: { type: Number },
                    _id: { type: Schema.Types.ObjectId },
                },

                variant: {
                    size: { type: String },
                    color: { type: String },
                    chest: { type: Number },
                    length: { type: Number },
                    _id: { type: Schema.Types.ObjectId },
                },
            },
        ],

        subtotal: { type: Number, required: true },
        deliveryCharge: { type: Number, required: true },
        grandTotal: { type: Number, required: true },
        paymentMethod: { type: String, required: true },

        steadfastTrackingCode: { type: String },
        steadfastConsignmentId: { type: String },
        deliveryStatus: { type: String, default: "pending" },
    },
    { timestamps: true },
);

const Order: Model<IOrder> = model<IOrder>("Order", OrderSchema);

export default Order;
