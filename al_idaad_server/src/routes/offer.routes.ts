import { Router } from "express";

import validateRequest from "../middlewares/validate.middleware";

import { identifier } from "../middlewares/indentifier.middleware";
import { createOffer, deleteOffer, getOffers } from "../controllers/offer.controller";
import { createOfferSchema } from "../schemas/offer.schema";

const router = Router();

router.get("/", getOffers);
router.post("/", identifier, validateRequest(createOfferSchema), createOffer);
router.delete("/:id", identifier, deleteOffer);

export default router;
