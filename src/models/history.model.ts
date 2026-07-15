import { model, Schema } from "mongoose";
import { History } from "../interface/history.interface";

const HistorySchema = new Schema<History>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
        programId: { type: Schema.Types.ObjectId, ref: "programs", required: true },
        start: { type: Date, required: true },
        end: { type: Date, default: null },
        weight: { type: Number, default: null },
    },
    {
        timestamps: true
    }
)

export const HistoryModel = model<History>('histories', HistorySchema);
