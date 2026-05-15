import { model, Schema } from "mongoose";
import { History } from "../interface/history.interface";

const HistorySchema = new Schema<History>(
    {
        user: { type: Schema.Types.ObjectId, ref: "users", required: true },
        weight: { type: Number, required: true },
        program: { type: String, required: true },
        time: { type: Date, required: true }
    },
    {
        timestamps: true
    }
)

export const HistoryModel = model<History>('histories', HistorySchema);
