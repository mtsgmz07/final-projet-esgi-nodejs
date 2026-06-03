import { z } from "zod";

export const createNoteSchema = z.object({
    note: z.string().min(1),
});

export type CreateNoteDto = z.infer<typeof createNoteSchema>;
