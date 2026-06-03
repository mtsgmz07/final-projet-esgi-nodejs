import { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { HttpError } from "../class/HttpError";
import { programRepository } from "../repositories/program.repository";
import { noteRepository } from "../repositories/note.repository";
import { UserRole } from "../interface/user.interface";
import { Program } from "../interface/program.interface";

export const noteController = {
    listByProgram: async (req: Request<{ programId: string }>, res: Response, next: NextFunction) => {
        try {
            if (!isValidObjectId(req.params.programId)) {
                return next(new HttpError(400, "Invalid program id"));
            }
            const notes = await noteRepository.findByProgram(req.params.programId);
            res.json(notes);
        } catch (err) {
            next(err);
        }
    },

    create: async (req: Request<{ programId: string }>, res: Response, next: NextFunction) => {
        try {
            if (!isValidObjectId(req.params.programId)) {
                return next(new HttpError(400, "Invalid program id"));
            }
            const program = await programRepository.findById(req.params.programId);
            if (!program) {
                return next(new HttpError(404, "Program not found"));
            }
            const existing = await noteRepository.findByUserAndProgram(req.user!.sub, req.params.programId);
            if (existing) {
                return next(new HttpError(409, "You have already rated this program"));
            }
            const note = await noteRepository.create(req.user!.sub, req.params.programId, req.body.note);
            res.status(201).json(note);
        } catch (err) {
            next(err);
        }
    },

    delete: async (req: Request<{ noteId: string }>, res: Response, next: NextFunction) => {
        try {
            if (!isValidObjectId(req.params.noteId)) {
                return next(new HttpError(400, "Invalid note id"));
            }
            const note = await noteRepository.findById(req.params.noteId);
            if (!note) {
                return next(new HttpError(404, "Note not found"));
            }
            const isOwner = note.user.toString() === req.user!.sub;
            if (!isOwner && req.user!.role !== UserRole.ADMIN) {
                return next(new HttpError(403, "Forbidden"));
            }
            await noteRepository.delete(req.params.noteId);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
