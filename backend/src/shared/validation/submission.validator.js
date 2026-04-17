import {
    buildValidationResult,
    normaliseString
} from "./common.validator.js";

export function validateGradePayload(body = {}, maxScore) {
    const errors = [];
    const score = Number(body.score);
    const feedback = normaliseString(body.feedback);
    const rubric = body.rubric ?? null;

    if (body.score === undefined || body.score === null || body.score === "") {
        errors.push("score is required.");
    } else if (Number.isNaN(score)) {
        errors.push("score must be numeric.");
    } else if (score < 0) {
        errors.push("score cannot be less than zero.");
    }

    if (
        maxScore !== undefined &&
        maxScore !== null &&
        !Number.isNaN(Number(maxScore)) &&
        !Number.isNaN(score) &&
        score > Number(maxScore)
    ) {
        errors.push("score cannot be greater than the assignment max score.");
    }

    return buildValidationResult(errors, {
        score,
        feedback,
        rubric
    });
}
