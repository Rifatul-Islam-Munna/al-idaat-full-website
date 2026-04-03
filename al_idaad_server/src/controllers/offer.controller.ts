import { Request, Response } from "express";
import AppError from "../utils/AppError";
import Upload from "../models/upload.model";
import { v2 as cloudinary } from "cloudinary";
import Offer from "../models/offer.model";

// CREATE multiple offer
export const createOffer = async (req: Request, res: Response) => {
    const desktopUrl = req.body.desktopUrl || req.body.url;
    const mobileUrl = req.body.mobileUrl || req.body.url;

    const offer = await Offer.create({
        ...req.body,
        url: desktopUrl,
        desktopUrl,
        mobileUrl,
    });
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

    const fileUrls = [...new Set([offer.url, offer.desktopUrl, offer.mobileUrl].filter((url): url is string => Boolean(url)))];
    const files = await Upload.find({ url: { $in: fileUrls } });

    // Cloudinary deletion should not block DB deletion
    if (files.length) {
        try {
            await cloudinary.api.delete_resources(
                files.map((file) => file.publicId),
                {
                    resource_type: "image",
                },
            );
            await Upload.deleteMany({ _id: { $in: files.map((file) => file._id) } });
        } catch (error) {
            console.error("Cloudinary delete failed:", error);
        }
    }

    await offer.deleteOne();

    res.status(204).send();
};
