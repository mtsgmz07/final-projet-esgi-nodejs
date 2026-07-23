import { HistoryModel } from "../models/history.model";

export const historyRepository = {
    findActiveByUser: (userId: string) =>
        HistoryModel.findOne({ userId, end: null }).lean(),

    start: (userId: string, programId: string) =>
        HistoryModel.create({ userId, programId, start: new Date(), end: null, weight: null }),

    stop: (id: string, weight: number) =>
        HistoryModel.findByIdAndUpdate(id, { end: new Date(), weight }, { new: true })
            .select("-__v")
            .lean(),

    findByUser: (userId: string) =>
        HistoryModel.find({ userId })
            .populate({ path: "programId", select: "title description" })
            .select("start end weight")
            .sort({ start: -1 })
            .lean(),
};
