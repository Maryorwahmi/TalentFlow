import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";

import app from "../src/app.js";
import { getState, resetStore } from "../src/shared/db/store.js";
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

async function parseJson(response) {
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        return null;
    }

    return response.json();
}

test("public routes, docs route, auth errors, and visibility rules work correctly", async () => {
    resetStore();
    const { server, baseUrl } = await startServer();

    try {
        const instructorToken = tokenForEmail("instructor@talentflow.test");

        const healthResponse = await fetch(`${baseUrl}/health`);
        const healthPayload = await healthResponse.json();
        assert.equal(healthResponse.status, 200);
        assert.equal(healthPayload.error, null);
        assert.equal(healthPayload.data.status, "ok");

        const docsResponse = await fetch(`${baseUrl}/api/v1/openapi.json`);
        const docsPayload = await docsResponse.json();
        assert.equal(docsResponse.status, 200);
        assert.ok(docsPayload.paths["/courses"]);

        const publicHomeResponse = await fetch(`${baseUrl}/api/v1/public/home`);
        const publicHomePayload = await publicHomeResponse.json();
        assert.equal(publicHomeResponse.status, 200);
        assert.equal(publicHomePayload.data.featuredCourses.length, 1);
        assert.equal(publicHomePayload.data.statCards.length, 4);

        const coursesResponse = await fetch(`${baseUrl}/api/v1/courses`);
        const coursesPayload = await coursesResponse.json();
        assert.equal(coursesResponse.status, 200);
        assert.equal(coursesPayload.data.length, 1);
        assert.equal(coursesPayload.data[0].id, "100");

        const publishedCourseResponse = await fetch(`${baseUrl}/api/v1/courses/100`);
        const publishedCoursePayload = await publishedCourseResponse.json();
        assert.equal(publishedCourseResponse.status, 200);
        assert.equal(publishedCoursePayload.data.modules.length, 2);

        const draftCourseResponse = await fetch(`${baseUrl}/api/v1/courses/101`);
        const draftCoursePayload = await draftCourseResponse.json();
        assert.equal(draftCourseResponse.status, 403);
        assert.match(draftCoursePayload.error.message, /not publicly available/i);

        const instructorDraftResponse = await fetch(`${baseUrl}/api/v1/courses/101`, {
            headers: {
                Authorization: `Bearer ${instructorToken}`
            }
        });
        const instructorDraftPayload = await instructorDraftResponse.json();
        assert.equal(instructorDraftResponse.status, 200);
        assert.equal(instructorDraftPayload.data.id, "101");

        const assignmentsNoAuthResponse = await fetch(
            `${baseUrl}/api/v1/courses/100/assignments`
        );
        const assignmentsNoAuthPayload = await assignmentsNoAuthResponse.json();
        assert.equal(assignmentsNoAuthResponse.status, 401);
        assert.match(assignmentsNoAuthPayload.error.message, /authentication required/i);

        const malformedHeaderResponse = await fetch(
            `${baseUrl}/api/v1/courses/100/assignments`,
            {
                headers: {
                    Authorization: "Token not-a-bearer-token"
                }
            }
        );
        const malformedHeaderPayload = await malformedHeaderResponse.json();
        assert.equal(malformedHeaderResponse.status, 401);
        assert.match(malformedHeaderPayload.error.message, /bearer/i);

        const assignmentsResponse = await fetch(
            `${baseUrl}/api/v1/courses/100/assignments`,
            {
                headers: {
                    Authorization: `Bearer ${instructorToken}`
                }
            }
        );
        const assignmentsPayload = await assignmentsResponse.json();
        assert.equal(assignmentsResponse.status, 200);
        assert.equal(assignmentsPayload.data.length, 1);

        const assignmentDetailResponse = await fetch(
            `${baseUrl}/api/v1/assignments/500`,
            {
                headers: {
                    Authorization: `Bearer ${instructorToken}`
                }
            }
        );
        const assignmentDetailPayload = await assignmentDetailResponse.json();
        assert.equal(assignmentDetailResponse.status, 200);
        assert.equal(assignmentDetailPayload.data.id, "500");

        const invalidAssignmentIdResponse = await fetch(
            `${baseUrl}/api/v1/assignments/not-a-valid-id`,
            {
                headers: {
                    Authorization: `Bearer ${instructorToken}`
                }
            }
        );
        const invalidAssignmentIdPayload = await invalidAssignmentIdResponse.json();
        assert.equal(invalidAssignmentIdResponse.status, 400);
        assert.match(invalidAssignmentIdPayload.error.message, /invalid assignmentid/i);

        const invalidCourseIdResponse = await fetch(
            `${baseUrl}/api/v1/courses/not-a-valid-id`
        );
        const invalidCourseIdPayload = await invalidCourseIdResponse.json();
        assert.equal(invalidCourseIdResponse.status, 400);
        assert.match(invalidCourseIdPayload.error.message, /invalid courseid/i);

        const notFoundResponse = await fetch(`${baseUrl}/api/v1/does-not-exist`);
        const notFoundPayload = await notFoundResponse.json();
        assert.equal(notFoundResponse.status, 404);
        assert.match(notFoundPayload.error.message, /route not found/i);
    } finally {
        server.close();
    }
});

test("learner routes cover dashboard, lessons, submission retrieval, and policy failures", async () => {
    resetStore();
    const { server, baseUrl } = await startServer();

    try {
        const learnerToken = tokenForEmail("learner@talentflow.test");
        const secondLearnerToken = tokenForEmail("learner.two@talentflow.test");

        const dashboardResponse = await fetch(`${baseUrl}/api/v1/learner/dashboard`, {
            headers: {
                Authorization: `Bearer ${learnerToken}`
            }
        });
        const dashboardPayload = await dashboardResponse.json();
        assert.equal(dashboardResponse.status, 200);
        assert.equal(dashboardPayload.data.courses.length, 1);
        assert.equal(dashboardPayload.data.pendingAssignments.length, 1);

        const learnerCoursesResponse = await fetch(`${baseUrl}/api/v1/learner/courses`, {
            headers: {
                Authorization: `Bearer ${learnerToken}`
            }
        });
        const learnerCoursesPayload = await learnerCoursesResponse.json();
        assert.equal(learnerCoursesResponse.status, 200);
        assert.equal(learnerCoursesPayload.data.length, 1);

        const learnerAssignmentsResponse = await fetch(
            `${baseUrl}/api/v1/learner/assignments`,
            {
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                }
            }
        );
        const learnerAssignmentsPayload = await learnerAssignmentsResponse.json();
        assert.equal(learnerAssignmentsResponse.status, 200);
        assert.equal(learnerAssignmentsPayload.data.length, 1);
        assert.equal(learnerAssignmentsPayload.data[0].learnerStatus, "pending");

        const learnerProgressResponse = await fetch(
            `${baseUrl}/api/v1/learner/progress`,
            {
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                }
            }
        );
        const learnerProgressPayload = await learnerProgressResponse.json();
        assert.equal(learnerProgressResponse.status, 200);
        assert.equal(learnerProgressPayload.data.length, 1);

        const lessonResponse = await fetch(`${baseUrl}/api/v1/lessons/300`, {
            headers: {
                Authorization: `Bearer ${learnerToken}`
            }
        });
        const lessonPayload = await lessonResponse.json();
        assert.equal(lessonResponse.status, 200);
        assert.equal(lessonPayload.data.id, "300");

        const missingLessonResponse = await fetch(`${baseUrl}/api/v1/lessons/999`, {
            headers: {
                Authorization: `Bearer ${learnerToken}`
            }
        });
        const missingLessonPayload = await missingLessonResponse.json();
        assert.equal(missingLessonResponse.status, 404);
        assert.match(missingLessonPayload.error.message, /lesson not found/i);

        const draftEnrollResponse = await fetch(`${baseUrl}/api/v1/courses/101/enroll`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${learnerToken}`
            }
        });
        const draftEnrollPayload = await draftEnrollResponse.json();
        assert.equal(draftEnrollResponse.status, 403);
        assert.match(draftEnrollPayload.error.message, /published courses/i);

        const emptySubmissionForm = new FormData();
        const invalidSubmissionResponse = await fetch(
            `${baseUrl}/api/v1/assignments/500/submissions`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                },
                body: emptySubmissionForm
            }
        );
        const invalidSubmissionPayload = await invalidSubmissionResponse.json();
        assert.equal(invalidSubmissionResponse.status, 400);
        assert.match(
            invalidSubmissionPayload.error.message,
            /invalid submission payload/i
        );

        const submissionForm = new FormData();
        submissionForm.set("textResponse", "Text-only answer from learner.");

        const submissionResponse = await fetch(
            `${baseUrl}/api/v1/assignments/500/submissions`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                },
                body: submissionForm
            }
        );
        const submissionPayload = await submissionResponse.json();
        assert.equal(submissionResponse.status, 201);
        assert.equal(submissionPayload.data.files.length, 0);

        const duplicateSubmissionForm = new FormData();
        duplicateSubmissionForm.set("textResponse", "Attempting to submit twice.");

        const duplicateSubmissionResponse = await fetch(
            `${baseUrl}/api/v1/assignments/500/submissions`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                },
                body: duplicateSubmissionForm
            }
        );
        const duplicateSubmissionPayload = await duplicateSubmissionResponse.json();
        assert.equal(duplicateSubmissionResponse.status, 409);
        assert.match(duplicateSubmissionPayload.error.message, /already submitted/i);

        const submissionId = submissionPayload.data.id;

        const learnerSubmissionResponse = await fetch(
            `${baseUrl}/api/v1/learner/submissions/${submissionId}`,
            {
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                }
            }
        );
        const learnerSubmissionPayload = await learnerSubmissionResponse.json();
        assert.equal(learnerSubmissionResponse.status, 200);
        assert.equal(learnerSubmissionPayload.data.assignment.id, "500");

        const secondLearnerSubmissionResponse = await fetch(
            `${baseUrl}/api/v1/learner/submissions/${submissionId}`,
            {
                headers: {
                    Authorization: `Bearer ${secondLearnerToken}`
                }
            }
        );
        const secondLearnerSubmissionPayload =
            await secondLearnerSubmissionResponse.json();
        assert.equal(secondLearnerSubmissionResponse.status, 403);
        assert.match(secondLearnerSubmissionPayload.error.message, /own submissions/i);

        const state = getState();
        state.submissions.push({
            id: "699",
            assignmentId: "500",
            userId: "3",
            textResponse: "Initial draft",
            status: "draft",
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        const draftForm = new FormData();
        draftForm.set("textResponse", "Updated draft answer");

        const saveDraftResponse = await fetch(
            `${baseUrl}/api/v1/submissions/699/draft`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                },
                body: draftForm
            }
        );
        const saveDraftPayload = await saveDraftResponse.json();
        assert.equal(saveDraftResponse.status, 200);
        assert.equal(saveDraftPayload.data.status, "draft");
        assert.equal(saveDraftPayload.data.textResponse, "Updated draft answer");

        const missingCertificateResponse = await fetch(
            `${baseUrl}/api/v1/certificates/999`,
            {
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                }
            }
        );
        const missingCertificatePayload = await missingCertificateResponse.json();
        assert.equal(missingCertificateResponse.status, 404);
        assert.match(missingCertificatePayload.error.message, /certificate not found/i);

        const instructorRouteAsLearnerResponse = await fetch(
            `${baseUrl}/api/v1/instructor/courses`,
            {
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                }
            }
        );
        const instructorRouteAsLearnerPayload =
            await instructorRouteAsLearnerResponse.json();
        assert.equal(instructorRouteAsLearnerResponse.status, 403);
        assert.match(instructorRouteAsLearnerPayload.error.message, /permission/i);
    } finally {
        server.close();
    }
});

test("instructor and admin routes cover course management, learners, submissions, and grading", async () => {
    resetStore();
    const { server, baseUrl } = await startServer();

    try {
        const instructorToken = tokenForEmail("instructor@talentflow.test");
        const adminToken = tokenForEmail("admin@talentflow.test");
        const learnerToken = tokenForEmail("learner@talentflow.test");

        const instructorCoursesResponse = await fetch(
            `${baseUrl}/api/v1/instructor/courses`,
            {
                headers: {
                    Authorization: `Bearer ${instructorToken}`
                }
            }
        );
        const instructorCoursesPayload = await instructorCoursesResponse.json();
        assert.equal(instructorCoursesResponse.status, 200);
        assert.equal(instructorCoursesPayload.data.length, 2);

        const adminCoursesResponse = await fetch(
            `${baseUrl}/api/v1/instructor/courses`,
            {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );
        const adminCoursesPayload = await adminCoursesResponse.json();
        assert.equal(adminCoursesResponse.status, 200);
        assert.equal(adminCoursesPayload.data.length, 2);

        const instructorCourseResponse = await fetch(
            `${baseUrl}/api/v1/instructor/courses/100`,
            {
                headers: {
                    Authorization: `Bearer ${instructorToken}`
                }
            }
        );
        const instructorCoursePayload = await instructorCourseResponse.json();
        assert.equal(instructorCourseResponse.status, 200);
        assert.equal(instructorCoursePayload.data.id, "100");

        const updateCourseResponse = await fetch(
            `${baseUrl}/api/v1/instructor/courses/100`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${instructorToken}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    description: "Updated course description for coverage."
                })
            }
        );
        const updateCoursePayload = await updateCourseResponse.json();
        assert.equal(updateCourseResponse.status, 200);
        assert.equal(
            updateCoursePayload.data.description,
            "Updated course description for coverage."
        );

        const learnersResponse = await fetch(
            `${baseUrl}/api/v1/instructor/courses/100/learners`,
            {
                headers: {
                    Authorization: `Bearer ${instructorToken}`
                }
            }
        );
        const learnersPayload = await learnersResponse.json();
        assert.equal(learnersResponse.status, 200);
        assert.equal(learnersPayload.data.length, 2);

        const instructorLearnersResponse = await fetch(
            `${baseUrl}/api/v1/instructor/learners`,
            {
                headers: {
                    Authorization: `Bearer ${instructorToken}`
                }
            }
        );
        const instructorLearnersPayload = await instructorLearnersResponse.json();
        assert.equal(instructorLearnersResponse.status, 200);
        assert.equal(instructorLearnersPayload.data.length, 2);

        const instructorLessonResponse = await fetch(`${baseUrl}/api/v1/lessons/300`, {
            headers: {
                Authorization: `Bearer ${instructorToken}`
            }
        });
        const instructorLessonPayload = await instructorLessonResponse.json();
        assert.equal(instructorLessonResponse.status, 200);
        assert.equal(instructorLessonPayload.data.id, "300");

        const form = new FormData();
        form.set("textResponse", "Submission to support instructor review coverage.");

        const learnerSubmissionResponse = await fetch(
            `${baseUrl}/api/v1/assignments/500/submissions`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                },
                body: form
            }
        );
        const learnerSubmissionPayload = await learnerSubmissionResponse.json();
        assert.equal(learnerSubmissionResponse.status, 201);

        const assignmentSubmissionsResponse = await fetch(
            `${baseUrl}/api/v1/instructor/assignments/500/submissions`,
            {
                headers: {
                    Authorization: `Bearer ${instructorToken}`
                }
            }
        );
        const assignmentSubmissionsPayload =
            await assignmentSubmissionsResponse.json();
        assert.equal(assignmentSubmissionsResponse.status, 200);
        assert.equal(assignmentSubmissionsPayload.data.length, 1);

        const submissionId = learnerSubmissionPayload.data.id;

        const instructorSubmissionsResponse = await fetch(
            `${baseUrl}/api/v1/instructor/submissions`,
            {
                headers: {
                    Authorization: `Bearer ${instructorToken}`
                }
            }
        );
        const instructorSubmissionsPayload =
            await instructorSubmissionsResponse.json();
        assert.equal(instructorSubmissionsResponse.status, 200);
        assert.equal(instructorSubmissionsPayload.data.length, 1);

        const instructorSubmissionDetailResponse = await fetch(
            `${baseUrl}/api/v1/instructor/submissions/${submissionId}`,
            {
                headers: {
                    Authorization: `Bearer ${instructorToken}`
                }
            }
        );
        const instructorSubmissionDetailPayload =
            await instructorSubmissionDetailResponse.json();
        assert.equal(instructorSubmissionDetailResponse.status, 200);
        assert.equal(instructorSubmissionDetailPayload.data.id, submissionId);
        assert.equal(
            instructorSubmissionDetailPayload.data.assignment.id,
            "500"
        );

        const invalidGradeResponse = await fetch(
            `${baseUrl}/api/v1/instructor/submissions/${submissionId}/grade`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${instructorToken}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    score: 101,
                    feedback: "Too high"
                })
            }
        );
        const invalidGradePayload = await invalidGradeResponse.json();
        assert.equal(invalidGradeResponse.status, 400);
        assert.match(invalidGradePayload.error.message, /max score/i);

        const validGradeResponse = await fetch(
            `${baseUrl}/api/v1/instructor/submissions/${submissionId}/grade`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${instructorToken}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    score: 95,
                    feedback: "Strong work",
                    rubric: {
                        correctness: 95
                    }
                })
            }
        );
        const validGradePayload = await validGradeResponse.json();
        assert.equal(validGradeResponse.status, 200);
        assert.equal(validGradePayload.data.grade.score, 95);
    } finally {
        server.close();
    }
});

test("upload middleware rejects unsupported file types and oversized files", async () => {
    resetStore();
    const { server, baseUrl } = await startServer();

    try {
        const learnerToken = tokenForEmail("learner@talentflow.test");

        const invalidFileForm = new FormData();
        invalidFileForm.append(
            "files",
            new Blob(["plain text file"], { type: "text/plain" }),
            "notes.txt"
        );

        const invalidFileResponse = await fetch(
            `${baseUrl}/api/v1/assignments/500/submissions`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                },
                body: invalidFileForm
            }
        );
        const invalidFilePayload = await parseJson(invalidFileResponse);
        assert.equal(invalidFileResponse.status, 400);
        assert.match(invalidFilePayload.error.message, /unsupported file type/i);

        const largeFileForm = new FormData();
        largeFileForm.append(
            "files",
            new Blob([new Uint8Array(10 * 1024 * 1024 + 1024)], {
                type: "application/pdf"
            }),
            "large.pdf"
        );

        const largeFileResponse = await fetch(
            `${baseUrl}/api/v1/assignments/500/submissions`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${learnerToken}`
                },
                body: largeFileForm
            }
        );
        const largeFilePayload = await largeFileResponse.json();
        assert.equal(largeFileResponse.status, 400);
        assert.match(largeFilePayload.error.message, /too large/i);
    } finally {
        server.close();
    }
});
