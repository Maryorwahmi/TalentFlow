import { COURSE_STATUSES } from "./domain.js";
import {
    buildValidationResult,
    normaliseString
} from "./common.validator.js";

const ALLOWED_CATALOG_VISIBILITY = new Set(["public", "private"]);

function validateLesson(lesson, moduleIndex, lessonIndex, errors) {
    const title = normaliseString(lesson.title);
    const content = normaliseString(lesson.content);

    if (!title) {
        errors.push(`modules[${moduleIndex}].lessons[${lessonIndex}].title is required.`);
    }

    if (!content) {
        errors.push(`modules[${moduleIndex}].lessons[${lessonIndex}].content is required.`);
    }

    return {
        title,
        content,
        contentType: normaliseString(lesson.contentType) || "markdown",
        isPreview: Boolean(lesson.isPreview),
        durationMinutes: Number(lesson.durationMinutes || 10),
        orderIndex: Number(lesson.orderIndex || lessonIndex + 1)
    };
}

function validateModule(moduleInput, moduleIndex, errors) {
    const title = normaliseString(moduleInput.title);

    if (!title) {
        errors.push(`modules[${moduleIndex}].title is required.`);
    }

    const lessons = Array.isArray(moduleInput.lessons)
        ? moduleInput.lessons.map((lesson, lessonIndex) =>
              validateLesson(lesson, moduleIndex, lessonIndex, errors)
          )
        : [];

    if (lessons.length === 0) {
        errors.push(`modules[${moduleIndex}] must include at least one lesson.`);
    }

    return {
        title,
        description: normaliseString(moduleInput.description),
        orderIndex: Number(moduleInput.orderIndex || moduleIndex + 1),
        lessons
    };
}

function validateAssignment(assignmentInput, assignmentIndex, errors) {
    const title = normaliseString(assignmentInput.title);
    const description = normaliseString(assignmentInput.description);
    const dueDate = assignmentInput.dueDate ? new Date(assignmentInput.dueDate) : null;
    const maxScore = Number(assignmentInput.maxScore);

    if (!title) {
        errors.push(`assignments[${assignmentIndex}].title is required.`);
    }

    if (!description) {
        errors.push(`assignments[${assignmentIndex}].description is required.`);
    }

    if (!assignmentInput.dueDate || Number.isNaN(dueDate?.getTime?.())) {
        errors.push(`assignments[${assignmentIndex}].dueDate must be valid.`);
    }

    if (Number.isNaN(maxScore) || maxScore <= 0) {
        errors.push(`assignments[${assignmentIndex}].maxScore must be greater than zero.`);
    }

    return {
        title,
        description,
        dueDate: dueDate?.toISOString?.() || assignmentInput.dueDate,
        maxScore
    };
}

export function validateCoursePayload(body = {}, { partial = false } = {}) {
    const errors = [];

    const title = normaliseString(body.title);
    const description = normaliseString(body.description);
    const status = normaliseString(body.status) || COURSE_STATUSES.DRAFT;
    const category = normaliseString(body.category) || "general";
    const catalogVisibility =
        normaliseString(body.catalogVisibility) || "public";

    if (!partial || body.title !== undefined) {
        if (!title) {
            errors.push("title is required.");
        }
    }

    if (!partial || body.description !== undefined) {
        if (!description) {
            errors.push("description is required.");
        }
    }

    if (!Object.values(COURSE_STATUSES).includes(status)) {
        errors.push("status must be draft, published, or archived.");
    }

    if (!ALLOWED_CATALOG_VISIBILITY.has(catalogVisibility)) {
        errors.push("catalogVisibility must be public or private.");
    }

    const instructorIds = Array.isArray(body.instructorIds)
        ? body.instructorIds.map(String)
        : undefined;

    if (body.instructorIds !== undefined && instructorIds.length === 0) {
        errors.push("instructorIds must include at least one instructor id.");
    }

    const modules = Array.isArray(body.modules)
        ? body.modules.map((moduleInput, moduleIndex) =>
              validateModule(moduleInput, moduleIndex, errors)
          )
        : partial
          ? undefined
          : [];

    if (!partial && modules.length === 0) {
        errors.push("modules must include at least one module.");
    }

    const assignments = Array.isArray(body.assignments)
        ? body.assignments.map((assignmentInput, assignmentIndex) =>
              validateAssignment(assignmentInput, assignmentIndex, errors)
          )
        : undefined;

    return buildValidationResult(errors, {
        title,
        description,
        status,
        category,
        catalogVisibility,
        certificateEnabled:
            body.certificateEnabled === undefined
                ? true
                : Boolean(body.certificateEnabled),
        instructorIds,
        modules,
        assignments
    });
}
