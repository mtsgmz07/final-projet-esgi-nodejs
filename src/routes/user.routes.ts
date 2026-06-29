import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { createUserSchema, updateUserSchema, updateProfileSchema } from "../validators/user.validator";
import { UserRole } from "../interface/user.interface";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateProfileInput:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         lastName: { type: string }
 *         weight: { type: number }
 *         size: { type: number }
 *         age: { type: integer }
 */

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The current user's profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401: { description: Missing or invalid token }
 *       404: { description: User not found }
 */
router.get("/me", authenticate, userController.getMe);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     summary: Update the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateProfileInput' }
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Validation error }
 *       401: { description: Missing or invalid token }
 *       404: { description: User not found }
 */
router.patch("/me", authenticate, validateBody(updateProfileSchema), userController.updateMe);

router.use(authenticate, requireRole(UserRole.ADMIN));

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: User CRUD endpoints
 *
 * components:
 *   schemas:
 *     UserRole:
 *       type: string
 *       enum: [USER, COACH, ADMIN]
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         lastName: { type: string }
 *         email: { type: string, format: email }
 *         role: { $ref: '#/components/schemas/UserRole' }
 *         weight: { type: number }
 *         size: { type: number }
 *         age: { type: integer }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CreateUserInput:
 *       type: object
 *       required: [name, lastName, email, password, role, weight, size, age]
 *       properties:
 *         name: { type: string, example: John }
 *         lastName: { type: string, example: Doe }
 *         email: { type: string, format: email, example: john@example.com }
 *         password: { type: string, minLength: 6, example: secret123 }
 *         role: { $ref: '#/components/schemas/UserRole' }
 *         weight: { type: number, example: 75 }
 *         size: { type: number, example: 180 }
 *         age: { type: integer, example: 30 }
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         lastName: { type: string }
 *         email: { type: string, format: email }
 *         password: { type: string, minLength: 6 }
 *         role: { $ref: '#/components/schemas/UserRole' }
 *         weight: { type: number }
 *         size: { type: number }
 *         age: { type: integer }
 */

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema: { type: string }
 *         description: Case-insensitive search on name, lastName and email
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden — SUPER_ADMIN role required }
 */
router.get("/", userController.list);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user by id
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden — SUPER_ADMIN role required }
 *       404: { description: User not found }
 */
router.get("/:id", userController.get);

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateUserInput' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Validation error }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden — SUPER_ADMIN role required }
 *       409: { description: Email already in use }
 */
router.post("/", validateBody(createUserSchema), userController.create);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateUserInput' }
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden — SUPER_ADMIN role required }
 *       404: { description: User not found }
 */
router.patch("/:id", validateBody(updateUserSchema), userController.update);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden — SUPER_ADMIN role required }
 *       404: { description: User not found }
 */
router.delete("/:id", userController.remove);

export default router;
