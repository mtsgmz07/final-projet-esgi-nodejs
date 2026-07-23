import { model, Schema } from "mongoose";
import { Exercice } from "../interface/exercice.model";

const ExerciceSchema = new Schema<Exercice>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        // Durée en millisecondes, max 25 min
        time: { type: Number, required: true, min: 1, max: 25 * 60 * 1000 },
        imageUrl: { type: String, default: null }
    },
    {
        timestamps: true
    }
)

export const ExerciceModel = model<Exercice>('exercices', ExerciceSchema);
