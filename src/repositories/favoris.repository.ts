import { Types } from "mongoose";
import { FavorisModel } from "../models/favoris.model";
import { programEnrichmentStages } from "./program.repository";

export const favorisRepository = {
    findByUser: (userId: string) =>
        FavorisModel.aggregate([
            { $match: { user: new Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: "programs",
                    localField: "program",
                    foreignField: "_id",
                    as: "program",
                    pipeline: programEnrichmentStages(),
                },
            },
            { $addFields: { program: { $arrayElemAt: ["$program", 0] } } },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [{ $project: { name: 1, lastName: 1 } }],
                },
            },
            { $addFields: { user: { $arrayElemAt: ["$user", 0] } } },
        ]),

    findByUserAndProgram: (userId: string, programId: string) =>
        FavorisModel.findOne({
            user: userId as unknown as object,
            program: programId as unknown as object,
        }).lean(),

    create: (userId: string, programId: string) =>
        FavorisModel.create({ user: userId, program: programId } as unknown as object),

    delete: (userId: string, programId: string) =>
        FavorisModel.findOneAndDelete({
            user: userId as unknown as object,
            program: programId as unknown as object,
        }).lean(),
};
