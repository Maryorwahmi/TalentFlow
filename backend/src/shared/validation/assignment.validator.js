import {
    buildValidationResult,
    normaliseString
} from "./common.validator.js";

export function validateAssignmentSubmissionPayload(body = {}, files = []) {
    const errors = [];
    const textResponse = normaliseString(body.textResponse);

    if ((!files || files.length === 0) && !textResponse) {
        errors.push("A submission must include textResponse or at least one file.");
    }

    return buildValidationResult(errors, {
        textResponse
    });
}
