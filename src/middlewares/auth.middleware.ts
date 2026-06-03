import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../class/HttpError";
import { User, UserRole } from "../interface/user.interface";

interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

const extractToken = (req: Request): string | undefined => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
    return req.cookies?.token;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) return next(new HttpError(401, "Missing authentication token"));

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        next();
    } catch {
        next(new HttpError(401, "Invalid or expired token"));
    }
};

export const requireRole = (...roles: UserRole[]) =>
    (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) return next(new HttpError(401, "Not authenticated"));
        if (!roles.includes(req.user.role)) return next(new HttpError(403, "Forbidden"));
        next();
    };
