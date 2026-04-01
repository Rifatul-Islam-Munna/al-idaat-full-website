import { Request, Response } from "express";
import Order from "../models/order.model";
import AppError from "../utils/AppError";
import { createOrderService } from "../services/order.service";

// ✅ Get all orders
export const getOrders = async (req: Request, res: Response) => {
    const orders = await Order.find();

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
    });
};

// ✅ Get single order
export const getSingleOrder = async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    res.status(200).json({
        success: true,
        data: order,
    });
};

// ✅ Create order — returns DB order + Steadfast tracking info
export const createOrder = async (req: Request, res: Response) => {
    const { order, tracking_code, consignment_id, steadfastSuccess } = await createOrderService(req.body);

    res.status(201).json({
        success: true,
        data: {
            orderId: order._id, // your internal DB order ID
            tracking_code, // Steadfast tracking code — share this with the user
            consignment_id, // Steadfast consignment ID — for internal use / status checks
            deliveryStatus: order.deliveryStatus,
            steadfastSuccess, // false = order saved but courier registration failed
        },
    });
};

// ✅ Update order
export const updateOrder = async (req: Request, res: Response) => {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    res.status(200).json({
        success: true,
        data: order,
    });
};

// ✅ Delete order
export const deleteOrder = async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Order deleted successfully",
    });
};
