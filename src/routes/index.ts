import { Router } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import programRoutes from "./program.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/programs", programRoutes);

export default router;
