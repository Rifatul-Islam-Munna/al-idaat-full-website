import { Schema, Document, Model, model, Types } from "mongoose";

export interface ISession extends Document {
    _id: Types.ObjectId;

    userId: Types.ObjectId;

    deviceId: string;
    ip: string;
    userAgent: string;

    valid: boolean;

    expiresAt: Date;
    expiresAtFormated: string;

    createdAt?: Date;
    updatedAt?: Date;
}

const SessionSchema: Schema<ISession> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        deviceId: {
            type: String,
            required: true,
        },

        ip: {
            type: String,
            required: true,
        },

        userAgent: {
            type: String,
            required: true,
        },

        valid: {
            type: Boolean,
            default: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        expiresAtFormated: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

const Session: Model<ISession> = model<ISession>("Session", SessionSchema);

export default Session;
