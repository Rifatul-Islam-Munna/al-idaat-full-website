import mongoose from "mongoose";
import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/product.model";
import AppError from "../utils/AppError";
import Upload from "../models/upload.model";
import { resolveCategoryIds } from "../utils/resolveCategoryIds";
import { ensureProductSlug, ensureProductSlugs, generateUniqueProductSlug } from "../utils/productSlug";

// Get all products
export const getProducts = async (req: Request, res: Response) => {
    const products = await Product.find().limit(30);
    const productsWithSlugs = await ensureProductSlugs(products);

    res.status(200).json({
        success: true,
        count: productsWithSlugs.length,
        data: productsWithSlugs,
    });
};

// Get single product by slug or id
export const getSingleProduct = async (req: Request, res: Response) => {
    const rawIdentifier = req.params.id;
    const identifier = Array.isArray(rawIdentifier) ? rawIdentifier[0] : rawIdentifier;

    if (!identifier) {
        throw new AppError("Product identifier is required", 400);
    }

    const productById = mongoose.Types.ObjectId.isValid(identifier) ? await Product.findById(identifier) : null;
    const productDoc = productById ?? (await Product.findOne({ slug: identifier }));

    if (!productDoc) {
        throw new AppError("Product not found", 404);
    }

    await ensureProductSlug(productDoc);

    const product = productDoc.toObject();
    const resolvedCategories = await resolveCategoryIds(product.categoryIdList);

    res.status(200).json({
        success: true,
        data: {
            ...product,
            categoryIdList: resolvedCategories,
        },
    });
};

// Create product
export const createProduct = async (req: Request, res: Response) => {
    const product = await Product.create({
        ...req.body,
        slug: await generateUniqueProductSlug(req.body.name),
    });

    res.status(201).json({ success: true, data: product });
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
    const oldProduct = await Product.findById(req.params.id);

    if (!oldProduct) {
        throw new AppError("Product not found", 404);
    }

    const currentThumbnailUrl = oldProduct.thumbnail;
    const newThumbnailUrl = req.body.thumbnail ?? currentThumbnailUrl;

    const currentImageUrls = oldProduct.images;
    const newImageUrls = req.body.images ?? currentImageUrls;
    const arraysEqual = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

    if (newThumbnailUrl && currentThumbnailUrl !== newThumbnailUrl) {
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

    if (!arraysEqual(currentImageUrls, newImageUrls)) {
        const excludedImageUrls = currentImageUrls.filter((url) => !newImageUrls.includes(url));
        const excludedFileInstance = await Upload.find({ url: { $in: excludedImageUrls } });

        if (excludedFileInstance.length) {
            const publicIds = excludedFileInstance.map((ele) => ele.publicId);
            const ids = excludedFileInstance.map((ele) => ele._id);

            try {
                await cloudinary.api.delete_resources(publicIds, {
                    resource_type: "image",
                });
                await Upload.deleteMany({ _id: { $in: ids } });
            } catch (err) {
                console.error("Cloudinary deletion error:", err);
                throw new AppError("Failed to remove images from cloudinary or database", 500);
            }
        }
    }

    const updatePayload = {
        ...req.body,
        ...(req.body.name || !oldProduct.slug
            ? {
                  slug: await generateUniqueProductSlug(req.body.name || oldProduct.name, String(oldProduct._id)),
              }
            : {}),
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updatePayload, {
        new: true,
        runValidators: true,
    });

    if (!product) {
        throw new AppError("Product not found after update", 404);
    }

    res.status(200).json({ success: true, data: product });
};

// Delete product + delete associated files
export const deleteProduct = async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    const fileUrls = [product.thumbnail, ...product.images];
    const uploadDocs = await Upload.find({ url: { $in: fileUrls } });
    const publicIds = uploadDocs.map((doc) => doc.publicId);

    try {
        let cloudinaryResult: { deleted: Record<string, string> } = {
            deleted: {},
        };

        if (publicIds.length > 0) {
            cloudinaryResult = await cloudinary.api.delete_resources(publicIds, {
                resource_type: "image",
            });
        }

        await Upload.deleteMany({ url: { $in: fileUrls } });
        await Product.findByIdAndDelete(req.params.id);

        const deletedCount = Object.values(cloudinaryResult.deleted || {}).filter((status) => status === "deleted").length;

        res.status(200).json({
            success: true,
            message: `Product deleted successfully. ${uploadDocs.length} file(s) deleted from database, ${deletedCount} file(s) deleted from Cloudinary`,
        });
    } catch (err) {
        console.error("Error during product deletion:", err);
        throw new AppError("Failed to delete product or associated files", 500);
    }
};
