import { Request, Response } from "express";
import Blog from "../models/blog.model";
import AppError from "../utils/AppError";
import Upload from "../models/upload.model";
import { v2 as cloudinary } from "cloudinary";
import { extractImageSources } from "../utils/imgUrlExtractor";

// CREATE a new blog
export const createBlog = async (req: Request, res: Response) => {
    const { title, thumbnail, description, category } = req.body;

    if (!title || !description || !category) {
        throw new AppError("All fields are required", 400);
    }

    const blog = await Blog.create({
        title,
        thumbnail,
        description,
        category,
    });

    res.status(201).json({
        success: true,
        data: blog,
    });
};

// GET all blogs
export const getAllBlogs = async (req: Request, res: Response) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: blogs.length,
        data: blogs,
    });
};

// GET single blog by id
export const getBlogById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
        throw new AppError("Blog not found", 404);
    }

    res.status(200).json({
        success: true,
        data: blog,
    });
};

// UPDATE blog
export const updateBlog = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
        throw new AppError("Blog not found", 404);
    }

    const currentThumbnailUrl = blog.thumbnail;
    const newThumbnailUrl = updates.thumbnail;

    // If thumbnail changed
    if (newThumbnailUrl && currentThumbnailUrl !== newThumbnailUrl) {
        // Find old file instance
        const fileInstance = await Upload.findOne({ url: currentThumbnailUrl });
        if (fileInstance) {
            try {
                await cloudinary.uploader.destroy(fileInstance.publicId);
                await fileInstance.deleteOne();
            } catch (err) {
                throw new AppError("Failed to remove old thumbnail", 500);
            }
        }
    }

    // Now update blog
    const updatedBlog = await Blog.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: updatedBlog,
    });
};

// DELETE blog
export const deleteBlog = async (req: Request, res: Response) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
        throw new AppError("Blog not found", 404);
    }

    let descriptonImgUrls: string[] = [];
    if (blog.description) {
        descriptonImgUrls = extractImageSources(blog.description);
    }

    //collect thumbnail url
    let fileUrls: string[] = [...descriptonImgUrls, blog.thumbnail];

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

        await Blog.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        console.error("❌ Error during blog deletion:", err);
        throw new AppError("Failed to delete blog or associated files", 500);
    }
};
