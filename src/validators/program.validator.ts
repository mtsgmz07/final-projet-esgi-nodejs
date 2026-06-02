import { z } from "zod";

export const exerciceSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    time: z.coerce.date(),
});

export const createProgramSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    exercices: z.array(exerciceSchema).min(1, "At least one exercise is required"),
});

export const updateProgramSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    exercices: z.array(exerciceSchema).min(1, "At least one exercise is required").optional(),
});

export type ExerciceDto = z.infer<typeof exerciceSchema>;
export type CreateProgramDto = z.infer<typeof createProgramSchema>;
export type UpdateProgramDto = z.infer<typeof updateProgramSchema>;
