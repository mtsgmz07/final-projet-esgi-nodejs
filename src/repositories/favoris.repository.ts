import { FavorisModel } from "../models/favoris.model";

export const favorisRepository = {
    findByUser: (userId: string) =>
        FavorisModel.find({ user: userId as unknown as object })
            .populate({
                path: "program",
                select: "-user -exercices -__v",
            })
            .select("-__v -user")
            .lean(),

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
