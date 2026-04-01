import { Request, Response } from "express";
import AppError from "../utils/AppError";
import Upload from "../models/upload.model";
import { v2 as cloudinary } from "cloudinary";

import Banner from "../models/banner.model";

// CREATE multiple banners
export const createBanner = async (req: Request, res: Response) => {
    const { urls } = req.body;

    // Expecting: { urls: ["url1", "url2", ...] }
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        throw new AppError("URLs array is required", 400);
    }

    // remove duplicates from request (optional but good practice)
    const uniqueUrls = [...new Set(urls)];

    // prepare data for insertMany
    const bannersToCreate = uniqueUrls.map((url: string) => ({ url }));

    // insert multiple docs
    const banners = await Banner.insertMany(bannersToCreate, {
        ordered: false, // skips duplicates instead of failing everything
    });

    res.status(201).json({
        success: true,
        message: "Banners created successfully",
        count: banners.length,
        data: banners,
    });
};

// GET all banners
export const getBanners = async (req: Request, res: Response) => {
    const banners = await Banner.find();

    res.status(200).json({
        success: true,
        count: banners.length,
        data: banners,
    });
};

// DELETE banner
export const deleteBanner = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new AppError("Banner ID is required", 400);
    }

    const banner = await Banner.findById(id);

    if (!banner) {
        throw new AppError("Banner not found", 404);
    }

    // Try finding upload file (optional)
    const file = await Upload.findOne({ url: banner.url });

    // Cloudinary deletion should not block DB deletion
    if (file) {
        try {
            await cloudinary.uploader.destroy(file.publicId);
            await file.deleteOne();
        } catch (error) {
            console.error("Cloudinary delete failed:", error);
        }
    }

    await banner.deleteOne();

    res.status(204).send();
};
