import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openApiPath = path.resolve(__dirname, "./openapi.json");
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

const missing = requiredPaths.filter((requiredPath) => !document.paths?.[requiredPath]);

if (missing.length > 0) {
    console.error("Missing OpenAPI paths:", missing.join(", "));
    process.exit(1);
}

console.log("OpenAPI document includes all required paths.");
