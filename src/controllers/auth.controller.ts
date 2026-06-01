import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../class/HttpError";
import { LoginDto } from "../validators/auth.validator";

export const authController = {
    login: async (req: Request<unknown, unknown, LoginDto>, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            const user = await userRepository.findByEmail(email);
            if (!user) throw new HttpError(401, "Invalid credentials");

            const match = await bcrypt.compare(password, user.password);
            if (!match) throw new HttpError(401, "Invalid credentials");

            const payload = { sub: user._id, email: user.email, role: user.role };
            const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "7d" });

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({ token });
        } catch (err) {
            next(err);
        }
    },

    logout: (_req: Request, res: Response) => {
        res.clearCookie("token");
        res.status(204).send();
    },
};
