import { Request, Response } from "express";
import Product from "../models/product.model";
import AppError from "../utils/AppError";
import Upload from "../models/upload.model";
import { v2 as cloudinary } from "cloudinary";
import { resolveCategoryIds } from "../utils/resolveCategoryIds";

// ✅ Get all products
export const getProducts = async (req: Request, res: Response) => {
    const products = await Product.find();
    res.status(200).json({
        success: true,
        count: products.length,
        data: products,
    });
};

// ✅ Get single product
export const getSingleProduct = async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id).lean(); // 👈 .lean() for plain JS object
    if (!product) {
        throw new AppError("Product not found", 404);
    }

    // Resolve category names for all IDs in categoryIdList
    const resolvedCategories = await resolveCategoryIds(product.categoryIdList);

    res.status(200).json({
        success: true,
        data: {
            ...product,
            categoryIdList: resolvedCategories, // 👈 replace raw IDs with { _id, name }
        },
    });
};

// ✅ Create product
export const createProduct = async (req: Request, res: Response) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
};

// ✅ Update product
export const updateProduct = async (req: Request, res: Response) => {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
        throw new AppError("Product not found", 404);
    }

    const currentThumbnailUrl = oldProduct.thumbnail;
    const newThumbnailUrl = req.body.thumbnail;

    const currentImageUrls = oldProduct.images;
    const newImageUrls = req.body.images;
    const arraysEqual = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

    // If thumbnail changed------------------------------------------------
    if (newThumbnailUrl && currentThumbnailUrl !== newThumbnailUrl) {
        // Find old file instance
        const fileInstance = await Upload.findOne({ url: currentThumbnailUrl });
        if (fileInstance) {
            try {
                await cloudinary.uploader.destroy(fileInstance.publicId);
                await fileInstance.deleteOne();
            } catch (err) {
                throw new AppError("Failed to remove old thumbnail from cloudinary or database", 500);
            }
        }
    }

    //if product images changes-----------------------------------------------
    if (!arraysEqual(currentImageUrls, newImageUrls)) {
        const excludedImageUrls = currentImageUrls.filter((url) => !newImageUrls.includes(url));

        const excludedFileInstance = await Upload.find({ url: { $in: excludedImageUrls } });

        if (excludedFileInstance.length) {
            const publicIds = excludedFileInstance.map((ele) => ele.publicId);
            const ids = excludedFileInstance.map((ele) => ele._id);
            try {
                // Bulk delete from Cloudinary (explicit type = "image")
                await cloudinary.api.delete_resources(publicIds, {
                    resource_type: "image",
                });
                await Upload.deleteMany({ _id: { $in: ids } });
            } catch (err) {
                console.error("❌ Cloudinary deletion error:", err);
                throw new AppError("Failed to remove images from cloudinary or database", 500);
            }
        }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!product) {
        throw new AppError("Product not found after update", 404);
    }

    res.status(200).json({ success: true, data: product });
};

// ✅ Delete product + delete associated files
export const deleteProduct = async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    // Collect all file URLs (thumbnail and images)
    const fileUrls = [product.thumbnail, ...product.images];

    // Find Upload documents that match the URLs
    const uploadDocs = await Upload.find({ url: { $in: fileUrls } });

    // Extract publicIds for Cloudinary deletion
    const publicIds = uploadDocs.map((doc) => doc.publicId);

    try {
        // Delete files from Cloudinary
        let cloudinaryResult: { deleted: Record<string, string> } = {
            deleted: {},
        };
        if (publicIds.length > 0) {
            cloudinaryResult = await cloudinary.api.delete_resources(publicIds, {
                resource_type: "image",
            });
        }

        // Delete Upload documents from MongoDB
        await Upload.deleteMany({ url: { $in: fileUrls } });

        // Delete the product
        await Product.findByIdAndDelete(req.params.id);

        // Calculate how many files were deleted from Cloudinary
        const deletedCount = Object.values(cloudinaryResult.deleted || {}).filter((status) => status === "deleted").length;

        res.status(200).json({
            success: true,
            message: `Product deleted successfully. ${uploadDocs.length} file(s) deleted from database, ${deletedCount} file(s) deleted from Cloudinary`,
        });
    } catch (err) {
        console.error("❌ Error during product deletion:", err);
        throw new AppError("Failed to delete product or associated files", 500);
    }
};
