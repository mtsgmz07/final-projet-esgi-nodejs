import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import { programRepository } from "../repositories/program.repository";
import { historyRepository } from "../repositories/history.repository";
import { HttpError } from "../class/HttpError";
import { CreateProgramDto, UpdateProgramDto, UploadExerciceImagesDto, listProgramsQuerySchema } from "../validators/program.validator";
import { StopHistoryDto } from "../validators/history.validator";
import { UserRole } from "../interface/user.interface";
import { mapProtocolAndHostExercices, saveImageBuffer } from "../utils/upload";

const ensureValidId = (id: string) => {
    if (!isValidObjectId(id)) throw new HttpError(400, "Invalid id");
};

export const programController = {
    list: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = listProgramsQuerySchema.safeParse(req.query);
            if (!parsed.success) {
                const message = parsed.error.issues
                    .map((i) => `${i.path.join(".")}: ${i.message}`)
                    .join("; ");
                throw new HttpError(400, message);
            }

            const programs =
                req.user!.role !== UserRole.COACH
                    ? await programRepository.findAll(parsed.data)
                    : await programRepository.findByCoach(req.user!.sub, parsed.data);
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
            res.json(mapProtocolAndHostExercices(req, program));
        } catch (err) {
            next(err);
        }
    },

    create: async (req: Request<unknown, unknown, CreateProgramDto>, res: Response, next: NextFunction) => {
        try {
            const program = await programRepository.create({
                title: req.body.title,
                description: req.body.description,
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

    uploadExerciceImages: async (req: Request<unknown, unknown, UploadExerciceImagesDto>, res: Response, next: NextFunction) => {
        try {
            const { programId, exerciceIds } = req.body;
            const files = (req.files ?? []) as Express.Multer.File[];

            ensureValidId(programId);
            exerciceIds.forEach(ensureValidId);

            if (files.length === 0) throw new HttpError(400, "At least one image file is required");
            if (files.length !== exerciceIds.length) {
                throw new HttpError(400, "The number of images must match the number of exercice ids");
            }

            const program = await programRepository.findById(programId);
            if (!program) throw new HttpError(404, "Program not found");

            const owner = (program.user as unknown as { _id: { toString(): string } })._id.toString();
            if (req.user!.role !== UserRole.ADMIN && owner !== req.user!.sub) {
                throw new HttpError(403, "Forbidden");
            }

            const programExerciceIds = new Set(
                (program.exercices as unknown as { _id: { toString(): string } }[]).map((e) => e._id.toString())
            );
            for (const exerciceId of exerciceIds) {
                if (!programExerciceIds.has(exerciceId)) {
                    throw new HttpError(400, `Exercice ${exerciceId} does not belong to this program`);
                }
            }

            const updates = exerciceIds.map((exerciceId, index) => {
                const filename = saveImageBuffer(files[index]);
                const imageUrl = `/uploads/${filename}`;
                return { exerciceId, imageUrl };
            });

            await programRepository.setExerciceImages(updates);

            const updated = await programRepository.findById(programId);
            res.json(updated);
        } catch (err) {
            next(err);
        }
    },

    startTraining: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            ensureValidId(req.params.id);

            const program = await programRepository.findById(req.params.id);
            if (!program) throw new HttpError(404, "Program not found");

            const active = await historyRepository.findActiveByUser(req.user!.sub);
            if (active) throw new HttpError(409, "A training session is already in progress");

            const history = await historyRepository.start(req.user!.sub, req.params.id);
            res.status(201).json(history);
        } catch (err) {
            next(err);
        }
    },

    stopTraining: async (req: Request<{ id: string }, unknown, StopHistoryDto>, res: Response, next: NextFunction) => {
        try {
            ensureValidId(req.params.id);

            const active = await historyRepository.findActiveByUser(req.user!.sub);
            if (!active) throw new HttpError(404, "No training session in progress");

            const activeProgramId = (active.programId as unknown as { toString(): string }).toString();
            if (activeProgramId !== req.params.id) {
                throw new HttpError(409, "No active training session for this program");
            }

            const history = await historyRepository.stop(active._id!.toString(), req.body.weight);
            res.json(history);
        } catch (err) {
            next(err);
        }
    },
};
