import { model, Schema } from "mongoose";
import { User, UserRole } from "../interface/user.interface";

const UserSchema = new Schema<User>(
    {
        name: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: Object.values(UserRole), required: true },
        weight: { type: Number, required: true },
        size: { type: Number, required: true },
        age: { type: Number, required: true }
    },
    {
        timestamps: true
    }
)

export const UserModel = model<User>('users', UserSchema);