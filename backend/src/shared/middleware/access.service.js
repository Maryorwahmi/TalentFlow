import AppError from "./app-error.js";
import { ROLES, COURSE_STATUSES } from "../validation/domain.js";
import {
    findCourseById,
    findEnrollment,
    isCourseInstructor
} from "../../modules/learning/repositories/learning.repository.js";

export function assertAuthenticated(actor) {
    if (!actor?.id) {
        throw new AppError(401, "Authentication required.");
    }
}

export function assertRole(actor, ...allowedRoles) {
    assertAuthenticated(actor);

    if (!allowedRoles.includes(actor.role)) {
        throw new AppError(403, "You do not have permission to access this resource.");
    }
}

export async function assertCourseManager(courseId, actor, context) {
    assertAuthenticated(actor);

    if (actor.role === ROLES.ADMIN) {
        return true;
    }

    if (
        actor.role !== ROLES.INSTRUCTOR ||
        !(await isCourseInstructor(courseId, actor.id, context))
    ) {
        throw new AppError(403, "You can only manage your own courses.");
    }

    return true;
}

export async function assertLearnerEnrollment(courseId, actor, context) {
    assertRole(actor, ROLES.LEARNER);

    if (!(await findEnrollment(courseId, actor.id, context))) {
        throw new AppError(403, "You must be enrolled in this course.");
    }
}

export async function assertCourseVisibility(courseId, actor, context) {
    const course = await findCourseById(courseId, context);

    if (!course) {
        throw new AppError(404, "Course not found.");
    }

    if (
        course.status === COURSE_STATUSES.PUBLISHED &&
        course.catalogVisibility === "public"
    ) {
        return course;
    }

    if (!actor?.id) {
        throw new AppError(403, "This course is not publicly available.");
    }

    if (actor.role === ROLES.ADMIN) {
        return course;
    }

    if (
        actor.role === ROLES.INSTRUCTOR &&
        (await isCourseInstructor(courseId, actor.id, context))
    ) {
        return course;
    }

    throw new AppError(403, "You do not have access to this course.");
}
