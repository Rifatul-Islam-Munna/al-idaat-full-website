import { Request, Response } from "express";
import AppError from "../utils/AppError";
import PCJunction from "../models/product_category_junction.model";

// CREATE relation
export const createPCJunction = async (req: Request, res: Response) => {
    const { relations } = req.body;

    if (!relations || !Array.isArray(relations) || relations.length === 0) {
        throw new AppError("relations array is required", 400);
    }

    // remove duplicates inside request itself
    const uniqueRelations = relations.filter(
        (value, index, self) => index === self.findIndex((r) => r.categoryId === value.categoryId && r.productId === value.productId),
    );

    try {
        const createdRelations = await PCJunction.insertMany(uniqueRelations, {
            ordered: false, // skip duplicates if already exists in DB
        });

        res.status(201).json({
            success: true,
            message: "Relations created successfully",
            count: createdRelations.length,
            data: createdRelations,
        });
    } catch (error: any) {
        // If all fail due to duplicates
        if (error.code === 11000) {
            throw new AppError("Some relations already exist", 400);
        }

        throw error;
    }
};

// GET all relations
export const getAllPCJunctions = async (req: Request, res: Response) => {
    const relations = await PCJunction.find();

    res.status(200).json({
        success: true,
        count: relations.length,
        data: relations,
    });
};

// GET all categories of a product
export const getCategoriesByProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;

    if (!productId) {
        throw new AppError("Product ID is required", 400);
    }

    const relations = await PCJunction.find({ productId });

    res.status(200).json({
        success: true,
        count: relations.length,
        data: relations,
    });
};

// GET all products of a category
export const getProductsByCategory = async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    if (!categoryId) {
        throw new AppError("Category ID is required", 400);
    }

    const relations = await PCJunction.find({ categoryId });

    res.status(200).json({
        success: true,
        count: relations.length,
        data: relations,
    });
};

// DELETE multiple relations by IDs
export const deleteMultiplePCJunctions = async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError("ids array is required", 400);
    }

    const result = await PCJunction.deleteMany({
        _id: { $in: ids },
    });

    res.status(200).json({
        success: true,
        message: "Relations deleted successfully",
        deletedCount: result.deletedCount,
    });
};
