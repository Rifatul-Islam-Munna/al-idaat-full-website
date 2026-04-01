import {
  CreateBucketCommand,
  DeleteObjectCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { lookup as getMimeType } from "mime-types";
import path from "path";
import s3Client from "../../config/minio";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../config/env";
import AppError from "../../utils/AppError";

export const BUCKET_NAME = "niqha-public-bucket";

// ─── Cloudinary-compatible response shape ────────────────────────────────────
export interface MinioUploadResult {
  secure_url: string;  // ← same field name as Cloudinary
  public_id: string;   // ← same field name as Cloudinary
}

// ─── Initialize on app startup ───────────────────────────────────────────────
export async function initMinio(): Promise<void> {
  await createBucketIfNotExists(BUCKET_NAME);
  await makeBucketPublic(BUCKET_NAME);
  console.log("✅ MinIO initialized");
}

async function createBucketIfNotExists(bucketName: string): Promise<void> {
  try {
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket '${bucketName}' created.`);
  } catch (err: any) {
    if (
      err?.name === "BucketAlreadyOwnedByYou" ||
      err?.name === "BucketAlreadyExists"
    ) {
      console.log(`Bucket '${bucketName}' already exists.`);
    } else {
      throw err;
    }
  }
}

async function makeBucketPublic(bucketName: string): Promise<void> {
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicRead",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  };

  await s3Client.send(
    new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(policy),
    })
  );
}

// ─── Upload from buffer (mimics uploadToCloudinary) ──────────────────────────
// Uses req.file.buffer → same as your existing Cloudinary flow (memory storage)
export async function uploadToMinio(
  buffer: Buffer,
  originalName: string
): Promise<MinioUploadResult> {
  const ext = path.extname(originalName);
  const contentType =
    (getMimeType(originalName) as string) || "application/octet-stream";

  // Use original name (sanitized) + uuid to avoid collisions
  const sanitized = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "_");
  const key = `${sanitized}_${uuidv4()}${ext}`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    return {
      secure_url: `${env.MINIO_URL}/${BUCKET_NAME}/${key}`, // ← Cloudinary shape
      public_id: key,                                         // ← Cloudinary shape
    };
  } catch (err: any) {
    console.error("MinIO upload error:", err);
    throw new AppError("File upload failed", 500);
  }
}

// ─── Delete single (mimics cloudinary.uploader.destroy) ──────────────────────
export async function destroyFromMinio(publicId: string): Promise<void> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: publicId,
      })
    );
  } catch (err: any) {
    console.error("MinIO delete error:", err);
    throw new AppError("Cannot delete file", 500);
  }
}

// ─── Bulk delete (mimics cloudinary.api.delete_resources) ────────────────────
// Returns same shape: { deleted: { "key1": "deleted", "key2": "not_found" } }
export async function deleteResourcesFromMinio(
  publicIds: string[]
): Promise<{ deleted: Record<string, string> }> {
  const deleted: Record<string, string> = {};

  await Promise.all(
    publicIds.map(async (id) => {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: id,
          })
        );
        deleted[id] = "deleted"; // ← same as Cloudinary response value
      } catch {
        deleted[id] = "not_found"; // ← same as Cloudinary response value
      }
    })
  );

  return { deleted };
}