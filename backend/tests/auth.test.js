import test from "node:test";
import assert from "node:assert/strict";

import { resetStore } from "../src/shared/db/store.js";
import AppError from "../src/shared/middleware/app-error.js";
import {
    allowRoles,
    optionalAuth,
    requireAuth
} from "../src/shared/middleware/auth.middleware.js";
import { tokenForEmail } from "./helpers/token-fixtures.js";

function createRequest(token = null) {
    return {
        headers: token
            ? {
                  authorization: `Bearer ${token}`
              }
            : {}
    };
}

test("requireAuth attaches the BE-1-provided JWT payload to request.user", async () => {
    resetStore();

    const request = createRequest(tokenForEmail("learner@talentflow.test"));

    await new Promise((resolve, reject) => {
        requireAuth(request, null, (error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });

    assert.equal(request.user.id, "3");
    assert.equal(request.user.role, "learner");
});

test("optionalAuth ignores missing tokens and allowRoles blocks disallowed actors", async () => {
    resetStore();
    const anonymousRequest = createRequest();

    await new Promise((resolve, reject) => {
        optionalAuth(anonymousRequest, null, (error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });

    assert.equal(anonymousRequest.user, undefined);

    const learnerRequest = createRequest(tokenForEmail("learner@talentflow.test"));

    await new Promise((resolve, reject) => {
        requireAuth(learnerRequest, null, (error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });

    const adminOnly = allowRoles("admin");

    await assert.rejects(
        () =>
            new Promise((resolve, reject) => {
                adminOnly(learnerRequest, null, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            }),
        (error) =>
            error instanceof AppError &&
            error.statusCode === 403 &&
            /permission/i.test(error.message)
    );
});
