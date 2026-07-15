import { z } from "zod";

export const stopHistorySchema = z.object({
    weight: z.number().positive(),
});

export type StopHistoryDto = z.infer<typeof stopHistorySchema>;
