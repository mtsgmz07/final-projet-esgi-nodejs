import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";

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

export default router;
