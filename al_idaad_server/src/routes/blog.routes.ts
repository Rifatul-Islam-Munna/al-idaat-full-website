import { Router } from "express";
import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "../controllers/blog.controller";

import validateRequest from "../middlewares/validate.middleware";
import { createBlogSchema, updateBlogSchema } from "../schemas/blog.schema";
import { identifier } from "../middlewares/indentifier.middleware";

const router = Router();

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/", identifier, validateRequest(createBlogSchema), createBlog);
router.put("/:id", identifier, validateRequest(updateBlogSchema), updateBlog);
router.delete("/:id", identifier, deleteBlog);

export default router;
