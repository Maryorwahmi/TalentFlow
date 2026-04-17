import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";

import app from "../src/app.js";
import { resetStore, getStateSnapshot } from "../src/shared/db/store.js";
import { tokenForEmail } from "./helpers/token-fixtures.js";

async function startServer() {
    const server = app.listen(0);
    await once(server, "listening");
    const address = server.address();

    return {
        server,
        baseUrl: `http://127.0.0.1:${address.port}`
    };
}

test("bearer token and protected course listing flow works end to end", async () => {
    resetStore();
    const { server, baseUrl } = await startServer();

    try {
        const learnerToken = tokenForEmail("learner@talentflow.test");

        const response = await fetch(`${baseUrl}/api/v1/courses/100/assignments`, {
            headers: {
                Authorization: `Bearer ${learnerToken}`
            }
        });

        const payload = await response.json();

        assert.equal(response.status, 200);
        assert.equal(payload.error, null);
        assert.equal(payload.data.length, 1);
    } finally {
        server.close();
    }
});

test("instructor can create a course and the action is audited", async () => {
    resetStore();
    const { server, baseUrl } = await startServer();

    try {
        const instructorToken = tokenForEmail("instructor@talentflow.test");

        const response = await fetch(`${baseUrl}/api/v1/instructor/courses`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${instructorToken}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                title: "Observability for APIs",
                description: "Learning observability and monitoring practices.",
                status: "draft",
                category: "operations",
                catalogVisibility: "private",
                certificateEnabled: true,
                modules: [
                    {
                        title: "Signals",
                        lessons: [
                            {
                                title: "Logs",
                                content: "Logging matters",
                                isPreview: true
                            }
                        ]
                    }
                ],
                assignments: [
                    {
                        title: "Instrument the service",
                        description: "Add useful traces and metrics",
                        dueDate: "2026-12-01T10:00:00.000Z",
                        maxScore: 100
                    }
                ]
            })
        });

        const payload = await response.json();
        const snapshot = getStateSnapshot();

        assert.equal(response.status, 201);
        assert.equal(payload.data.title, "Observability for APIs");
        assert.equal(
            snapshot.auditEvents.some((event) => event.action === "course.created"),
            true
        );
    } finally {
        server.close();
    }
});

test("learner submission, grading, progress, and certificate flow works end to end", async () => {
    resetStore();
    const { server, baseUrl } = await startServer();

    try {
        const learnerToken = tokenForEmail("learner@talentflow.test");
        const instructorToken = tokenForEmail("instructor@talentflow.test");

        for (const lessonId of ["300", "301", "302"]) {
            const lessonResponse = await fetch(
                `${baseUrl}/api/v1/lessons/${lessonId}/progress`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${learnerToken}`,
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({ completed: true })
                }
            );

            assert.equal(lessonResponse.status, 200);
        }

        const form = new FormData();
        form.set("textResponse", "This is my assignment response.");
        form.append(
            "files",
            new Blob(["binary payload"], { type: "application/pdf" }),
            "submission.pdf"
        );

        const submissionResponse = await fetch(
            `${baseUrl}/api/v1/assignments/500/submissions`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                },
                body: form
            }
        );

        const submissionPayload = await submissionResponse.json();
        assert.equal(submissionResponse.status, 201);
        assert.equal(submissionPayload.data.files.length, 1);

        const submissionId = submissionPayload.data.id;

        const gradeResponse = await fetch(
            `${baseUrl}/api/v1/instructor/submissions/${submissionId}/grade`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${instructorToken}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    score: 100,
                    feedback: "Excellent submission",
                    rubric: {
                        correctness: 100
                    }
                })
            }
        );

        const gradePayload = await gradeResponse.json();
        assert.equal(gradeResponse.status, 200);
        assert.equal(gradePayload.data.grade.score, 100);

        const certificatesResponse = await fetch(`${baseUrl}/api/v1/learner/certificates`, {
            headers: {
                Authorization: `Bearer ${learnerToken}`
            }
        });
        const certificatesPayload = await certificatesResponse.json();

        assert.equal(certificatesResponse.status, 200);
        assert.equal(certificatesPayload.data.length, 1);

        const certificateId = certificatesPayload.data[0].id;

        const certificateResponse = await fetch(
            `${baseUrl}/api/v1/certificates/${certificateId}`,
            {
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                }
            }
        );

        assert.equal(certificateResponse.status, 200);

        const certificateDownloadResponse = await fetch(
            `${baseUrl}/api/v1/certificates/${certificateId}/download`,
            {
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                }
            }
        );
        const certificateDownloadBody = Buffer.from(
            await certificateDownloadResponse.arrayBuffer()
        ).toString("utf8");

        assert.equal(certificateDownloadResponse.status, 200);
        assert.match(
            certificateDownloadResponse.headers.get("content-type") || "",
            /application\/pdf/i
        );
        assert.match(certificateDownloadBody, /^%PDF-1\.4/);
    } finally {
        server.close();
    }
});
