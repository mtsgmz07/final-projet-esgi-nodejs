import { z } from "zod";

export const createNoteSchema = z.object({
    note: z.number().min(0).max(20),
});

export type CreateNoteDto = z.infer<typeof createNoteSchema>;
