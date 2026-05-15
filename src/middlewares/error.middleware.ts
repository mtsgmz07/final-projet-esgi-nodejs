import { Request, Response, NextFunction } from 'express';
import { HttpError } from "../class/HttpError";

export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({ status: err.statusCode,  error: err.message });
        return;
    }
    
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
};