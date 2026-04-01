import { Router } from "express";
import { createProduct, deleteProduct, getProducts, getSingleProduct, updateProduct } from "../controllers/product.controller";

import { createProductSchema, updateProductSchema } from "../schemas/product.schema";
import { identifier } from "../middlewares/indentifier.middleware";
import validateRequest from "../middlewares/validate.middleware";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getSingleProduct);
router.post("/", identifier, validateRequest(createProductSchema), createProduct);
router.put("/:id", validateRequest(updateProductSchema), updateProduct);
router.delete("/:id", deleteProduct);
export default router;
