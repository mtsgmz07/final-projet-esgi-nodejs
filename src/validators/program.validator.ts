import { z } from "zod";

export const exerciceSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    // Durée en millisecondes, max 25 min (1 500 000 ms)
    time: z.coerce
        .number()
        .int()
        .min(1, "time must be a positive duration in milliseconds")
        .max(25 * 60 * 1000, "time cannot exceed 25 minutes (1500000 ms)"),
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

export const listProgramsQuerySchema = z.object({
    search: z.string().min(1).optional(),
    sortByRating: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
});

export const uploadExerciceImagesSchema = z.object({
    programId: z.string().min(1),
    // multipart/form-data sends a single string when only one value is provided
    exerciceIds: z.preprocess(
        (value) => (typeof value === "string" ? [value] : value),
        z.array(z.string().min(1)).min(1, "At least one exercice id is required")
    ),
});

export type ExerciceDto = z.infer<typeof exerciceSchema>;
export type ListProgramsQueryDto = z.infer<typeof listProgramsQuerySchema>;
export type CreateProgramDto = z.infer<typeof createProgramSchema>;
export type UpdateProgramDto = z.infer<typeof updateProgramSchema>;
export type UploadExerciceImagesDto = z.infer<typeof uploadExerciceImagesSchema>;
