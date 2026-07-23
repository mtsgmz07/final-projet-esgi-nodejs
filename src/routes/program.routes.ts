import { Router } from "express";
import { programController } from "../controllers/program.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { createProgramSchema, updateProgramSchema, uploadExerciceImagesSchema } from "../validators/program.validator";
import { stopHistorySchema } from "../validators/history.validator";
import { UserRole } from "../interface/user.interface";
import { imageUpload } from "../utils/upload";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Programs
 *     description: Program CRUD endpoints
 *
 * components:
 *   schemas:
 *     ExerciceInput:
 *       type: object
 *       required: [title, description, time]
 *       properties:
 *         title: { type: string, example: "Squat" }
 *         description: { type: string, example: "Lower body compound movement" }
 *         time: { type: integer, description: "Durée en millisecondes (max 25 min = 1500000)", example: 900000 }
 *     ExerciceOutput:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         description: { type: string }
 *         time: { type: integer, description: "Durée en millisecondes (max 25 min = 1500000)", example: 900000 }
 *         imageUrl: { type: string, nullable: true, example: "http://localhost:3000/uploads/7f2c1a4e-....png" }
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
 *         totalTime: { type: integer, description: "Durée totale du programme en millisecondes (somme des durées des exercices)", example: 4500000 }
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
 *               time: 900000
 *             - title: "Bench Press"
 *               description: "Upper body push movement, 4 sets of 8 reps"
 *               time: 720000
 *             - title: "Deadlift"
 *               description: "Full body pull movement, 3 sets of 5 reps"
 *               time: 1200000
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
 *               time: 840000
 *     History:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         userId: { type: string }
 *         programId: { type: string }
 *         start: { type: string, format: date-time }
 *         end: { type: string, format: date-time, nullable: true }
 *         weight: { type: number, nullable: true, example: 82.5 }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     StopHistoryInput:
 *       type: object
 *       required: [weight]
 *       properties:
 *         weight: { type: number, example: 82.5 }
 *     UploadExerciceImagesInput:
 *       type: object
 *       required: [programId, exerciceIds, images]
 *       properties:
 *         programId:
 *           type: string
 *           example: "665f1c2ab7e4d21a3c9f0e11"
 *         exerciceIds:
 *           type: array
 *           minItems: 1
 *           description: Exercice ids, paired by index with the uploaded images
 *           items: { type: string, example: "665f1c2ab7e4d21a3c9f0e12" }
 *         images:
 *           type: array
 *           minItems: 1
 *           description: Image files (png, jpeg, webp or gif — max 10 MB each), paired by index with exerciceIds
 *           items: { type: string, format: binary }
 */

/**
 * @openapi
 * /programs:
 *   get:
 *     summary: List programs
 *     tags: [Programs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema: { type: string }
 *         description: Filter programs whose title contains this text (case-insensitive)
 *       - in: query
 *         name: sortByRating
 *         required: false
 *         schema: { type: boolean, default: false }
 *         description: When true, sort programs by best average note first
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
router.post("/", requireRole(UserRole.COACH, UserRole.ADMIN), validateBody(createProgramSchema), programController.create);

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
router.patch("/:id", requireRole(UserRole.COACH, UserRole.ADMIN), validateBody(updateProgramSchema), programController.update);

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
router.delete("/:id", requireRole(UserRole.COACH, UserRole.ADMIN), programController.remove);

/**
 * @openapi
 * /programs/exercices/images:
 *   post:
 *     summary: Upload images for exercises of a program (owner COACH or ADMIN)
 *     description: Uploads image files to local storage and sets the resulting HTTP link as `imageUrl` on each targeted exercise. Files are paired with exercice ids by index.
 *     tags: [Programs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema: { $ref: '#/components/schemas/UploadExerciceImagesInput' }
 *     responses:
 *       200:
 *         description: Program with updated exercise image URLs
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Program' }
 *       400: { description: Validation error, invalid image or exercice not in program }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden — not owner or ADMIN }
 *       404: { description: Program not found }
 */
router.post(
    "/exercices/images",
    requireRole(UserRole.COACH, UserRole.ADMIN),
    imageUpload.array("images"),
    validateBody(uploadExerciceImagesSchema),
    programController.uploadExerciceImages
);

/**
 * @openapi
 * /programs/{id}/start:
 *   post:
 *     summary: Start a training session for a program
 *     tags: [Programs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Training session started
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/History' }
 *       400: { description: Invalid id }
 *       401: { description: Missing or invalid token }
 *       404: { description: Program not found }
 *       409: { description: A training session is already in progress }
 */
router.post("/:id/start", programController.startTraining);

/**
 * @openapi
 * /programs/{id}/stop:
 *   post:
 *     summary: Stop the ongoing training session for a program
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
 *           schema: { $ref: '#/components/schemas/StopHistoryInput' }
 *     responses:
 *       200:
 *         description: Training session stopped
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/History' }
 *       400: { description: Invalid id or missing weight }
 *       401: { description: Missing or invalid token }
 *       404: { description: No training session in progress }
 *       409: { description: No active training session for this program }
 */
router.post("/:id/stop", validateBody(stopHistorySchema), programController.stopTraining);

export default router;
