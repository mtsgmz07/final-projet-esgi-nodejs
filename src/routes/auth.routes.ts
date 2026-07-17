import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate.middleware";
import {
    loginSchema,
    passwordResetRequestSchema,
    registerSchema,
    resetPasswordSchema,
    verifyResetCodeSchema,
} from "../validators/auth.validator";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 *
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email, example: john@example.com }
 *         password: { type: string, example: secret123 }
 *     RegisterInput:
 *       type: object
 *       required: [name, lastName, email, password, weight, size, age]
 *       properties:
 *         name: { type: string, example: John }
 *         lastName: { type: string, example: Doe }
 *         email: { type: string, format: email, example: john@example.com }
 *         password: { type: string, minLength: 6, example: secret123 }
 *         weight: { type: number, example: 75 }
 *         size: { type: number, example: 180 }
 *         age: { type: integer, example: 30 }
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterInput' }
 *     responses:
 *       201:
 *         description: Registration successful — JWT set in httpOnly cookie and returned in body
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=<jwt>; HttpOnly; SameSite=Strict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT — copy this value and use the Authorize button (Bearer) in Swagger
 *       400: { description: Validation error }
 *       409: { description: Email already in use }
 */
router.post("/register", validateBody(registerSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT cookie
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginInput' }
 *     responses:
 *       200:
 *         description: Login successful — JWT set in httpOnly cookie and returned in body
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=<jwt>; HttpOnly; SameSite=Strict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT — copy this value and use the Authorize button (Bearer) in Swagger
 *       401: { description: Invalid credentials }
 */
router.post("/login", validateBody(loginSchema), authController.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout and clear the JWT cookie
 *     tags: [Auth]
 *     responses:
 *       204: { description: Logged out }
 */
router.post("/logout", authController.logout);

/**
 * @openapi
 * components:
 *   schemas:
 *     PasswordResetRequestInput:
 *       type: object
 *       required: [email]
 *       properties:
 *         email: { type: string, format: email, example: john@example.com }
 *     VerifyResetCodeInput:
 *       type: object
 *       required: [email, code]
 *       properties:
 *         email: { type: string, format: email, example: john@example.com }
 *         code: { type: string, example: "123456" }
 *     ResetPasswordInput:
 *       type: object
 *       required: [new_password]
 *       properties:
 *         new_password: { type: string, minLength: 6, example: newSecret123 }
 */

/**
 * @openapi
 * /auth/password/reset-request:
 *   post:
 *     summary: Request a password reset code by email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PasswordResetRequestInput' }
 *     responses:
 *       200:
 *         description: Generic confirmation, always returned regardless of whether the account exists
 *       400: { description: Validation error }
 */
router.post(
    "/password/reset-request",
    validateBody(passwordResetRequestSchema),
    authController.requestPasswordReset
);

/**
 * @openapi
 * /auth/password/verify-code:
 *   post:
 *     summary: Verify a password reset code and receive a short-lived reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VerifyResetCodeInput' }
 *     responses:
 *       200:
 *         description: Code valid — returns a reset_token valid for 3 minutes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reset_token: { type: string }
 *       400: { description: Invalid or expired code }
 *       429: { description: Too many failed attempts, temporarily blocked }
 */
router.post(
    "/password/verify-code",
    validateBody(verifyResetCodeSchema),
    authController.verifyPasswordResetCode
);

/**
 * @openapi
 * /auth/password/reset:
 *   post:
 *     summary: Reset the password using a reset_token obtained from verify-code
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ResetPasswordInput' }
 *     responses:
 *       200: { description: Password reset successfully, all active sessions revoked }
 *       401: { description: Missing, invalid or expired reset token }
 */
router.post("/password/reset", validateBody(resetPasswordSchema), authController.resetPassword);

export default router;
