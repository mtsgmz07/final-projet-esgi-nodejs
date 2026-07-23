import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../class/HttpError";
import { LoginDto, PasswordResetRequestDto, RegisterDto, ResetPasswordDto, VerifyResetCodeDto } from "../validators/auth.validator";
import { UserRole } from "../interface/user.interface";
import { mailer } from "../utils/mailer";
import { otpRepository, resetTokenRepository } from "../utils/password-reset.store";

const SALT_ROUNDS = 10;

const generateOtp = (): string => randomInt(0, 1_000_000).toString().padStart(6, "0");

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
            await mailer.sendRegister(user.email);
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
            await mailer.sendNewLogin(email);
        } catch (err) {
            next(err);
        }
    },

    logout: (_req: Request, res: Response) => {
        res.clearCookie("token");
        res.status(204).send();
    },

    requestPasswordReset: async (req: Request<unknown, unknown, PasswordResetRequestDto>, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            const user = await userRepository.findByEmail(email);

            if (user) {
                const otp = generateOtp();
                const hash = await bcrypt.hash(otp, SALT_ROUNDS);
                otpRepository.set(email, hash);
                await mailer.sendPasswordResetOtp(email, otp);
            }

            res.status(200).json({ message: "ok" });
        } catch (err) {
            next(err);
        }
    },

    verifyPasswordResetCode: async (req: Request<unknown, unknown, VerifyResetCodeDto>, res: Response, next: NextFunction) => {
        try {
            const { email, code } = req.body;
            const entry = otpRepository.get(email);
            console.log(entry);

            if (!entry) throw new HttpError(400, "Invalid or expired code");

            if (entry.blockedUntil && entry.blockedUntil > Date.now()) {
                throw new HttpError(429, "Too many attempts, please try again later");
            }

            if (entry.expiresAt < Date.now()) {
                otpRepository.clear(email);
                throw new HttpError(400, "Invalid or expired code");
            }

            const match = await bcrypt.compare(code, entry.hash);
            if (!match) {
                otpRepository.registerFailedAttempt(email);
                throw new HttpError(400, "Invalid or expired code");
            }

            const user = await userRepository.findByEmail(email);
            if (!user) throw new HttpError(400, "Invalid or expired code");

            otpRepository.clear(email);
            const resetToken = resetTokenRepository.create(String(user._id), email);

            res.status(200).json({ reset_token: resetToken });
        } catch (err) {
            next(err);
        }
    },

    resetPassword: async (req: Request<unknown, unknown, ResetPasswordDto>, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith("Bearer ")) {
                throw new HttpError(401, "Missing reset token");
            }
            const resetToken = authHeader.slice(7);

            const entry = resetTokenRepository.consume(resetToken);
            if (!entry) throw new HttpError(401, "Invalid or expired reset token");

            const hashed = await bcrypt.hash(req.body.new_password, SALT_ROUNDS);
            await userRepository.updatePassword(entry.userId, hashed);

            res.status(200).json({ message: "Password has been reset successfully." });
        } catch (err) {
            next(err);
        }
    },
};
