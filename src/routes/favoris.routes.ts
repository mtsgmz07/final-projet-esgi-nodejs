import { Router } from "express";
import { favorisController } from "../controllers/favoris.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Favoris
 *     description: Manage user favorite programs
 *
 * components:
 *   schemas:
 *     Favori:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         program: { $ref: '#/components/schemas/Program' }
 *         user: { $ref: '#/components/schemas/User' }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

/**
 * @openapi
 * /favoris:
 *   get:
 *     summary: List the authenticated user's favorite programs
 *     tags: [Favoris]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Favori' }
 *       401: { description: Missing or invalid token }
 */
router.get("/", favorisController.list);

/**
 * @openapi
 * /favoris/{programId}:
 *   post:
 *     summary: Add a program to favorites
 *     tags: [Favoris]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Added to favorites
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Favori' }
 *       400: { description: Invalid id }
 *       401: { description: Missing or invalid token }
 *       404: { description: Program not found }
 *       409: { description: Program already in favorites }
 */
router.post("/:programId", favorisController.add);

/**
 * @openapi
 * /favoris/{programId}:
 *   delete:
 *     summary: Remove a program from favorites
 *     tags: [Favoris]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Removed from favorites }
 *       400: { description: Invalid id }
 *       401: { description: Missing or invalid token }
 *       404: { description: Favorite not found }
 */
router.delete("/:programId", favorisController.remove);

export default router;
