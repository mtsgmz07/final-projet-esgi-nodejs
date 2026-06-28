import { Types } from "mongoose";
import { ProgramModel } from "../models/program.model";
import { ExerciceModel } from "../models/exercice.model";
import { ExerciceDto } from "../validators/program.validator";

export type CreateProgramInput = {
    title: string;
    description: string;
    user: string;
    exercices: ExerciceDto[];
};

export type UpdateProgramInput = {
    title?: string;
    exercices?: ExerciceDto[];
};

const programAggregationPipeline = (matchStage: Record<string, unknown>) => [
    { $match: matchStage },
    {
        $lookup: {
            from: "notes",
            localField: "_id",
            foreignField: "program",
            as: "_notes",
        },
    },
    {
        $addFields: {
            notes: { $avg: "$_notes.note" }
        },
    },
    {
        $lookup: {
            from: "exercices",
            localField: "exercices",
            foreignField: "_id",
            as: "exercices",
        },
    },
    {
        $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [
                { $project: { name: 1, lastName: 1 } },
            ],
        },
    },
    {
        $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
        },
    },
    {
        $project: {
            _notes: 0,
            __v: 0,
            "exercices.__v": 0
        },
    },
];

export const programRepository = {
    findAll: () =>
        ProgramModel.aggregate(programAggregationPipeline({})),

    findByCoach: (userId: string) =>
        ProgramModel.aggregate(
            programAggregationPipeline({ user: new Types.ObjectId(userId) })
        ),

    findById: async (id: string) => {
        const results = await ProgramModel.aggregate(
            programAggregationPipeline({ _id: new Types.ObjectId(id) })
        );
        return results[0] ?? null;
    },

    create: async (data: CreateProgramInput) => {
        const createdExercices = await ExerciceModel.insertMany(data.exercices);
        const exerciceIds = createdExercices.map((e) => e._id);
        return ProgramModel.create({ title: data.title, description: data.description, user: data.user, exercices: exerciceIds } as unknown as object);
    },

    update: async (id: string, data: UpdateProgramInput) => {
        const updatePayload: Record<string, unknown> = {};
        if (data.title !== undefined) updatePayload.title = data.title;
        if (data.exercices !== undefined) {
            const createdExercices = await ExerciceModel.insertMany(data.exercices);
            updatePayload.exercices = createdExercices.map((e) => e._id);
        }
        return ProgramModel.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true })
            .populate({
                path: "exercices",
                select: "-__v"
            })
            .select("-__v")
            .lean();
    },

    delete: (id: string) => ProgramModel.findByIdAndDelete(id).lean(),
};
