import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { noteController } from "../controllers/note.controller";
import { createNoteSchema } from "../validators/note.validator";
import { UserRole } from "../interface/user.interface";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Notes
 *     description: Rate programs (USER and ADMIN only)
 *
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         note: { type: string }
 *         user:
 *           type: object
 *           properties:
 *             name: { type: string }
 *             lastName: { type: string }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CreateNoteBody:
 *       type: object
 *       required: [note]
 *       properties:
 *         note: { type: string, example: "Great program!" }
 */

/**
 * @openapi
 * /notes/{programId}:
 *   get:
 *     summary: Get all notes for a program
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Note' }
 *       400: { description: Invalid program id }
 *       401: { description: Missing or invalid token }
 */
router.get("/:programId", noteController.listByProgram);

/**
 * @openapi
 * /notes/{programId}:
 *   post:
 *     summary: Add a note to a program (USER and ADMIN only)
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateNoteBody' }
 *     responses:
 *       201:
 *         description: Note created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Note' }
 *       400: { description: Invalid program id or missing field }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden – COACH role cannot rate programs }
 *       404: { description: Program not found }
 *       409: { description: You have already rated this program }
 */
router.post(
    "/:programId",
    requireRole(UserRole.USER, UserRole.ADMIN),
    validateBody(createNoteSchema),
    noteController.create
);

/**
 * @openapi
 * /notes/{noteId}:
 *   delete:
 *     summary: Delete a note (owner or ADMIN only)
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Note deleted }
 *       400: { description: Invalid note id }
 *       401: { description: Missing or invalid token }
 *       403: { description: Forbidden – not the note owner }
 *       404: { description: Note not found }
 */
router.delete(
    "/:noteId",
    requireRole(UserRole.USER, UserRole.ADMIN),
    noteController.delete
);

export default router;
