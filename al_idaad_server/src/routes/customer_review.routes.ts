import { Router } from "express";
import { createCustomerReview, deleteCustomerReview, getCustomerReviews } from "../controllers/customer_review.controller";
import validateRequest from "../middlewares/validate.middleware";
import { identifier } from "../middlewares/indentifier.middleware";
import { createCustomerReviewSchema } from "../schemas/customer_review.schema";

const router = Router();

router.get("/", getCustomerReviews);
router.post("/", identifier, validateRequest(createCustomerReviewSchema), createCustomerReview);
router.delete("/:id", identifier, deleteCustomerReview);

export default router;
