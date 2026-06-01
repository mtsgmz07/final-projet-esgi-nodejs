import { ProgramModel } from "../models/program.model";
import { ExerciceModel } from "../models/exercice.model";
import { ExerciceDto } from "../validators/program.validator";

export type CreateProgramInput = {
    title: string;
    user: string;
    exercices: ExerciceDto[];
};

export type UpdateProgramInput = {
    title?: string;
    exercices?: ExerciceDto[];
};

export const programRepository = {
    findAll: () =>
        ProgramModel.find().populate("user", "-password").populate("exercices").lean(),

    findByCoach: (userId: string) =>
        ProgramModel.find({ user: userId as unknown as object }).populate("user", "-password").populate("exercices").lean(),

    findById: (id: string) =>
        ProgramModel.findById(id).populate("user", "-password").populate("exercices").lean(),

    create: async (data: CreateProgramInput) => {
        const createdExercices = await ExerciceModel.insertMany(data.exercices);
        const exerciceIds = createdExercices.map((e) => e._id);
        return ProgramModel.create({ title: data.title, user: data.user, exercices: exerciceIds } as unknown as object);
    },

    update: async (id: string, data: UpdateProgramInput) => {
        const updatePayload: Record<string, unknown> = {};
        if (data.title !== undefined) updatePayload.title = data.title;
        if (data.exercices !== undefined) {
            const createdExercices = await ExerciceModel.insertMany(data.exercices);
            updatePayload.exercices = createdExercices.map((e) => e._id);
        }
        return ProgramModel.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true })
            .populate("user", "-password")
            .populate("exercices")
            .lean();
    },

    delete: (id: string) => ProgramModel.findByIdAndDelete(id).lean(),
};
