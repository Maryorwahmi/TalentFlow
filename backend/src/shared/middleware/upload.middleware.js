import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

import AppError from "./app-error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRoot = path.resolve(__dirname, "../../uploads/submissions");
const maxFileSize = 10 * 1024 * 1024;

const allowedMimeTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png"
]);

fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
    destination(_request, _file, callback) {
        callback(null, uploadRoot);
    },
    filename(request, file, callback) {
        const assignmentId = request.params.assignmentId || "assignment";
        const actorId = request.user?.id || "anonymous";
        const extension = path.extname(file.originalname).toLowerCase();
        const filename = `${assignmentId}-${actorId}-${Date.now()}-${Math.round(
            Math.random() * 1e6
        )}${extension}`;

        callback(null, filename);
    }
});

function fileFilter(_request, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
        return callback(
            new AppError(
                400,
                "Unsupported file type. Allowed file types are pdf, doc, docx, jpg, and png."
            )
        );
    }

    return callback(null, true);
}

const submissionUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: maxFileSize,
        files: 5
    }
}).array("files", 5);

export {
    submissionUpload,
    uploadRoot,
    maxFileSize,
    allowedMimeTypes
};
