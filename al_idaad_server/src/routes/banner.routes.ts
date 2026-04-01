import { Router } from "express";

import validateRequest from "../middlewares/validate.middleware";

import { identifier } from "../middlewares/indentifier.middleware";
import { createBanner, deleteBanner, getBanners } from "../controllers/banner.controller";
import { createBannerSchema } from "../schemas/banner.schema";

const router = Router();

router.get("/", getBanners);
router.post("/", identifier, validateRequest(createBannerSchema), createBanner);
router.delete("/:id", identifier, deleteBanner);

export default router;
