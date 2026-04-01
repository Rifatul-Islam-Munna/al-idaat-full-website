import { Request, Response } from "express";
import Order from "../models/order.model";

const STEADFAST_AUTH_TOKEN = process.env.STEADFAST_AUTH_TOKEN;

export const steadfastWebhook = async (req: Request, res: Response) => {
    try {
        // ✅ Verify Bearer token (DO NOT log credentials)
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== `Bearer ${STEADFAST_AUTH_TOKEN}`) {
            return res.status(401).json({ status: "error", message: "Unauthorized" });
        }

        const { notification_type, consignment_id, status, tracking_message } = req.body;

        // ✅ Handle delivery_status updates
        if (notification_type === "delivery_status") {
            const order = await Order.findOne({
                steadfastConsignmentId: String(consignment_id),
            });

            if (!order) {
                return res.status(404).json({ status: "error", message: "Invalid consignment id." });
            }

            order.deliveryStatus = status; // pending | delivered | partial_delivered | cancelled | unknown
            await order.save();

            console.log(`[Webhook] Order ${order._id} status updated to "${status}" — ${tracking_message}`);
        }

        // ✅ Handle tracking_update notifications (optional — no status change, just a movement update)
        if (notification_type === "tracking_update") {
            console.log(`[Webhook] Tracking update for consignment ${consignment_id}: ${tracking_message}`);
            // You can store tracking_message in a separate tracking history collection if needed
        }

        return res.status(200).json({ status: "success", message: "Webhook received successfully." });
    } catch (err) {
        console.error("[Webhook] Error:", err);
        return res.status(500).json({ status: "error", message: "Server error" });
    }
};
