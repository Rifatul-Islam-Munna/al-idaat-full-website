import { Router } from "express";
import { steadfastWebhook } from "../controllers/webhook.controller";

const router = Router();
router.post("/webhook/steadfast", steadfastWebhook);

export default router;
