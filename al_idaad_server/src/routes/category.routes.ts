import { Router } from "express";
import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "../controllers/category.controller";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema";
import { identifier } from "../middlewares/indentifier.middleware";
import validateRequest from "../middlewares/validate.middleware";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", identifier, validateRequest(createCategorySchema), createCategory);
router.put("/:id", identifier, validateRequest(updateCategorySchema), updateCategory);
router.delete("/:id", identifier, deleteCategory);

export default router;
