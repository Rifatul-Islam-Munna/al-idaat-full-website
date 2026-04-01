import { Request, Response } from "express";
import AppError from "../utils/AppError";
import Upload from "../models/upload.model";
import { v2 as cloudinary } from "cloudinary";
import Offer from "../models/offer.model";

// CREATE multiple offer
export const createOffer = async (req: Request, res: Response) => {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, data: offer });
};

// GET all offers
export const getOffers = async (req: Request, res: Response) => {
    const offers = await Offer.find();

    res.status(200).json({
        success: true,
        count: offers.length,
        data: offers,
    });
};

// DELETE offer
export const deleteOffer = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new AppError("Offer ID is required", 400);
    }

    const offer = await Offer.findById(id);

    if (!offer) {
        throw new AppError("Offer not found", 404);
    }

    // Try finding upload file (optional)
    const file = await Upload.findOne({ url: offer.url });

    // Cloudinary deletion should not block DB deletion
    if (file) {
        try {
            await cloudinary.uploader.destroy(file.publicId);
            await file.deleteOne();
        } catch (error) {
            console.error("Cloudinary delete failed:", error);
        }
    }

    await offer.deleteOne();

    res.status(204).send();
};
