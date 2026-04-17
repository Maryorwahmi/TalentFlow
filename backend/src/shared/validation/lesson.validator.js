import {
    buildValidationResult
} from "./common.validator.js";

export function validateLessonProgressPayload(body = {}) {
    const completed =
        body.completed === undefined ? true : Boolean(body.completed);

    return buildValidationResult([], {
        completed
    });
}
