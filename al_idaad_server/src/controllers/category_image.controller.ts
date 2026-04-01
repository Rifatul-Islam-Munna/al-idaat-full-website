import { Request, Response } from "express";
import AppError from "../utils/AppError";
import Upload from "../models/upload.model";
import { v2 as cloudinary } from "cloudinary";
import CategoryImage from "../models/category_image.model";

// CREATE multiple categoryImage
export const createCategoryImage = async (req: Request, res: Response) => {
    const categoryImage = await CategoryImage.create(req.body);
    res.status(201).json({ success: true, data: categoryImage });
};

// GET all categoryImages
export const getCategoryImages = async (req: Request, res: Response) => {
    const categoryImages = await CategoryImage.find();

    res.status(200).json({
        success: true,
        count: categoryImages.length,
        data: categoryImages,
    });
};

//UPDATE categoryImage
export const updateCategoryImage = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const categoryImage = await CategoryImage.findById(id);
    if (!categoryImage) {
        throw new AppError("CategoryImage not found", 404);
    }

    const currentImageUrl = categoryImage.url;
    const newImageUrl = updates.url;

    // If thumbnail changed
    if (newImageUrl && currentImageUrl !== newImageUrl) {
        // Find old file instance
        const fileInstance = await Upload.findOne({ url: currentImageUrl });
        if (fileInstance) {
            try {
                await cloudinary.uploader.destroy(fileInstance.publicId);
                await fileInstance.deleteOne();
            } catch (err) {
                throw new AppError("Failed to remove old Image", 500);
            }
        }
    }

    // Now update categoryImage
    const updatedCategoryImage = await CategoryImage.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: updatedCategoryImage,
    });
};

// DELETE categoryImage
export const deleteCategoryImage = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new AppError("CategoryImage ID is required", 400);
    }

    const categoryImage = await CategoryImage.findById(id);

    if (!categoryImage) {
        throw new AppError("CategoryImage not found", 404);
    }

    // Try finding upload file (optional)
    const file = await Upload.findOne({ url: categoryImage.url });

    // Cloudinary deletion should not block DB deletion
    if (file) {
        try {
            await cloudinary.uploader.destroy(file.publicId);
            await file.deleteOne();
        } catch (error) {
            console.error("Cloudinary delete failed:", error);
        }
    }

    await categoryImage.deleteOne();

    res.status(204).send();
};
