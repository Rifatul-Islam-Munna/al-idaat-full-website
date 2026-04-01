import Order, { IOrder } from "../models/order.model";
import { createSteadfastOrder } from "./delivery/steadfast.service";

export interface OrderWithTracking {
    order: IOrder;
    tracking_code: string;
    consignment_id: string;
    steadfastSuccess: boolean;
}

export const createOrderService = async (payload: IOrder): Promise<OrderWithTracking> => {
    // 1. Save order to DB first
    const order = await Order.create(payload);

    // 2. Attempt Steadfast order creation (awaited — we need the tracking ID)
    let retries = 3;
    let lastError: unknown;

    while (retries > 0) {
        try {
            const { tracking_code, consignment_id } = await createSteadfastOrder(order);

            // 3. Update order in DB with Steadfast tracking info
            order.steadfastTrackingCode = tracking_code;
            order.steadfastConsignmentId = consignment_id;
            order.deliveryStatus = "pending";
            await order.save();

            // 4. Return order + tracking info to controller
            return {
                order,
                tracking_code,
                consignment_id,
                steadfastSuccess: true,
            };
        } catch (err) {
            lastError = err;
            retries--;

            if (retries > 0) {
                // Small delay before retry (exponential: 1s, 2s)
                await new Promise((res) => setTimeout(res, (3 - retries) * 1000));
            }
        }
    }

    // 5. All retries exhausted — order is saved in DB but Steadfast failed
    //    We still return the DB order so the customer isn't left hanging.
    //    You can add alerting/logging here (e.g. Slack, email, Sentry).
    console.error(`[Steadfast] Failed to create consignment for order ${order._id} after 3 attempts:`, lastError);

    order.deliveryStatus = "steadfast_failed";
    await order.save();

    return {
        order,
        tracking_code: "",
        consignment_id: "",
        steadfastSuccess: false,
    };
};
