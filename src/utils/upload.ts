import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import multer from "multer";
import { HttpError } from "../class/HttpError";
import { Exercice } from "../interface/exercice.model";
import { Program } from "../interface/program.interface";
import { Request } from "express";

export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

const EXTENSIONS: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
};

export const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
    fileFilter: (_req, file, cb) => {
        if (!EXTENSIONS[file.mimetype]) {
            return cb(new HttpError(400, "Invalid image type: only png, jpeg, webp and gif are allowed"));
        }
        cb(null, true);
    },
});


export const saveImageBuffer = (file: Express.Multer.File): string => {
    const ext = EXTENSIONS[file.mimetype];
    if (!ext) throw new HttpError(400, "Invalid image type: only png, jpeg, webp and gif are allowed");

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);

    return filename;
};

export const mapProtocolAndHostExercices = (req: Request, program: Program): Program => ({
    ...program,
    exercices: program.exercices.map(exercice => ({
        ...exercice,
        imageUrl: exercice.imageUrl ? `${req.protocol}://${req.get("host")}${exercice.imageUrl}` : null
    }))
})
