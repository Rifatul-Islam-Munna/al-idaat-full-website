import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

export interface CloudinaryUploadResult {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  original_filename?: string;
}

// ✅ Check if all 3 Cloudinary vars are present
export const isCloudinaryConfigured =
  !!env.CLOUDINARY_CLOUD_NAME &&
  !!env.CLOUDINARY_API_KEY &&
  !!env.CLOUDINARY_API_SECRET;

// ✅ Only configure if all vars exist
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME!,
    api_key: env.CLOUDINARY_API_KEY!,
    api_secret: env.CLOUDINARY_API_SECRET!,
  });
  console.log("✅ Cloudinary initialized");
} else {
  console.warn("⚠️  Cloudinary is not configured — image upload will be disabled");
}

export const uploadToCloudinary = async (
  buffer: Buffer,
  filename: string
): Promise<CloudinaryUploadResult> => {
  // ✅ Fail fast with a clear message if called without config
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "alidaad/uploads",
        resource_type: "image",
        public_id: `${Date.now()}-${filename.split(".")[0]}`,
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No result returned from Cloudinary"));
        resolve(result as unknown as CloudinaryUploadResult);
      }
    );
    stream.end(buffer);
  });
};