import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { z } from "zod";
import User from "../models/user.model";
import Product from "../models/product.model";
import Session from "../models/session.model";
import { env } from "../config/env";
import { loginUserSchema } from "../schemas/user.schema";
import { transport } from "../utils/sendMail";
import { createDeviceId } from "../utils/device";
import formatExpiration from "../utils/formatDate";
import { createAccessToken, createRefreshToken, RefreshTokenPayload } from "../utils/tokens";

type LoginUserInput = z.infer<typeof loginUserSchema>["body"];

const SESSION_MAX_AGE_MS = 10 * 24 * 60 * 60 * 1000;

const getSessionExpiryDate = () => new Date(Date.now() + SESSION_MAX_AGE_MS);

const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
});

export const getUsers = async (req: Request, res: Response) => {
    const data = await User.find();

    res.status(200).json({
        success: true,
        data,
    });
};

export const getCurrentUser = async (req: Request, res: Response) => {
    if (!req.user?.id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const user = await User.findById(req.user.id).populate("wishlist");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    res.status(200).json({
        success: true,
        data: user,
    });
};

export const updateProfile = async (req: Request, res: Response) => {
    if (!req.user?.id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    const normalize = (value?: string) => value?.trim() || undefined;

    if (typeof req.body.name === "string") user.name = req.body.name.trim();
    if (req.body.phone !== undefined) user.phone = normalize(req.body.phone);
    if (req.body.address !== undefined) user.address = normalize(req.body.address);
    if (req.body.city !== undefined) user.city = normalize(req.body.city);
    if (req.body.district !== undefined) user.district = normalize(req.body.district);

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate("wishlist");

    res.status(200).json({
        success: true,
        data: updatedUser,
        message: "Profile updated successfully",
    });
};

export const toggleWishlist = async (req: Request, res: Response) => {
    if (!req.user?.id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const { productId } = req.params;

    if (!productId) {
        return res.status(400).json({
            success: false,
            message: "Product ID is required",
        });
    }

    const [user, product] = await Promise.all([User.findById(req.user.id), Product.findById(productId)]);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    const alreadyInWishlist = user.wishlist.some((item) => item.toString() === productId);

    if (alreadyInWishlist) {
        user.wishlist = user.wishlist.filter((item) => item.toString() !== productId);
    } else {
        user.wishlist.push(product._id);
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate("wishlist");

    res.status(200).json({
        success: true,
        inWishlist: !alreadyInWishlist,
        data: updatedUser,
        message: alreadyInWishlist ? "Removed from wishlist" : "Added to wishlist",
    });
};

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, key } = req.body;

    const existingUser = await User.findOne({ email }).select("-password");

    if (existingUser) {
        return res.status(401).json({
            success: false,
            message: "Email already is in use",
        });
    }

    let role: "admin" | "user" = "user";

    if (key) {
        if (key !== env.ADMIN_KEY) {
            return res.status(401).json({
                success: false,
                message: "Error key",
            });
        }

        role = "admin";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        name,
        email,
        role,
        password: hashedPassword,
        verified: role === "admin",
    });

    res.status(201).json({
        success: true,
        message: `${role} account created successfully`,
    });
};

export const loginUser = async (req: Request<{}, {}, LoginUserInput>, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email }).select("+password");

    if (!existingUser) {
        return res.status(401).json({
            success: false,
            message: "User does not exists or Invalid email",
        });
    }

    const result = await bcrypt.compare(password, existingUser.password);

    if (!result) {
        return res.status(401).json({ success: false, message: "Wrong password!" });
    }

    const deviceId = createDeviceId(req);
    const expiresAtDate = getSessionExpiryDate();

    const session = await Session.create({
        userId: existingUser._id,
        deviceId,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        expiresAt: expiresAtDate,
        expiresAtFormated: formatExpiration(expiresAtDate),
    });

    const refreshToken = createRefreshToken(session._id);
    const accessToken = createAccessToken({ _id: existingUser._id, role: existingUser.role as "admin" | "user" });

    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

    res.status(200).json({
        success: true,
        accessToken,
        message: "Logged in successfully",
    });
};

export const refresh = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token found",
        });
    }

    let payload: RefreshTokenPayload;

    try {
        payload = jwt.verify(token, env.REFRESH_SECRET) as RefreshTokenPayload;
    } catch {
        return res.status(403).json({
            success: false,
            message: "Invalid token",
        });
    }

    const oldSession = await Session.findById(payload.sid);

    if (!oldSession || !oldSession.valid) {
        if (oldSession) {
            await Session.updateMany({ userId: oldSession.userId }, { valid: false });
        }

        return res.status(403).json({
            success: false,
            message: "Invalid or reused token detected",
        });
    }

    oldSession.valid = false;
    await oldSession.save();

    const expiresAtDate = getSessionExpiryDate();

    const newSession = await Session.create({
        userId: oldSession.userId,
        deviceId: oldSession.deviceId,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        expiresAt: expiresAtDate,
        expiresAtFormated: formatExpiration(expiresAtDate),
    });

    const user = await User.findById(oldSession.userId).select("role");

    if (!user) {
        return res.status(403).json({
            success: false,
            message: "User not found",
        });
    }

    const newRefresh = createRefreshToken(newSession._id);
    const accessToken = createAccessToken({
        _id: user._id,
        role: user.role as "admin" | "user",
    });

    res.cookie("refreshToken", newRefresh, getRefreshCookieOptions());

    return res.status(200).json({
        success: true,
        accessToken,
    });
};

export const logOut = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (token) {
        try {
            const payload = jwt.verify(token, env.REFRESH_SECRET) as RefreshTokenPayload;

            await Session.findByIdAndUpdate(payload.sid, {
                valid: false,
            });
        } catch {
            // Ignore invalid tokens during logout and still clear the cookie.
        }
    }

    res.clearCookie("refreshToken", getRefreshCookieOptions());

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};

export const sendVerificationCode = async (req: Request, res: Response) => {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        return res.status(404).json({ success: false, message: "User does not exists!" });
    }

    if (existingUser.verified) {
        return res.status(400).json({ success: false, message: "You are already verified!" });
    }

    const codeValue = Math.floor(100000 + Math.random() * 900000).toString();

    const info = await transport.sendMail({
        from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to: existingUser.email,
        subject: "verification code",
        html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
                    <p style="font-size: 16px; color: #333;">Dear User,</p>
                    <p style="font-size: 16px; color: #333;">Your verification code is:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #e8f5e9;">
                        ${codeValue}
                        </span>
                    </div>
                    <p style="font-size: 16px; color: #333;">Please use this code to verify your email address. The code will expire in 10 minutes.</p>
                    <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
                    <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
                        <p>Thank you,<br>Your Company Team</p>
                        <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
                    </footer>
                </div>
        `,
    });

    if (info.accepted[0] === existingUser.email) {
        const hashedCodeValue = createHmac("sha256", env.HMAC_VERIFICATION_CODE_SECRET).update(codeValue).digest("hex");
        existingUser.verificationCode = hashedCodeValue;
        existingUser.verificationCodeValidation = Date.now();
        await existingUser.save();
        return res.status(200).json({ success: true, message: "Code sent!" });
    }

    res.status(400).json({ success: false, message: "Code sent failed!" });
};

export const verifyVerificationCode = async (req: Request, res: Response) => {
    const { email, providedCode } = req.body;
    const codeValue = providedCode.toString();

    const existingUser = await User.findOne({ email }).select("+verificationCode +verificationCodeValidation");

    if (!existingUser) {
        return res.status(404).json({ success: false, message: "User not found!" });
    }

    if (existingUser.verified) {
        return res.status(409).json({ success: false, message: "User already verified!" });
    }

    if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
        return res.status(400).json({
            success: false,
            message: "No verification code found, please request again.",
        });
    }

    const isExpired = Date.now() - existingUser.verificationCodeValidation > 10 * 60 * 1000;

    if (isExpired) {
        return res.status(400).json({ success: false, message: "Verification code expired!" });
    }

    const hashedCodeValue = createHmac("sha256", env.HMAC_VERIFICATION_CODE_SECRET).update(codeValue).digest("hex");

    const providedBuffer = Buffer.from(hashedCodeValue, "hex");
    const storedBuffer = Buffer.from(existingUser.verificationCode, "hex");

    if (providedBuffer.length === storedBuffer.length && timingSafeEqual(providedBuffer, storedBuffer)) {
        existingUser.verified = true;
        existingUser.verificationCode = null;
        existingUser.verificationCodeValidation = null;
        await existingUser.save();

        return res.status(200).json({
            success: true,
            message: "Account verified successfully!",
        });
    }

    return res.status(400).json({ success: false, message: "Invalid verification code." });
};

export const sendForgotPasswordCode = async (req: Request, res: Response) => {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        return res.status(404).json({ success: false, message: "User does not exists!" });
    }

    const codeValue = Math.floor(100000 + Math.random() * 900000).toString();

    const info = await transport.sendMail({
        from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to: existingUser.email,
        subject: "Forgot Password Verification code",
        html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
                    <p style="font-size: 16px; color: #333;">Dear User,</p>
                    <p style="font-size: 16px; color: #333;">Your verification code is:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #e8f5e9;">
                        ${codeValue}
                        </span>
                    </div>
                    <p style="font-size: 16px; color: #333;">Please use this code to set new password. The code will expire in 10 minutes.</p>
                    <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
                    <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
                        <p>Thank you,<br>The Kahaf</p>
                        <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
                    </footer>
                </div>
        `,
    });

    if (info.accepted[0] === existingUser.email) {
        const hashedCodeValue = createHmac("sha256", env.HMAC_VERIFICATION_CODE_SECRET).update(codeValue).digest("hex");
        existingUser.forgotPasswordCode = hashedCodeValue;
        existingUser.forgotPasswordCodeValidation = Date.now();
        await existingUser.save();
        return res.status(200).json({ success: true, message: "Code sent!" });
    }

    res.status(400).json({ success: false, message: "Code sent failed!" });
};

export const verifyForgotPasswordCodeAndUpdatePassword = async (req: Request, res: Response) => {
    const { email, providedCode, newPassword } = req.body;
    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select("+forgotPasswordCode +forgotPasswordCodeValidation");

    if (!existingUser) {
        return res.status(401).json({ success: false, message: "User does not exists!" });
    }

    if (!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) {
        return res.status(400).json({
            success: false,
            message: "something is wrong with the code!",
        });
    }

    if (Date.now() - existingUser.forgotPasswordCodeValidation > 2 * 60 * 1000) {
        return res.status(400).json({ success: false, message: "code has been expired!" });
    }

    const hashedCodeValue = createHmac("sha256", env.HMAC_VERIFICATION_CODE_SECRET).update(codeValue).digest("hex");

    if (hashedCodeValue === existingUser.forgotPasswordCode) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        existingUser.password = hashedPassword;
        existingUser.forgotPasswordCode = null;
        existingUser.forgotPasswordCodeValidation = null;
        await existingUser.save();
        return res.status(200).json({ success: true, message: "Password updated!!" });
    }

    return res.status(400).json({ success: false, message: "unexpected occured!!" });
};

export const changePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.params;

    const data = await User.findById(id);

    if (!(data?.verified as boolean)) {
        return res.status(401).json({
            success: false,
            message: "You are not a verified user!",
        });
    }

    const existingUser = await User.findById(id).select("+password");

    if (!existingUser) {
        return res.status(404).json({ success: false, message: "User does not exist!" });
    }

    const isMatch = await bcrypt.compare(oldPassword, existingUser.password);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials!" });
    }

    existingUser.password = await bcrypt.hash(newPassword, 10);
    await existingUser.save();

    return res.status(200).json({ success: true, message: "Password updated!" });
};
