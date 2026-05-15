import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { isValidObjectId } from "mongoose";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../class/HttpError";
import { CreateUserDto, UpdateUserDto } from "../validators/user.validator";

const SALT_ROUNDS = 10;

const ensureValidId = (id: string) => {
    if (!isValidObjectId(id)) throw new HttpError(400, "Invalid id");
};

export const userController = {
    list: async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await userRepository.findAll();
            res.json(users);
        } catch (err) {
            next(err);
        }
    },

    get: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            ensureValidId(req.params.id);
            const user = await userRepository.findById(req.params.id);
            if (!user) throw new HttpError(404, "User not found");
            res.json(user);
        } catch (err) {
            next(err);
        }
    },

    create: async (req: Request<unknown, unknown, CreateUserDto>, res: Response, next: NextFunction) => {
        try {
            const existing = await userRepository.findByEmail(req.body.email);
            if (existing) throw new HttpError(409, "Email already in use");

            const hashed = await bcrypt.hash(req.body.password, SALT_ROUNDS);
            const user = await userRepository.create({ ...req.body, password: hashed });
            res.status(201).json(user);
        } catch (err) {
            next(err);
        }
    },

    update: async (req: Request<{ id: string }, unknown, UpdateUserDto>, res: Response, next: NextFunction) => {
        try {
            ensureValidId(req.params.id);
            const data: UpdateUserDto = { ...req.body };
            if (data.password) data.password = await bcrypt.hash(data.password, SALT_ROUNDS);

            const user = await userRepository.update(req.params.id, data);
            if (!user) throw new HttpError(404, "User not found");
            res.json(user);
        } catch (err) {
            next(err);
        }
    },

    remove: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            ensureValidId(req.params.id);
            const user = await userRepository.delete(req.params.id);
            if (!user) throw new HttpError(404, "User not found");
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
