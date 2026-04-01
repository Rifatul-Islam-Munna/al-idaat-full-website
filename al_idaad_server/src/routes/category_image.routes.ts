import { Router } from "express";

import validateRequest from "../middlewares/validate.middleware";
import { identifier } from "../middlewares/indentifier.middleware";
import { createCategoryImage, deleteCategoryImage, getCategoryImages, updateCategoryImage } from "../controllers/category_image.controller";
import { createCategoryImageSchema, updateCategoryImageSchema } from "../schemas/category_image.schema";

const router = Router();

router.get("/", getCategoryImages);
router.post("/", identifier, validateRequest(createCategoryImageSchema), createCategoryImage);
router.put("/:id", identifier, validateRequest(updateCategoryImageSchema), updateCategoryImage);
router.delete("/:id", identifier, deleteCategoryImage);

export default router;
