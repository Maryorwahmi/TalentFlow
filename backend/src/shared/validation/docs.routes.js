import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const openApiPath = path.resolve(__dirname, "./openapi.json");

router.get("/openapi.json", (_request, response, next) => {
    try {
        const document = JSON.parse(fs.readFileSync(openApiPath, "utf8"));

        response.status(200).json(document);
    } catch (error) {
        next(error);
    }
});

export default router;
