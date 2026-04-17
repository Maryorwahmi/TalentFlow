import test from "node:test";
import assert from "node:assert/strict";

import AppError from "../src/shared/middleware/app-error.js";
import {
    getState,
    resetStore,
    runInTransaction
} from "../src/shared/db/store.js";
import { createCertificate } from "../src/modules/learning/repositories/learning.repository.js";
import {
    assertAuthenticated,
    assertCourseManager,
    assertCourseVisibility,
    assertLearnerEnrollment,
    assertRole
} from "../src/shared/middleware/access.service.js";
import {
    getCourseDetails,
    listPublicCourses
} from "../src/modules/learning/services/course.service.js";
import { getCertificateDetails } from "../src/modules/certificates/services/certificate.service.js";
import { signToken, verifyToken } from "../src/shared/middleware/jwt.js";
import {
    errorHandler,
    notFoundHandler
} from "../src/shared/middleware/error-handler.js";

function createMockResponse() {
    return {
        statusCode: null,
        payload: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.payload = body;
            return this;
        }
    };
}

test("access service enforces authentication, roles, enrollment, and course visibility", () => {
    resetStore();
    const state = getState();

    assert.throws(
        () => assertAuthenticated(null),
        (error) =>
            error instanceof AppError &&
            error.statusCode === 401 &&
            /authentication required/i.test(error.message)
    );

    assert.doesNotThrow(() => {
        assertRole({ id: "1", role: "admin" }, "admin");
    });

    assert.throws(
        () => assertRole({ id: "3", role: "learner" }, "admin"),
        (error) =>
            error instanceof AppError &&
            error.statusCode === 403 &&
            /permission/i.test(error.message)
    );

});

test("access service enforces async course and enrollment guards", async () => {
    resetStore();
    const state = getState();

    await assert.doesNotReject(async () => {
        await assertCourseManager("100", { id: "1", role: "admin" }, state);
    });

    await assert.doesNotReject(async () => {
        await assertCourseManager("100", { id: "2", role: "instructor" }, state);
    });

    await assert.rejects(
        () => assertCourseManager("100", { id: "3", role: "learner" }, state),
        (error) =>
            error instanceof AppError &&
            error.statusCode === 403 &&
            /manage your own courses/i.test(error.message)
    );

    await assert.doesNotReject(async () => {
        await assertLearnerEnrollment("100", { id: "3", role: "learner" }, state);
    });

    await assert.rejects(
        () => assertLearnerEnrollment("101", { id: "3", role: "learner" }, state),
        (error) =>
            error instanceof AppError &&
            error.statusCode === 403 &&
            /enrolled/i.test(error.message)
    );

    assert.equal((await assertCourseVisibility("100", null, state)).id, "100");
    assert.equal(
        (await assertCourseVisibility("101", { id: "1", role: "admin" }, state)).id,
        "101"
    );
    assert.equal(
        (await assertCourseVisibility("101", { id: "2", role: "instructor" }, state)).id,
        "101"
    );

    await assert.rejects(
        () => assertCourseVisibility("101", null, state),
        (error) =>
            error instanceof AppError &&
            error.statusCode === 403 &&
            /not publicly available/i.test(error.message)
    );

    await assert.rejects(
        () => assertCourseVisibility("999", { id: "1", role: "admin" }, state),
        (error) =>
            error instanceof AppError &&
            error.statusCode === 404 &&
            /course not found/i.test(error.message)
    );
});

test("course service returns course details and enforces certificate ownership", async () => {
    resetStore();

    const publicCourses = await listPublicCourses();
    assert.equal(publicCourses.length, 1);
    assert.equal(publicCourses[0].id, "100");

    const publishedCourse = await getCourseDetails("100", null);
    assert.equal(publishedCourse.modules.length, 2);
    assert.equal(publishedCourse.assignments.length, 1);

    const draftCourse = await getCourseDetails("101", { id: "2", role: "instructor" });
    assert.equal(draftCourse.id, "101");

    await runInTransaction(async (state) => {
        const certificate = await createCertificate(
            {
                userId: "3",
                courseId: "100",
                certificateCode: "CERT-100"
            },
            state
        );

        const learnerDetail = await getCertificateDetails(
            certificate.id,
            { id: "3", role: "learner" },
            certificate,
            state
        );
        assert.equal(learnerDetail.learner.id, "3");
        assert.equal(learnerDetail.courseTitle, "Backend Engineering Fundamentals");

        const instructorDetail = await getCertificateDetails(
            certificate.id,
            { id: "2", role: "instructor" },
            certificate,
            state
        );
        assert.equal(instructorDetail.id, certificate.id);

        await assert.rejects(
            () =>
                getCertificateDetails(
                    certificate.id,
                    { id: "4", role: "learner" },
                    certificate,
                    state
                ),
            (error) =>
                error instanceof AppError &&
                error.statusCode === 403 &&
                /own certificates/i.test(error.message)
        );

        await assert.rejects(
            () =>
                getCertificateDetails(
                    certificate.id,
                    { id: "999", role: "instructor" },
                    certificate,
                    state
                ),
            (error) =>
                error instanceof AppError &&
                error.statusCode === 403 &&
                /own courses/i.test(error.message)
        );

        await assert.rejects(
            () =>
                getCertificateDetails(
                    "404",
                    { id: "1", role: "admin" },
                    null,
                    state
                ),
            (error) =>
                error instanceof AppError &&
                error.statusCode === 404 &&
                /certificate not found/i.test(error.message)
        );
    });
});

test("jwt helper signs tokens and rejects malformed, tampered, and expired tokens", async () => {
    const validToken = signToken({
        userId: "1",
        role: "admin",
        email: "admin@talentflow.test"
    });

    const payload = verifyToken(validToken);
    assert.equal(payload.userId, "1");
    assert.equal(payload.role, "admin");

    assert.throws(
        () => verifyToken("not-a-jwt"),
        (error) =>
            error instanceof AppError &&
            error.statusCode === 401 &&
            /invalid token format/i.test(error.message)
    );

    const [header, body] = validToken.split(".");
    const tamperedToken = `${header}.${body}.tampered-signature`;

    assert.throws(
        () => verifyToken(tamperedToken),
        (error) =>
            error instanceof AppError &&
            error.statusCode === 401 &&
            /invalid token signature/i.test(error.message)
    );

    const shortLivedToken = signToken(
        {
            userId: "1",
            role: "admin",
            email: "admin@talentflow.test"
        },
        "1s"
    );

    await new Promise((resolve) => setTimeout(resolve, 2100));

    assert.throws(
        () => verifyToken(shortLivedToken),
        (error) =>
            error instanceof AppError &&
            error.statusCode === 401 &&
            /expired/i.test(error.message)
    );
});

test("error handlers return the expected payloads for route, known, and generic errors", () => {
    let forwardedError;

    notFoundHandler(
        {
            method: "GET",
            originalUrl: "/api/v1/unknown"
        },
        null,
        (error) => {
            forwardedError = error;
        }
    );

    assert.equal(forwardedError.statusCode, 404);

    const limitResponse = createMockResponse();
    errorHandler(
        { code: "LIMIT_FILE_SIZE" },
        { requestId: "req-limit" },
        limitResponse,
        () => {}
    );
    assert.equal(limitResponse.statusCode, 400);
    assert.match(limitResponse.payload.error.message, /too large/i);

    const knownResponse = createMockResponse();
    errorHandler(
        new AppError(403, "Forbidden action", ["detail"]),
        { requestId: "req-known" },
        knownResponse,
        () => {}
    );
    assert.equal(knownResponse.statusCode, 403);
    assert.equal(knownResponse.payload.meta.requestId, "req-known");
    assert.deepEqual(knownResponse.payload.error.details, ["detail"]);

    const unknownResponse = createMockResponse();
    errorHandler(
        new Error("Unexpected explosion"),
        { requestId: "req-unknown" },
        unknownResponse,
        () => {}
    );
    assert.equal(unknownResponse.statusCode, 500);
    assert.equal(unknownResponse.payload.error.message, "Unexpected explosion");
});
