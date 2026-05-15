import { model, Schema } from "mongoose";
import { Exercice } from "../interface/exercice.model";

const ExerciceSchema = new Schema<Exercice>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        time: { type: Date, required: true }
    },
    {
        timestamps: true
    }
)

export const ExerciceModel = model<Exercice>('exercices', ExerciceSchema);
