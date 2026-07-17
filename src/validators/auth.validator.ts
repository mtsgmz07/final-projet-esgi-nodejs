import { z } from "zod";

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

export const registerSchema = z.object({
    name: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
    weight: z.number().positive(),
    size: z.number().positive(),
    age: z.number().int().positive(),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;

export const passwordResetRequestSchema = z.object({
    email: z.email(),
});

export const verifyResetCodeSchema = z.object({
    email: z.email(),
    code: z.string().regex(/^\d{6}$/, "Code must be a 6-digit number"),
});

export const resetPasswordSchema = z.object({
    new_password: z.string().min(6),
});

export type PasswordResetRequestDto = z.infer<typeof passwordResetRequestSchema>;
export type VerifyResetCodeDto = z.infer<typeof verifyResetCodeSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
