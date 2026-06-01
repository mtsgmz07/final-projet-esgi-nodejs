import { model, Schema } from "mongoose";
import { Program } from "../interface/program.interface";

const ProgramSchema = new Schema<Program>(
    {
        title: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: "users", required: true },
        exercices: [{ type: Schema.Types.ObjectId, ref: "exercices" }]
    },
    {
        timestamps: true
    }
)

export const ProgramModel = model<Program>('programs', ProgramSchema);
