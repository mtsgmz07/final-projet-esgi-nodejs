import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import { programRepository } from "../repositories/program.repository";
import { HttpError } from "../class/HttpError";
import { CreateProgramDto, UpdateProgramDto } from "../validators/program.validator";
import { UserRole } from "../interface/user.interface";

const ensureValidId = (id: string) => {
    if (!isValidObjectId(id)) throw new HttpError(400, "Invalid id");
};

export const programController = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const programs =
                req.user!.role === UserRole.ADMIN
                    ? await programRepository.findAll()
                    : await programRepository.findByCoach(req.user!.sub);
            res.json(programs);
        } catch (err) {
            next(err);
        }
    },

    get: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            ensureValidId(req.params.id);
            const program = await programRepository.findById(req.params.id);
            if (!program) throw new HttpError(404, "Program not found");

            const owner = (program.user as unknown as { _id: { toString(): string } })._id.toString();
            if (req.user!.role !== UserRole.ADMIN && owner !== req.user!.sub) {
                throw new HttpError(403, "Forbidden");
            }

            res.json(program);
        } catch (err) {
            next(err);
        }
    },

    create: async (req: Request<unknown, unknown, CreateProgramDto>, res: Response, next: NextFunction) => {
        try {
            const program = await programRepository.create({
                title: req.body.title,
                exercices: req.body.exercices,
                user: req.user!.sub,
            });
            res.status(201).json(program);
        } catch (err) {
            next(err);
        }
    },

    update: async (req: Request<{ id: string }, unknown, UpdateProgramDto>, res: Response, next: NextFunction) => {
        try {
            ensureValidId(req.params.id);
            const existing = await programRepository.findById(req.params.id);
            if (!existing) throw new HttpError(404, "Program not found");

            const owner = (existing.user as unknown as { _id: { toString(): string } })._id.toString();
            if (req.user!.role !== UserRole.ADMIN && owner !== req.user!.sub) {
                throw new HttpError(403, "Forbidden");
            }

            const program = await programRepository.update(req.params.id, req.body);
            res.json(program);
        } catch (err) {
            next(err);
        }
    },

    remove: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            ensureValidId(req.params.id);
            const existing = await programRepository.findById(req.params.id);
            if (!existing) throw new HttpError(404, "Program not found");

            const owner = (existing.user as unknown as { _id: { toString(): string } })._id.toString();
            if (req.user!.role !== UserRole.ADMIN && owner !== req.user!.sub) {
                throw new HttpError(403, "Forbidden");
            }

            await programRepository.delete(req.params.id);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
