import test from "node:test";
import assert from "node:assert/strict";

import { validateCoursePayload } from "../src/shared/validation/course.validator.js";
import { validateAssignmentSubmissionPayload } from "../src/shared/validation/assignment.validator.js";
import { validateIdParam } from "../src/shared/validation/common.validator.js";
import { validateGradePayload } from "../src/shared/validation/submission.validator.js";

test("validateIdParam accepts a valid route id", () => {
    const result = validateIdParam("500", "assignmentId");

    assert.equal(result.isValid, true);
    assert.equal(result.cleanData.id, "500");
});

test("validateCoursePayload validates nested modules and assignments", () => {
    const result = validateCoursePayload({
        title: "API Mastery",
        description: "A strong backend course",
        status: "draft",
        category: "backend",
        catalogVisibility: "public",
        certificateEnabled: true,
        instructorIds: ["2"],
        modules: [
            {
                title: "Module 1",
                lessons: [
                    {
                        title: "Lesson 1",
                        content: "Some content"
                    }
                ]
            }
        ],
        assignments: [
            {
                title: "Build an API",
                description: "Ship the required endpoints",
                dueDate: "2026-12-01T10:00:00.000Z",
                maxScore: 100
            }
        ]
    });

    assert.equal(result.isValid, true);
    assert.equal(result.cleanData.modules.length, 1);
    assert.equal(result.cleanData.assignments.length, 1);
});

test("validateAssignmentSubmissionPayload requires text or files", () => {
    const invalidResult = validateAssignmentSubmissionPayload({}, []);
    const validResult = validateAssignmentSubmissionPayload(
        { textResponse: "My answer" },
        []
    );

    assert.equal(invalidResult.isValid, false);
    assert.equal(validResult.isValid, true);
});

test("validateGradePayload rejects a score above max score", () => {
    const result = validateGradePayload(
        {
            score: 101,
            feedback: "Too high"
        },
        100
    );

    assert.equal(result.isValid, false);
    assert.equal(
        result.errors.includes("score cannot be greater than the assignment max score."),
        true
    );
});
