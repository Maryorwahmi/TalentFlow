import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const upPath = path.resolve(repoRoot, "src/shared/db/migrations/001_learning_core.up.sql");
const downPath = path.resolve(repoRoot, "src/shared/db/migrations/001_learning_core.down.sql");

test("up migration defines the required learning-core tables", () => {
    const migration = fs.readFileSync(upPath, "utf8");

    [
        "courses",
        "course_instructors",
        "course_modules",
        "lessons",
        "enrollments",
        "lesson_progress",
        "assignments",
        "submissions",
        "submission_files",
        "grades",
        "certificates",
        "progress_snapshots",
        "audit_events"
    ].forEach((tableName) => {
        assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}`));
    });
});

test("down migration drops the required learning-core tables", () => {
    const migration = fs.readFileSync(downPath, "utf8");

    [
        "audit_events",
        "progress_snapshots",
        "certificates",
        "grades",
        "submission_files",
        "submissions",
        "assignments",
        "lesson_progress",
        "enrollments",
        "lessons",
        "course_modules",
        "course_instructors",
        "courses"
    ].forEach((tableName) => {
        assert.match(migration, new RegExp(`DROP TABLE IF EXISTS ${tableName}`));
    });
});
