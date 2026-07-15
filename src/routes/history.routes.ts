import { Router } from "express";
import { historyController } from "../controllers/history.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: History
 *     description: Consult training history
 *
 * components:
 *   schemas:
 *     HistoryEntry:
 *       type: object
 *       properties:
 *         programName: { type: string, example: "Full Body Strength" }
 *         programDescription: { type: string, example: "A comprehensive full-body strength training program" }
 *         duration: { type: string, example: "1 heure, 30 minutes" }
 *         date: { type: string, example: "16/07/2026" }
 */

/**
 * @openapi
 * /history:
 *   get:
 *     summary: Get the authenticated user's training history
 *     tags: [History]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of training sessions, most recent first
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/HistoryEntry' }
 *       401: { description: Missing or invalid token }
 */
router.get("/", historyController.listMine);

export default router;
