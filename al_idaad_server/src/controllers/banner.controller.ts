import { Request, Response } from "express";
import AppError from "../utils/AppError";
import Upload from "../models/upload.model";
import { v2 as cloudinary } from "cloudinary";

import Banner from "../models/banner.model";

// CREATE multiple banners
export const createBanner = async (req: Request, res: Response) => {
    const normalizedBanners = Array.isArray(req.body.banners)
        ? req.body.banners
        : Array.isArray(req.body.urls)
          ? req.body.urls.map((url: string) => ({
                desktopUrl: url,
                mobileUrl: url,
            }))
          : [req.body];

    if (!normalizedBanners.length) {
        throw new AppError("At least one banner is required", 400);
    }

    const uniqueBanners = normalizedBanners.filter(
        (banner: { desktopUrl: string; mobileUrl: string }, index: number, self: { desktopUrl: string; mobileUrl: string }[]) =>
            self.findIndex((item) => item.desktopUrl === banner.desktopUrl && item.mobileUrl === banner.mobileUrl) === index,
    );

    const bannersToCreate = uniqueBanners.map(({ desktopUrl, mobileUrl }: { desktopUrl: string; mobileUrl: string }) => ({
        url: desktopUrl,
        desktopUrl,
        mobileUrl,
    }));

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

    const fileUrls = [...new Set([banner.url, banner.desktopUrl, banner.mobileUrl].filter((url): url is string => Boolean(url)))];
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

    await banner.deleteOne();

    res.status(204).send();
};
