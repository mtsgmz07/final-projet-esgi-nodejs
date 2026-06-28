import { z } from "zod";
import { UserRole } from "../interface/user.interface";

export const createUserSchema = z.object({
    name: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
    role: z.enum(UserRole),
    weight: z.number().positive(),
    size: z.number().positive(),
    age: z.number().int().positive(),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
