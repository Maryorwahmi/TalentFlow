import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

import AppError from "./app-error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profileUploadRoot = path.resolve(__dirname, "../../uploads/profile_pictures");
const maxFileSize = 2 * 1024 * 1024; // 2MB

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/gif"]);

fs.mkdirSync(profileUploadRoot, { recursive: true });

const storage = multer.diskStorage({
    destination(_request, _file, callback) {
        callback(null, profileUploadRoot);
    },
    filename(request, file, callback) {
        const actorId = request.user?.id || "anonymous";
        const extension = path.extname(file.originalname).toLowerCase();
        const filename = `profile-${actorId}-${Date.now()}${extension}`;
        callback(null, filename);
    }
});

function fileFilter(_request, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
        return callback(new AppError(400, "Unsupported image type. Allowed: jpg, png, gif."));
    }

    return callback(null, true);
}

const profileUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: maxFileSize,
        files: 1,
    }
}).single("profilePicture");

export { profileUpload, profileUploadRoot, maxFileSize, allowedMimeTypes };
