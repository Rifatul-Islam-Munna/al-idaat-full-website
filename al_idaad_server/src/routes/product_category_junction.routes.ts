import { Router } from "express";

import validateRequest from "../middlewares/validate.middleware";
import { identifier } from "../middlewares/indentifier.middleware";

import {
    createPCJunction,
    getAllPCJunctions,
    getCategoriesByProduct,
    getProductsByCategory,
    deleteMultiplePCJunctions,
} from "../controllers/product_category_junction.controller";

import { createPCJunctionSchema } from "../schemas/product_category_junction.schema";

const router = Router();

// GET all relations
router.get("/", getAllPCJunctions);

// GET categories of a product
router.get("/product/:productId", getCategoriesByProduct);

// GET products of a category
router.get("/category/:categoryId", getProductsByCategory);

// CREATE multiple relations
router.post("/", identifier, validateRequest(createPCJunctionSchema), createPCJunction);

// DELETE multiple relations
router.delete("/", identifier, deleteMultiplePCJunctions);

export default router;
