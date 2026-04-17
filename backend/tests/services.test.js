import test from "node:test";
import assert from "node:assert/strict";

import {
    resetStore,
    runInTransaction,
    getStateSnapshot
} from "../src/shared/db/store.js";
import {
    rebuildProgressSnapshot,
    ensureCertificateForCourse,
    calculateOverallPercent
} from "../src/modules/learning/services/progress.service.js";
import {
    upsertLessonProgress,
    createEnrollment
} from "../src/modules/learning/repositories/learning.repository.js";
import {
    createSubmission,
    upsertGrade
} from "../src/modules/grading/repositories/assignment.repository.js";
import { recordAudit } from "../src/shared/events/audit.service.js";

test("calculateOverallPercent returns the expected rounded percentage", () => {
    const percent = calculateOverallPercent({
        completedLessons: 2,
        completedAssignments: 1,
        totalLessons: 3,
        totalAssignments: 1
    });

    assert.equal(percent, 75);
});

test("rebuildProgressSnapshot counts completed lessons and graded assignments", async () => {
    resetStore();

    await runInTransaction(async (state) => {
        await upsertLessonProgress(
            {
                userId: "3",
                lessonId: "300",
                courseId: "100",
                completed: true
            },
            state
        );

        const submission = await createSubmission(
            {
                assignmentId: "500",
                userId: "3",
                textResponse: "Completed work",
                status: "submitted"
            },
            state
        );

        await upsertGrade(
            {
                submissionId: submission.id,
                scoredBy: "2",
                score: 90,
                feedback: "Great work"
            },
            state
        );

        const snapshot = await rebuildProgressSnapshot(
            {
                userId: "3",
                courseId: "100"
            },
            state
        );

        assert.equal(snapshot.completedLessons, 1);
        assert.equal(snapshot.completedAssignments, 1);
        assert.equal(snapshot.overallPercent, 50);
    });
});

test("ensureCertificateForCourse issues a certificate at 100 percent progress", async () => {
    resetStore();

    await runInTransaction(async (state) => {
        for (const lessonId of ["300", "301", "302"]) {
            await upsertLessonProgress(
                {
                    userId: "3",
                    lessonId,
                    courseId: "100",
                    completed: true
                },
                state
            );
        }

        const submission = await createSubmission(
            {
                assignmentId: "500",
                userId: "3",
                textResponse: "Done",
                status: "submitted"
            },
            state
        );

        await upsertGrade(
            {
                submissionId: submission.id,
                scoredBy: "2",
                score: 100,
                feedback: "Perfect"
            },
            state
        );

        const certificate = await ensureCertificateForCourse(
            {
                userId: "3",
                courseId: "100"
            },
            state
        );

        assert.ok(certificate);
        assert.equal(certificate.courseId, "100");
    });
});

test("recordAudit appends an audit event with actor and request metadata", async () => {
    resetStore();

    let audit;

    await runInTransaction(async (state) => {
        audit = await recordAudit(
            {
                actorUserId: "2",
                actorRole: "instructor",
                action: "course.created",
                entityType: "course",
                entityId: "123",
                requestId: "req-123",
                metadata: { status: "draft" }
            },
            state
        );

    });

    const snapshot = getStateSnapshot();
    assert.equal(audit.actorUserId, "2");
    assert.equal(snapshot.auditEvents.at(-1).requestId, "req-123");
});
