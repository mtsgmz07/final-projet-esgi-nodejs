import { UserModel } from "../models/user.model";
import { User } from "../interface/user.interface";

export type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUserInput = Partial<CreateUserInput>;

export const userRepository = {
    findAll: (search?: string) => {
        const filter = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            }
            : {};
        return UserModel.find(filter).select("-password").lean();
    },

    findById: (id: string) => UserModel.findById(id).select("-password").lean(),

    findByEmail: (email: string) => UserModel.findOne({ email }),

    create: async (data: CreateUserInput) => {
        const user = await UserModel.create(data);
        const obj = user.toObject();
        delete (obj as { password?: string }).password;
        return obj;
    },

    update: (id: string, data: UpdateUserInput) =>
        UserModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .select("-password")
            .lean(),

    delete: (id: string) => UserModel.findByIdAndDelete(id).lean(),
};
