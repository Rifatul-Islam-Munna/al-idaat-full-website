import { Request, Response } from "express";
import Category, { ICategory, ISubCategory } from "../models/category.model";
import AppError from "../utils/AppError";
import mongoose from "mongoose";
import Product from "../models/product.model";

// ✅ Create category
export const createCategory = async (req: Request, res: Response) => {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
};

// ✅ Get all categories
export const getCategories = async (_req: Request, res: Response) => {
    const categories = await Category.find();
    res.status(200).json({ success: true, data: categories });
};

// ✅ Get single category
export const getCategory = async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        throw new AppError("Category not found", 404);
    }
    res.status(200).json({ success: true, data: category });
};

// ✅ Update category
export const updateCategory = async (req: Request, res: Response) => {
    const category: ICategory | null = await Category.findById(req.params.id);
    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const getAllCategoryIds = (category: ICategory): string[] => {
        const ids: string[] = [category._id.toString()];

        const extractIds = (subCategories: ISubCategory[]): void => {
            for (const subCategory of subCategories) {
                ids.push(subCategory._id.toString());
                if (subCategory.subCategories && subCategory.subCategories.length > 0) {
                    extractIds(subCategory.subCategories);
                }
            }
        };

        if (category.subCategories && category.subCategories.length > 0) {
            extractIds(category.subCategories);
        }

        return ids;
    };

    const allCategoryIds: string[] = getAllCategoryIds(category);
    // Convert string IDs to ObjectId for MongoDB query
    const objectIds = allCategoryIds.map((id) => new mongoose.Types.ObjectId(id));

    // Query products where category._id is in the provided IDs
    const matchingProducts = await Product.find({
        "category._id": { $in: objectIds },
    }).lean();

    // Check if any products were found
    const hasMatches = matchingProducts.length > 0;
    if (hasMatches) {
        throw new AppError("Category is in use", 400);
    }

    const updatedCategory: ICategory | null = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: updatedCategory,
    });
};

// ✅ Delete category
export const deleteCategory = async (req: Request, res: Response) => {
    const category: ICategory | null = await Category.findById(req.params.id);
    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const getAllCategoryIds = (category: ICategory): string[] => {
        const ids: string[] = [category._id.toString()];

        const extractIds = (subCategories: ISubCategory[]): void => {
            for (const subCategory of subCategories) {
                ids.push(subCategory._id.toString());
                if (subCategory.subCategories && subCategory.subCategories.length > 0) {
                    extractIds(subCategory.subCategories);
                }
            }
        };

        if (category.subCategories && category.subCategories.length > 0) {
            extractIds(category.subCategories);
        }

        return ids;
    };

    const allCategoryIds: string[] = getAllCategoryIds(category);
    // Convert string IDs to ObjectId for MongoDB query
    const objectIds = allCategoryIds.map((id) => new mongoose.Types.ObjectId(id));

    // Query products where category._id is in the provided IDs
    const matchingProducts = await Product.find({
        "category._id": { $in: objectIds },
    }).lean();

    // Check if any products were found
    const hasMatches = matchingProducts.length > 0;
    if (hasMatches) {
        throw new AppError("Category is in use", 400);
    }
    await Category.findByIdAndDelete(req.params.id);

    res.status(204).send();
};
