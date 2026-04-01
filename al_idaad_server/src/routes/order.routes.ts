import { Router } from "express";
import { createOrder, deleteOrder, getOrders, getSingleOrder, updateOrder } from "../controllers/order.controller";

import { createOrderSchema, updateOrderSchema } from "../schemas/order.schema";
import validateRequest from "../middlewares/validate.middleware";
import { identifier } from "../middlewares/indentifier.middleware";

const router = Router();

router.get("/", getOrders);
router.get("/:id", getSingleOrder);

router.post("/", validateRequest(createOrderSchema), createOrder);

router.put("/:id", validateRequest(updateOrderSchema), updateOrder);

router.delete("/:id", identifier, deleteOrder);

export default router;
