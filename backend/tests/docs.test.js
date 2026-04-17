import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const openApiPath = path.resolve(repoRoot, "src/shared/validation/openapi.json");

test("OpenAPI document exists and includes the required learning-core paths", () => {
    const document = JSON.parse(fs.readFileSync(openApiPath, "utf8"));

    const requiredPaths = [
        "/public/home",
        "/courses",
        "/courses/{courseId}",
        "/courses/{courseId}/enroll",
        "/learner/dashboard",
        "/learner/assignments",
        "/learner/courses",
        "/learner/progress",
        "/lessons/{lessonId}",
        "/lessons/{lessonId}/progress",
        "/courses/{courseId}/assignments",
        "/assignments/{assignmentId}",
        "/assignments/{assignmentId}/submissions",
        "/learner/submissions/{submissionId}",
        "/submissions/{submissionId}/draft",
        "/learner/certificates",
        "/certificates/{certificateId}",
        "/certificates/{certificateId}/download",
        "/instructor/learners",
        "/instructor/courses",
        "/instructor/submissions",
        "/instructor/submissions/{submissionId}",
        "/instructor/courses/{courseId}",
        "/instructor/courses/{courseId}/learners",
        "/instructor/assignments/{assignmentId}/submissions",
        "/instructor/submissions/{submissionId}/grade"
    ];

    requiredPaths.forEach((requiredPath) => {
        assert.ok(document.paths[requiredPath], `Missing OpenAPI path: ${requiredPath}`);
    });
});
