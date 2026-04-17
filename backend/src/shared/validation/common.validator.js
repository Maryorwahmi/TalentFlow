const ID_PATTERN =
    /^(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function normaliseString(value) {
    return typeof value === "string" ? value.trim() : "";
}

export function buildValidationResult(errors, cleanData = {}) {
    return {
        isValid: errors.length === 0,
        errors,
        cleanData: errors.length === 0 ? cleanData : {}
    };
}

export function validateIdParam(value, label = "id") {
    const errors = [];
    const normalisedValue = String(value || "");

    if (!normalisedValue) {
        errors.push(`${label} is required.`);
    } else if (!ID_PATTERN.test(normalisedValue)) {
        errors.push(`${label} must be a numeric id or UUID.`);
    }

    return buildValidationResult(errors, {
        id: normalisedValue
    });
}
