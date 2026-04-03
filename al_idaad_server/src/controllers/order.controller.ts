import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import Order from "../models/order.model";
import AppError from "../utils/AppError";
import { createOrderService } from "../services/order.service";
import { env } from "../config/env";
import { AccessTokenPayload } from "../utils/tokens";

const getOptionalAuthenticatedUserId = (req: Request) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return undefined;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return undefined;
    }

    try {
        const decoded = jwt.verify(token, env.ACCESS_SECRET) as AccessTokenPayload;
        return decoded.id;
    } catch {
        throw new AppError("Invalid access token", 401);
    }
};

export const getOrders = async (req: Request, res: Response) => {
    const orders = await Order.find();

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
    });
};

export const getMyOrders = async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw new AppError("Unauthorized", 401);
    }

    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
    });
};

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

export const createOrder = async (req: Request, res: Response) => {
    const userId = getOptionalAuthenticatedUserId(req);
    const { order, tracking_code, consignment_id, steadfastSuccess } = await createOrderService({
        ...req.body,
        ...(userId ? { userId } : {}),
    });

    res.status(201).json({
        success: true,
        data: {
            orderId: order._id,
            tracking_code,
            consignment_id,
            deliveryStatus: order.deliveryStatus,
            steadfastSuccess,
        },
    });
};

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
