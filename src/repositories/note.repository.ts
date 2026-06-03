import { NoteModel } from "../models/note.model";

export const noteRepository = {
    findByProgram: (programId: string) =>
        NoteModel.find({ program: programId })
            .populate({ path: "user", select: "name lastName -_id" })
            .select("-__v -program")
            .lean(),

    findByUserAndProgram: (userId: string, programId: string) =>
        NoteModel.findOne({
            user: userId,
            program: programId,
        }).lean(),

    findById: (id: string) =>
        NoteModel.findById(id).lean(),

    create: (userId: string, programId: string, note: string) =>
        NoteModel.create({ user: userId, program: programId, note }),

    delete: (id: string) =>
        NoteModel.findByIdAndDelete(id).lean(),
};
