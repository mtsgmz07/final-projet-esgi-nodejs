import { Router } from "express";
import { programController } from "../controllers/program.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { createProgramSchema, updateProgramSchema } from "../validators/program.validator";
import { UserRole } from "../interface/user.interface";

const router = Router();

router.use(authenticate, requireRole(UserRole.COACH, UserRole.ADMIN));

/**
 * @openapi
 * tags:
 *   - name: Programs
 *     description: Program CRUD endpoints (COACH creates/manages own, ADMIN sees all)
 *
 * components:
 *   schemas:
 *     ExerciceInput:
 *       type: object
 *       required: [title, description, time]
 *       properties:
 *         title: { type: string, example: "Squat" }
 *         description: { type: string, example: "Lower body compound movement" }
 *         time: { type: string, format: date-time, example: "2024-01-01T00:30:00.000Z" }
 *     ExerciceOutput:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         description: { type: string }
 *         time: { type: string, format: date-time }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     Program:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         user: { $ref: '#/components/schemas/User' }
 *         exercices:
 *           type: array
 *           items: { $ref: '#/components/schemas/ExerciceOutput' }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CreateProgramInput:
 *       type: object
 *       required: [title, description, exercices]
 *       properties:
 *         title: { type: string, example: "Full Body Strength" }
 *         description: { type: string, example: "A comprehensive full-body strength training program" }
 *         exercices:
 *           type: array
 *           minItems: 1
 *           items: { $ref: '#/components/schemas/ExerciceInput' }
 *           example:
 *             - title: "Squat"
 *               description: "Lower body compound movement, 4 sets of 10 reps"
 *               time: "2024-01-01T00:30:00.000Z"
 *             - title: "Bench Press"
 *               description: "Upper body push movement, 4 sets of 8 reps"
 *               time: "2024-01-01T00:20:00.000Z"
 *             - title: "Deadlift"
 *               description: "Full body pull movement, 3 sets of 5 reps"
 *               time: "2024-01-01T00:40:00.000Z"
 *     UpdateProgramInput:
 *       type: object
 *       properties:
 *         title: { type: string, example: "Full Body Strength v2" }
 *         exercices:
 *           type: array
 *           minItems: 1
 *           items: { $ref: '#/components/schemas/ExerciceInput' }
 *           example:
 *             - title: "Pull Up"
 *               description: "Back and biceps compound movement, 4 sets of 8 reps"
 *               time: "2024-01-01T00:25:00.000Z"
 */

/**
 * @openapi
 * /programs:
 *   get:
 *     summary: List programs (COACH sees own, ADMIN sees all)
 *     tags: [Programs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of programs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Program' }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden — COACH or ADMIN role required }
 */
router.get("/", programController.list);

/**
 * @openapi
 * /programs/{id}:
 *   get:
 *     summary: Get a program by id
 *     tags: [Programs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The program
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Program' }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden — not owner or ADMIN }
 *       404: { description: Program not found }
 */
router.get("/:id", programController.get);

/**
 * @openapi
 * /programs:
 *   post:
 *     summary: Create a program (COACH only, linked to self)
 *     tags: [Programs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateProgramInput' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Program' }
 *       400: { description: Validation error }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden — COACH or ADMIN role required }
 */
router.post("/", validateBody(createProgramSchema), programController.create);

/**
 * @openapi
 * /programs/{id}:
 *   patch:
 *     summary: Update a program (owner COACH or ADMIN)
 *     tags: [Programs]
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
 *           schema: { $ref: '#/components/schemas/UpdateProgramInput' }
 *     responses:
 *       200:
 *         description: Updated program
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Program' }
 *       400: { description: Validation error }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden — not owner or ADMIN }
 *       404: { description: Program not found }
 */
router.patch("/:id", validateBody(updateProgramSchema), programController.update);

/**
 * @openapi
 * /programs/{id}:
 *   delete:
 *     summary: Delete a program (owner COACH or ADMIN)
 *     tags: [Programs]
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
 *       403: { description: Forbidden — not owner or ADMIN }
 *       404: { description: Program not found }
 */
router.delete("/:id", programController.remove);

export default router;
