import { Request, Response, NextFunction } from "express";
import { historyRepository } from "../repositories/history.repository";

const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
};

const formatDuration = (start: Date, end: Date | null): string => {
    if (!end) return "En cours";

    const totalMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    if (minutes === 0) return `${hours} heure${hours > 1 ? "s" : ""}`;
    return `${hours} heure${hours > 1 ? "s" : ""}, ${minutes} minute${minutes > 1 ? "s" : ""}`;
};

export const historyController = {
    listMine: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const histories = await historyRepository.findByUser(req.user!.sub);
            const result = histories.map((history) => {
                const program = history.programId as unknown as { title: string; description: string; };
                return {
                    programName: program.title,
                    programDescription: program.description,
                    duration: formatDuration(history.start, history.end),
                    date: formatDate(history.start),
                    weight: history.weight,
                };
            });

            res.json(result);
        } catch (err) {
            next(err);
        }
    },
};
