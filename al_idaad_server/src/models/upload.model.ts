import { Schema, Document, model, Model } from "mongoose";

export interface IUpload extends Document {
    url: string;
    publicId: string;
    originalName: string;
    createdAt: Date;
}

const UploadSchema = new Schema<IUpload>(
    {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        originalName: { type: String, required: true },
    },
    { timestamps: true }
);

const Upload: Model<IUpload> = model<IUpload>("Upload", UploadSchema);

export default Upload;
