import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { HttpError } from "../class/HttpError";

export const validateBody = (schema: ZodType) =>
    (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const message = result.error.issues
                .map((i) => `${i.path.join(".")}: ${i.message}`)
                .join("; ");
            return next(new HttpError(400, message));
        }
        req.body = result.data;
        next();
    };
