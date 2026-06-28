import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../class/HttpError";
import { LoginDto, RegisterDto } from "../validators/auth.validator";
import { UserRole } from "../interface/user.interface";

const SALT_ROUNDS = 10;

const signToken = (user: { _id: unknown; email: string; role: UserRole }) => {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

const setTokenCookie = (res: Response, token: string) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const authController = {
    register: async (req: Request<unknown, unknown, RegisterDto>, res: Response, next: NextFunction) => {
        try {
            const existing = await userRepository.findByEmail(req.body.email);
            if (existing) throw new HttpError(409, "Email already in use");

            const hashed = await bcrypt.hash(req.body.password, SALT_ROUNDS);
            const user = await userRepository.create({
                ...req.body,
                password: hashed,
                role: UserRole.USER,
            });

            const token = signToken({ _id: user._id, email: user.email, role: user.role });
            setTokenCookie(res, token);

            res.status(201).json({ token });
        } catch (err) {
            next(err);
        }
    },

    login: async (req: Request<unknown, unknown, LoginDto>, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            const user = await userRepository.findByEmail(email);
            if (!user) throw new HttpError(401, "Invalid credentials");

            const match = await bcrypt.compare(password, user.password);
            if (!match) throw new HttpError(401, "Invalid credentials");

            const token = signToken({ _id: user._id, email: user.email, role: user.role });
            setTokenCookie(res, token);

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
