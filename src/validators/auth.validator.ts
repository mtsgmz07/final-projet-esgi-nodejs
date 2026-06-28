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
