import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { loginSchema } from "../validators/auth.validator";

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
 */

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
