import { Request, Response } from "express";
import AppError from "../utils/AppError";
import CustomerReview from "../models/customer_review.model";

export const createCustomerReview = async (req: Request, res: Response) => {
    const customerReview = await CustomerReview.create({
        ...req.body,
        location: req.body.location?.trim() || undefined,
    });

    res.status(201).json({
        success: true,
        data: customerReview,
    });
};

export const getCustomerReviews = async (req: Request, res: Response) => {
    const customerReviews = await CustomerReview.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: customerReviews.length,
        data: customerReviews,
    });
};

export const deleteCustomerReview = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new AppError("Customer review ID is required", 400);
    }

    const customerReview = await CustomerReview.findById(id);

    if (!customerReview) {
        throw new AppError("Customer review not found", 404);
    }

    await customerReview.deleteOne();

    res.status(204).send();
};
