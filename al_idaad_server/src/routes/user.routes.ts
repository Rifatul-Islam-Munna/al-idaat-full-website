import { Router } from "express";
import validateRequest from "../middlewares/validate.middleware";
import {
    forgotPasswordSchema,
    loginUserSchema,
    registerUserSchema,
    changePasswordSchema,
    verifyEmailSchema,
    verifyVerificationSchema,
} from "../schemas/user.schema";
import {
    registerUser,
    loginUser,
    logOut,
    changePassword,
    sendVerificationCode,
    verifyVerificationCode,
    sendForgotPasswordCode,
    verifyForgotPasswordCodeAndUpdatePassword,
    getUsers,
    refresh,
} from "../controllers/user.controller";
import { identifier } from "../middlewares/indentifier.middleware";

const router = Router();

router.get("/user", identifier, getUsers);
router.post("/register", validateRequest(registerUserSchema), registerUser);
router.post("/login", validateRequest(loginUserSchema), loginUser);
router.post("/logout", logOut);
router.patch("/send-verification-code", identifier, validateRequest(verifyEmailSchema), sendVerificationCode);
router.patch("/verify-verification-code", identifier, validateRequest(verifyVerificationSchema), verifyVerificationCode);
router.patch("/change-password/:id", identifier, validateRequest(changePasswordSchema), changePassword);
router.patch("/send-forgot-password-verification-code", validateRequest(verifyEmailSchema), sendForgotPasswordCode);
router.patch("/verify-forgot-password-verification-code", validateRequest(forgotPasswordSchema), verifyForgotPasswordCodeAndUpdatePassword);
router.post("/refresh", refresh);
export default router;
