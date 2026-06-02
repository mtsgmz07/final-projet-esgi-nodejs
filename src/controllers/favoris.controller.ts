import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import { favorisRepository } from "../repositories/favoris.repository";
import { programRepository } from "../repositories/program.repository";
import { HttpError } from "../class/HttpError";

const ensureValidId = (id: string) => {
    if (!isValidObjectId(id)) throw new HttpError(400, "Invalid id");
};

export const favorisController = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const favoris = await favorisRepository.findByUser(req.user!.sub);
            res.json(favoris);
        } catch (err) {
            next(err);
        }
    },

    add: async (req: Request<{ programId: string }>, res: Response, next: NextFunction) => {
        try {
            ensureValidId(req.params.programId);

            const program = await programRepository.findById(req.params.programId);
            if (!program) throw new HttpError(404, "Program not found");

            const existing = await favorisRepository.findByUserAndProgram(req.user!.sub, req.params.programId);
            if (existing) throw new HttpError(409, "Program already in favorites");

            const favori = await favorisRepository.create(req.user!.sub, req.params.programId);
            res.status(201).json(favori);
        } catch (err) {
            next(err);
        }
    },

    remove: async (req: Request<{ programId: string }>, res: Response, next: NextFunction) => {
        try {
            ensureValidId(req.params.programId);

            const deleted = await favorisRepository.delete(req.user!.sub, req.params.programId);
            if (!deleted) throw new HttpError(404, "Favorite not found");

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
