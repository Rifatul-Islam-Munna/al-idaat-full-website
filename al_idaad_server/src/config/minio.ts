import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: env.MINIO_URL!,
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY!,
    secretAccessKey: env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true, // required for MinIO
});

export default s3Client;