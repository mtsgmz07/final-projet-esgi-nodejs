import { model, Schema } from "mongoose";
import { Favoris } from "../interface/favoris.interface";

const FavorisSchema = new Schema<Favoris>(
    {
        program: { type: Schema.Types.ObjectId, ref: "programs", required: true },
        user: { type: Schema.Types.ObjectId, ref: "users", required: true }
    },
    {
        timestamps: true
    }
)

export const FavorisModel = model<Favoris>('favoris', FavorisSchema);
