import { model, Schema } from "mongoose";
import { Note } from "../interface/note.interface";

const NoteSchema = new Schema<Note>(
    {
        note: { type: String, required: true },
        program: { type: Schema.Types.ObjectId, ref: "programs", required: true },
        user: { type: Schema.Types.ObjectId, ref: "users", required: true }
    },
    {
        timestamps: true
    }
)

export const NoteModel = model<Note>('notes', NoteSchema);
