import { Router } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import programRoutes from "./program.routes";
import favorisRoutes from "./favoris.routes";
import noteRoutes from "./note.routes";
import historyRoutes from "./history.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/programs", programRoutes);
router.use("/favoris", favorisRoutes);
router.use("/notes", noteRoutes);
router.use("/history", historyRoutes);

export default router;
