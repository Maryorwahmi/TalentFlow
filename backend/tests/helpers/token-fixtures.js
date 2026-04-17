import { getStateSnapshot } from "../../src/shared/db/store.js";
import { signToken } from "../../src/shared/middleware/jwt.js";

export function getFixtureUserByEmail(email) {
    const user = getStateSnapshot().users.find(
        (candidate) => candidate.email.toLowerCase() === String(email).toLowerCase()
    );

    if (!user) {
        throw new Error(`Missing test fixture user for email: ${email}`);
    }

    return user;
}

export function tokenForEmail(email) {
    const user = getFixtureUserByEmail(email);

    return signToken({
        userId: user.id,
        role: user.role,
        email: user.email
    });
}

export function bearerHeadersForEmail(email, extraHeaders = {}) {
    return {
        Authorization: `Bearer ${tokenForEmail(email)}`,
        ...extraHeaders
    };
}
