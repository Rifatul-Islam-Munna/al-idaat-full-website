import { IOrder } from "../../models/order.model";
import { steadfastApi } from "../../utils/axiosInstance";

export interface SteadfastOrderResult {
    tracking_code: string;
    consignment_id: string;
}

export const createSteadfastOrder = async (order: IOrder): Promise<SteadfastOrderResult> => {
    const res = await steadfastApi.post("/create_order", {
        invoice: order._id.toString(),
        recipient_name: order.fullName,
        recipient_phone: order.phone,
        recipient_address: `${order.address}, ${order.city}, ${order.district}`,
        cod_amount: order.grandTotal,
        note: order.note || "",
    });

    // ✅ Steadfast wraps result under `consignment` key — e.g. res.data.consignment.tracking_code
    const consignment = res.data?.consignment;

    if (!consignment?.tracking_code || !consignment?.consignment_id) {
        throw new Error("Steadfast response missing tracking_code or consignment_id");
    }

    return {
        tracking_code: consignment.tracking_code,
        consignment_id: String(consignment.consignment_id),
    };
};
