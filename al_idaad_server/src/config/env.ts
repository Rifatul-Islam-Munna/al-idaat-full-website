import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    PORT: z.string().transform(Number).default(4000),
    MONGO_URI: z.string().nonempty("MONGO_URI is required"),
    ACCESS_SECRET: z.string().nonempty("ACCESS_TOKEN_SECRET is required"),
    REFRESH_SECRET: z.string().nonempty("REFRESH_TOKEN_SECRET is required"),
    NODE_ENV: z.string().nonempty("NODE_ENV is required"),
    HMAC_VERIFICATION_CODE_SECRET: z.string().nonempty("HMAC_VERIFICATION_CODE_SECRET is required"),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    MINIO_URL: z.string().optional(),
    MINIO_ACCESS_KEY: z.string().optional(),
    MINIO_SECRET_KEY: z.string().optional(),
     CORS_ORIGINS: z.string().min(1), 
    ADMIN_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
