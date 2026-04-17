import express from "express";
import bcrypt from "bcrypt";
import PDFDocument from 'pdfkit';

import { sendError, sendSuccess } from "../shared/middleware/api-response.js";
import { allowRoles, requireAuth } from "../shared/middleware/auth.middleware.js";
import { signToken, verifyToken } from "../shared/middleware/jwt.js";
import { profileUpload } from "../shared/middleware/profile-upload.middleware.js";
import { env } from "../shared/db/env.js";
import { jsonDb, dbPath } from "./json-database.js";
import { unifiedService } from "./service.js";

const router = express.Router();

function currentUser(request) {
  return jsonDb.findById("users", request.user.id);
}

function authPayload(user) {
  const safeUser = unifiedService.serializeUser(user);
  return {
    userId: Number(user.id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: safeUser.role
  };
}

function issueTokens(user) {
  const accessToken = signToken(authPayload(user));
  const refreshToken = signToken({ ...authPayload(user), type: "refresh" }, "7d");
  unifiedService.createSession(user.id);
  unifiedService.saveRefreshToken(user.id, refreshToken);
  return { accessToken, refreshToken };
}

router.get("/docs", (request, response) =>
  sendSuccess(request, response, 200, {
    name: "TalentFlow unified API",
    database: env.dataSource === "mysql" ? env.mysqlDatabase : "db.json",
    dataSource: env.dataSource,
    path: env.dataSource === "mysql" ? null : dbPath
  })
);

router.get("/docs/json", (request, response) =>
  sendSuccess(request, response, 200, {
    openapi: "not-generated",
    database: env.dataSource === "mysql" ? env.mysqlDatabase : "db.json",
    dataSource: env.dataSource,
    collections: Object.keys(jsonDb.data)
  })
);

router.get("/db", (request, response) => sendSuccess(request, response, 200, jsonDb.data));

router.post("/auth/signup", async (request, response) => {
  try {
    const { firstName, lastName, email, password, role } = request.body || {};
    if (!firstName || !lastName || !email || !password) {
      return sendError(request, response, 400, "First name, last name, email, and password are required.");
    }
    const { user } = await unifiedService.createUser({
      firstName,
      lastName,
      email,
      password,
      role
    });
    const tokens = issueTokens(user);
    return sendSuccess(
      request,
      response,
      201,
      { user: unifiedService.serializeUser(user), ...tokens },
      { message: "Signup successful" }
    );
  } catch (error) {
    return sendError(request, response, 409, error.message);
  }
});

router.post("/auth/login", async (request, response) => {
  const { email, password } = request.body || {};
  const user = await unifiedService.authenticate(email, password);
  if (!user) {
    return sendError(request, response, 401, "Invalid email or password");
  }
  const tokens = issueTokens(user);
  return sendSuccess(
    request,
    response,
    200,
    { user: unifiedService.serializeUser(user), ...tokens },
    { message: "Login successful" }
  );
});

router.post("/auth/logout", (request, response) => sendSuccess(request, response, 200, { ok: true }));

router.post("/auth/refresh", (request, response) => {
  const { refreshToken } = request.body || {};
  try {
    const payload = verifyToken(refreshToken);
    if (payload.type !== "refresh") {
      return sendError(request, response, 401, "Invalid refresh token");
    }
    const user = jsonDb.findById("users", payload.userId);
    if (!user) {
      return sendError(request, response, 401, "Invalid refresh token");
    }
    const tokens = issueTokens(user);
    return sendSuccess(request, response, 200, tokens);
  } catch (error) {
    return sendError(request, response, 401, error.message);
  }
});

router.get("/auth/me", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, { user: unifiedService.serializeUser(currentUser(request)) })
);

router.patch("/auth/profile", requireAuth, profileUpload, (request, response) => {
  // Build update object from request body and file
  const updateData = { ...request.body };
  
  // Handle file upload
  if (request.file) {
    updateData.profilePicture = `/uploads/profile_pictures/${request.file.filename}`;
  } else if (request.body.profilePicture === null) {
    // Allow explicit null to remove profile picture
    updateData.profilePicture = null;
  }
  
  // Parse profileData if it's a string (from FormData)
  if (typeof updateData.profileData === 'string') {
    try {
      updateData.profileData = JSON.parse(updateData.profileData);
    } catch (e) {
      // Keep as is if parsing fails
    }
  }
  
  const updated = jsonDb.update("users", request.user.id, (user) => ({
    ...user,
    ...updateData,
    updatedAt: unifiedService.now()
  }));
  return sendSuccess(request, response, 200, { user: unifiedService.serializeUser(updated) });
});

router.post("/auth/verify-email", (request, response) => {
  const { token } = request.body || {};
  const record = jsonDb.all("email_verification_tokens").find((item) => String(item.token) === String(token));
  if (!record) {
    return sendError(request, response, 400, "Invalid verification token");
  }
  jsonDb.update("users", record.userId, (user) => ({ ...user, isEmailVerified: true, updatedAt: unifiedService.now() }));
  return sendSuccess(request, response, 200, { verified: true });
});

router.post("/auth/resend-verification", (request, response) =>
  sendSuccess(request, response, 200, { sent: true, email: request.body?.email || null })
);

router.get("/notifications", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, { notifications: unifiedService.getUserNotifications(request.user.id) })
);

router.patch("/notifications/:notificationId/read", requireAuth, (request, response) => {
  const notification = jsonDb.findById("notifications", request.params.notificationId);
  if (!notification || String(notification.userId) !== String(request.user.id)) {
    return sendError(request, response, 404, "Notification not found");
  }

  const updated = jsonDb.update("notifications", notification.id, {
    ...notification,
    status: "read",
    readAt: unifiedService.now()
  });

  return sendSuccess(request, response, 200, { notification: updated });
});

router.post("/auth/forgot-password", (request, response) => {
  const { email } = request.body || {};
  const user = jsonDb.all("users").find((item) => item.email === email);
  if (!user) {
    return sendSuccess(request, response, 200, { sent: true });
  }
  const token = String(Math.floor(100000 + Math.random() * 900000));
  jsonDb.insert("password_reset_tokens", {
    userId: user.id,
    token,
    createdAt: unifiedService.now(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  });
  return sendSuccess(request, response, 200, { sent: true, token });
});

router.post("/auth/reset-password", async (request, response) => {
  const { token, password, passwordConfirm } = request.body || {};
  if (!token || !password || password !== passwordConfirm) {
    return sendError(request, response, 400, "Invalid password reset payload");
  }
  const record = jsonDb.all("password_reset_tokens").find((item) => String(item.token) === String(token));
  if (!record) {
    return sendError(request, response, 400, "Invalid password reset token");
  }
  const hashed = await bcrypt.hash(password, 10);
  jsonDb.update("users", record.userId, (user) => ({ ...user, password: hashed, updatedAt: unifiedService.now() }));
  return sendSuccess(request, response, 200, { reset: true });
});

router.get("/account/preferences", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, unifiedService.getUserSettings(request.user.id))
);

router.patch("/account/preferences", requireAuth, (request, response) => {
  const settings = unifiedService.getUserSettings(request.user.id);
  const updated = jsonDb.update("user_settings", settings.id, {
    ...settings,
    ...request.body,
    updatedAt: unifiedService.now()
  });
  return sendSuccess(request, response, 200, updated);
});

router.post("/account/change-password", requireAuth, async (request, response) => {
  const user = currentUser(request);
  const { currentPassword, newPassword } = request.body || {};
  const matches = await bcrypt.compare(currentPassword || "", user.password);
  if (!matches) {
    return sendError(request, response, 400, "Current password is incorrect");
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  jsonDb.update("users", user.id, { ...user, password: hashed, updatedAt: unifiedService.now() });
  return sendSuccess(request, response, 200, { changed: true });
});

router.post("/account/request-email-change", requireAuth, (request, response) => {
  const user = currentUser(request);
  const { newEmail } = request.body || {};
  const updated = jsonDb.update("users", user.id, { ...user, email: newEmail, updatedAt: unifiedService.now() });
  return sendSuccess(request, response, 200, { user: unifiedService.serializeUser(updated) });
});

router.get("/account/notification-preferences", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, unifiedService.getNotificationPreferences(request.user.id))
);

router.patch("/account/notification-preferences", requireAuth, (request, response) => {
  const prefs = unifiedService.getNotificationPreferences(request.user.id);
  const payload = request.body?.preferences || request.body || {};
  const updated = jsonDb.update("notification_preferences", prefs.id, {
    ...prefs,
    ...payload,
    updatedAt: unifiedService.now()
  });
  return sendSuccess(request, response, 200, updated);
});

router.get("/settings", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, {
    settings: {
      ...unifiedService.getUserSettings(request.user.id),
      ...unifiedService.getNotificationPreferences(request.user.id)
    }
  })
);

router.patch("/settings", requireAuth, (request, response) =>
{
  const settings = unifiedService.getUserSettings(request.user.id);
  const prefs = unifiedService.getNotificationPreferences(request.user.id);
  const payload = request.body || {};
  const settingsPayload = payload.settings || payload;
  const notificationKeys = [
    "courseUpdates",
    "assignmentReminders",
    "gradeNotifications",
    "discussionReplies",
    "announcements",
    "emailNotifications",
    "pushNotifications",
    "smsNotifications",
    "realtimeNotifications",
    "submissionNotifications",
    "discussionAlerts",
    "teamMentions"
  ];

  const nextSettings = {};
  const nextPrefs = {};

  Object.entries(settingsPayload || {}).forEach(([key, value]) => {
    if (notificationKeys.includes(key)) {
      nextPrefs[key] = value;
    } else {
      nextSettings[key] = value;
    }
  });

  const updatedSettings = jsonDb.update("user_settings", settings.id, {
    ...settings,
    ...nextSettings,
    updatedAt: unifiedService.now()
  });

  const updatedPrefs = jsonDb.update("notification_preferences", prefs.id, {
    ...prefs,
    ...nextPrefs,
    updatedAt: unifiedService.now()
  });

  return sendSuccess(request, response, 200, {
    settings: {
      ...updatedSettings,
      ...updatedPrefs
    }
  });
});

router.get("/settings/notifications", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, { preferences: unifiedService.getNotificationPreferences(request.user.id) })
);

router.patch("/settings/notifications", requireAuth, (request, response) =>
{
  const prefs = unifiedService.getNotificationPreferences(request.user.id);
  const payload = request.body?.preferences || request.body || {};
  const updated = jsonDb.update("notification_preferences", prefs.id, {
    ...prefs,
    ...payload,
    updatedAt: unifiedService.now()
  });
  return sendSuccess(request, response, 200, { preferences: updated });
});

router.get("/public/home", (request, response) =>
  sendSuccess(request, response, 200, {
    featuredCourses: unifiedService.listPublicCourses().slice(0, 3),
    stats: {
      totalCourses: jsonDb.all("courses").length,
      totalUsers: jsonDb.all("users").length,
      totalTeams: jsonDb.all("teams").length
    }
  })
);

router.get("/courses", (request, response) => {
  const search = String(request.query.q || request.query.search || "").trim().toLowerCase();
  const category = String(request.query.category || "").trim().toLowerCase();
  const level = String(request.query.level || "").trim().toLowerCase();
  const page = Math.max(Number(request.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(request.query.pageSize || 9), 1), 50);

  let courses = unifiedService.listPublicCourses();

  if (search) {
    courses = courses.filter((course) =>
      [course.title, course.description, course.category, course.level]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    );
  }

  if (category && category !== "all") {
    courses = courses.filter((course) => String(course.category || "").toLowerCase() === category);
  }

  if (level && level !== "all") {
    courses = courses.filter((course) => String(course.level || "").toLowerCase() === level);
  }

  const total = courses.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const items = courses.slice((page - 1) * pageSize, page * pageSize);

  return sendSuccess(request, response, 200, {
    courses: items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  });
});

router.get("/courses/:courseId", (request, response) => {
  const course = unifiedService.getCourseDetail(request.params.courseId, request.user?.id);
  if (!course) {
    return sendError(request, response, 404, "Course not found");
  }

  return sendSuccess(request, response, 200, {
    course
  });
});

router.post("/courses/:courseId/enroll", requireAuth, allowRoles("learner", "admin"), (request, response) => {
  const exists = jsonDb
    .all("enrollments")
    .find((item) => String(item.userId) === String(request.user.id) && String(item.courseId) === String(request.params.courseId));
  if (!exists) {
    jsonDb.insert("enrollments", {
      userId: Number(request.user.id),
      courseId: Number(request.params.courseId),
      enrolledAt: unifiedService.now(),
      status: "active",
      completedAt: null
    });
    
    // Create enrollment notification
    const course = jsonDb.findById("courses", request.params.courseId);
    unifiedService.createNotification(request.user.id, {
      title: 'Course Enrollment',
      message: `You have successfully enrolled in ${course?.title || 'a course'}`,
      type: 'success',
      link: `/learner/courses/${request.params.courseId}`
    });
  }
  const course = jsonDb.findById("courses", request.params.courseId);
  return sendSuccess(request, response, 200, { course: unifiedService.enrichCourse(course, request.user.id) });
});

router.get("/courses/:courseId/assignments", requireAuth, (request, response) => {
  const assignments = jsonDb
    .all("assignments")
    .filter((item) => String(item.courseId) === String(request.params.courseId));
  return sendSuccess(request, response, 200, assignments);
});

router.get("/assignments/:assignmentId", requireAuth, (request, response) => {
  const assignment = jsonDb.findById("assignments", request.params.assignmentId);
  if (!assignment) {
    return sendError(request, response, 404, "Assignment not found");
  }
  const course = jsonDb.findById("courses", assignment.courseId);
  return sendSuccess(request, response, 200, {
    ...assignment,
    courseTitle: course?.title || "Course",
    instructions: assignment.description || assignment.instructions || ""
  });
});

router.get("/lessons/:lessonId", requireAuth, (request, response) => {
  const lesson = jsonDb.findById("lessons", request.params.lessonId);
  if (!lesson) {
    return sendError(request, response, 404, "Lesson not found");
  }
  const course = jsonDb.findById("courses", lesson.courseId);
  const module = lesson.moduleId ? jsonDb.findById("course_modules", lesson.moduleId) : null;
  const progress = jsonDb
    .all("lesson_progress")
    .find((item) => String(item.lessonId) === String(lesson.id) && String(item.userId) === String(request.user.id));

  return sendSuccess(request, response, 200, {
    ...lesson,
    courseTitle: course?.title || "Course",
    moduleTitle: module?.title || "Module",
    progress: {
      completed: Boolean(progress?.completed)
    }
  });
});

router.patch("/lessons/:lessonId/progress", requireAuth, (request, response) => {
  const lesson = jsonDb.findById("lessons", request.params.lessonId);
  if (!lesson) {
    return sendError(request, response, 404, "Lesson not found");
  }
  const existing = jsonDb
    .all("lesson_progress")
    .find((item) => String(item.lessonId) === String(lesson.id) && String(item.userId) === String(request.user.id));
  if (existing) {
    jsonDb.update("lesson_progress", existing.id, {
      ...existing,
      completed: Boolean(request.body?.completed),
      completedAt: request.body?.completed ? unifiedService.now() : null,
      updatedAt: unifiedService.now()
    });
  } else {
    jsonDb.insert("lesson_progress", {
      lessonId: Number(lesson.id),
      courseId: Number(lesson.courseId),
      userId: Number(request.user.id),
      completed: Boolean(request.body?.completed),
      completedAt: request.body?.completed ? unifiedService.now() : null,
      updatedAt: unifiedService.now()
    });
  }
  return sendSuccess(request, response, 200, { updated: true });
});

router.get("/learner/dashboard", requireAuth, allowRoles("learner", "admin"), (request, response) =>
  sendSuccess(request, response, 200, unifiedService.getLearnerDashboard(request.user.id))
);

router.get("/learner/courses", requireAuth, allowRoles("learner", "admin"), (request, response) =>
  sendSuccess(request, response, 200, unifiedService.getLearnerCourses(request.user.id))
);

router.get("/learner/progress", requireAuth, allowRoles("learner", "admin"), (request, response) =>
  sendSuccess(request, response, 200, {
    progress: unifiedService.getLearnerCourses(request.user.id).map((course) => ({
      courseId: course.id,
      title: course.title,
      ...course.progress
    }))
  })
);

router.get("/learner/assignments", requireAuth, allowRoles("learner", "admin"), (request, response) =>
  sendSuccess(request, response, 200, unifiedService.getLearnerAssignments(request.user.id))
);

router.get("/learner/submissions/:submissionId", requireAuth, allowRoles("learner", "admin"), (request, response) => {
  const submission = jsonDb.findById("submissions", request.params.submissionId);
  if (!submission) {
    return sendError(request, response, 404, "Submission not found");
  }
  const assignment = jsonDb.findById("assignments", submission.assignmentId);
  return sendSuccess(request, response, 200, {
    ...submission,
    assignment
  });
});

router.get("/learner/certificates", requireAuth, allowRoles("learner", "admin"), (request, response) => {
  const users = jsonDb.all("users");
  const courses = jsonDb.all("courses");
  const certificates = jsonDb
    .all("certificates")
    .filter((item) => String(item.userId) === String(request.user.id))
    .map((item) => {
      const learner = users.find((user) => String(user.id) === String(item.userId));
      const course = courses.find((entry) => String(entry.id) === String(item.courseId));
      const instructor = course
        ? users.find((user) => String(user.id) === String(course.instructorId))
        : null;

      return {
        ...item,
        learnerName: learner ? `${learner.firstName} ${learner.lastName}`.trim() : "Learner",
        courseTitle: course?.title || "Course",
        courseDuration: course?.duration || null,
        courseLevel: course?.level || null,
        instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}`.trim() : "TalentFlow Instructor",
      };
    });

  return sendSuccess(request, response, 200, certificates);
});

router.post("/assignments/:assignmentId/submissions", requireAuth, allowRoles("learner", "admin"), (request, response) => {
  const assignment = jsonDb.findById("assignments", request.params.assignmentId);
  if (!assignment) {
    return sendError(request, response, 404, "Assignment not found");
  }

  const now = unifiedService.now();
  const existing = jsonDb
    .all("submissions")
    .find(
      (item) =>
        String(item.assignmentId) === String(assignment.id) &&
        String(item.userId) === String(request.user.id)
    );
  const payloadContent =
    request.body?.textResponse ||
    request.body?.content ||
    existing?.content ||
    "Submitted from TalentFlow";

  if (existing) {
    const updated = jsonDb.update("submissions", existing.id, {
      ...existing,
      content: payloadContent,
      status: "submitted",
      submittedAt: now,
      updatedAt: now
    });
    return sendSuccess(request, response, 200, { submission: updated });
  }

  const submission = jsonDb.insert("submissions", {
    assignmentId: Number(assignment.id),
    courseId: Number(assignment.courseId),
    userId: Number(request.user.id),
    status: "submitted",
    content: payloadContent,
    submittedAt: now,
    updatedAt: now
  });
  return sendSuccess(request, response, 201, { submission });
});

router.patch("/submissions/:submissionId/draft", requireAuth, allowRoles("learner", "admin"), (request, response) => {
  const submission = jsonDb.findById("submissions", request.params.submissionId);
  if (!submission) {
    return sendError(request, response, 404, "Submission not found");
  }
  const updated = jsonDb.update("submissions", submission.id, {
    ...submission,
    status: "draft",
    content: request.body?.textResponse || request.body?.content || submission.content || "",
    updatedAt: unifiedService.now()
  });
  return sendSuccess(request, response, 200, { submission: updated });
});

router.get("/instructor/courses", requireAuth, allowRoles("instructor", "admin"), (request, response) =>
  sendSuccess(request, response, 200, { courses: unifiedService.getInstructorCourses(request.user.id) })
);

router.get("/instructor/courses/:courseId", requireAuth, allowRoles("instructor", "admin"), (request, response) => {
  const course = jsonDb.findById("courses", request.params.courseId);
  if (!course) {
    return sendError(request, response, 404, "Course not found");
  }
  const lessons = jsonDb
    .all("lessons")
    .filter((item) => String(item.courseId) === String(course.id))
    .sort((left, right) => Number(left.orderIndex || 0) - Number(right.orderIndex || 0));
  const assignments = jsonDb
    .all("assignments")
    .filter((item) => String(item.courseId) === String(course.id))
    .sort((left, right) => Number(left.orderIndex || 0) - Number(right.orderIndex || 0));

  return sendSuccess(request, response, 200, {
    course: {
      ...unifiedService.enrichCourse(course),
      lessons,
      assignments
    }
  });
});

router.post("/instructor/courses", requireAuth, allowRoles("instructor", "admin"), (request, response) => {
  const created = jsonDb.insert("courses", {
    title: request.body?.title,
    description: request.body?.description || "",
    instructorId: Number(request.user.id),
    status: request.body?.status || "draft",
    catalogVisibility: request.body?.catalogVisibility || "public",
    thumbnail: null,
    category: request.body?.category || "general",
    level: request.body?.level || "beginner",
    duration: Number(request.body?.duration || 0),
    maxStudents: Number(request.body?.maxStudents || 100),
    certificateEnabled: true,
    pdfViewerUrl: request.body?.pdfViewerUrl || null,
    liveSessionUrl: request.body?.liveSessionUrl || null,
    documentLinks: Array.isArray(request.body?.documentLinks) ? request.body.documentLinks : [],
    createdAt: unifiedService.now(),
    updatedAt: unifiedService.now()
  });
  jsonDb.insert("course_instructors", {
    courseId: created.id,
    userId: Number(request.user.id),
    role: "instructor",
    createdAt: unifiedService.now()
  });
  unifiedService.logAudit("course.created", request.user.id, "course", created.id, { title: created.title });
  return sendSuccess(request, response, 201, { course: unifiedService.enrichCourse(created) });
});

router.patch("/instructor/courses/:courseId", requireAuth, allowRoles("instructor", "admin"), (request, response) => {
  const course = jsonDb.findById("courses", request.params.courseId);
  if (!course) {
    return sendError(request, response, 404, "Course not found");
  }
  const updated = jsonDb.update("courses", course.id, { ...course, ...request.body, updatedAt: unifiedService.now() });
  return sendSuccess(request, response, 200, { course: unifiedService.enrichCourse(updated) });
});

router.delete("/instructor/courses/:courseId", requireAuth, allowRoles("instructor", "admin"), (request, response) => {
  const course = jsonDb.findById("courses", request.params.courseId);
  if (!course) {
    return sendError(request, response, 404, "Course not found");
  }

  jsonDb
    .all("assignments")
    .filter((item) => String(item.courseId) === String(course.id))
    .forEach((assignment) => jsonDb.delete("assignments", assignment.id));

  jsonDb
    .all("lessons")
    .filter((item) => String(item.courseId) === String(course.id))
    .forEach((lesson) => jsonDb.delete("lessons", lesson.id));

  jsonDb
    .all("course_modules")
    .filter((item) => String(item.courseId) === String(course.id))
    .forEach((module) => jsonDb.delete("course_modules", module.id));

  jsonDb
    .all("enrollments")
    .filter((item) => String(item.courseId) === String(course.id))
    .forEach((enrollment) => jsonDb.delete("enrollments", enrollment.id));

  jsonDb.delete("courses", course.id);
  return sendSuccess(request, response, 200, { deleted: true });
});

router.post("/instructor/courses/:courseId/assignments", requireAuth, allowRoles("instructor", "admin"), (request, response) => {
  const course = jsonDb.findById("courses", request.params.courseId);
  if (!course) {
    return sendError(request, response, 404, "Course not found");
  }

  const assignment = jsonDb.insert("assignments", {
    courseId: Number(course.id),
    title: request.body?.title || "New Assignment",
    description: request.body?.description || "",
    dueDate: request.body?.dueDate || null,
    maxScore: Number(request.body?.maxScore || 100),
    allowResubmission: Boolean(request.body?.allowResubmission),
    orderIndex:
      jsonDb.all("assignments").filter((item) => String(item.courseId) === String(course.id)).length + 1,
    createdAt: unifiedService.now(),
    updatedAt: unifiedService.now()
  });

  return sendSuccess(request, response, 201, { assignment });
});

router.patch("/instructor/assignments/:assignmentId", requireAuth, allowRoles("instructor", "admin"), (request, response) => {
  const assignment = jsonDb.findById("assignments", request.params.assignmentId);
  if (!assignment) {
    return sendError(request, response, 404, "Assignment not found");
  }

  const updated = jsonDb.update("assignments", assignment.id, {
    ...assignment,
    ...request.body,
    updatedAt: unifiedService.now()
  });
  return sendSuccess(request, response, 200, { assignment: updated });
});

router.delete("/instructor/assignments/:assignmentId", requireAuth, allowRoles("instructor", "admin"), (request, response) => {
  const assignment = jsonDb.findById("assignments", request.params.assignmentId);
  if (!assignment) {
    return sendError(request, response, 404, "Assignment not found");
  }

  jsonDb
    .all("submissions")
    .filter((item) => String(item.assignmentId) === String(assignment.id))
    .forEach((submission) => jsonDb.delete("submissions", submission.id));

  jsonDb.delete("assignments", assignment.id);
  return sendSuccess(request, response, 200, { deleted: true });
});

router.get("/instructor/courses/:courseId/learners", requireAuth, allowRoles("instructor", "admin"), (request, response) => {
  const learners = jsonDb
    .all("enrollments")
    .filter((item) => String(item.courseId) === String(request.params.courseId))
    .map((item) => unifiedService.serializeUser(jsonDb.findById("users", item.userId)))
    .filter(Boolean);
  return sendSuccess(request, response, 200, learners);
});

router.get("/instructor/learners", requireAuth, allowRoles("instructor", "admin"), (request, response) =>
  sendSuccess(request, response, 200, unifiedService.getInstructorLearners(request.user.id))
);

router.get("/instructor/submissions", requireAuth, allowRoles("instructor", "admin"), (request, response) =>
  sendSuccess(request, response, 200, unifiedService.getInstructorSubmissions(request.user.id))
);

router.get("/instructor/submissions/:submissionId", requireAuth, allowRoles("instructor", "admin"), (request, response) => {
  const submission = jsonDb.findById("submissions", request.params.submissionId);
  if (!submission) {
    return sendError(request, response, 404, "Submission not found");
  }
  return sendSuccess(request, response, 200, submission);
});

router.patch("/instructor/submissions/:submissionId/grade", requireAuth, allowRoles("instructor", "admin"), (request, response) => {
  const submission = jsonDb.findById("submissions", request.params.submissionId);
  if (!submission) {
    return sendError(request, response, 404, "Submission not found");
  }
  const updated = jsonDb.update("submissions", submission.id, {
    ...submission,
    score: Number(request.body?.score || 0),
    feedback: request.body?.feedback || "",
    status: request.body?.status || "graded",
    gradedAt: unifiedService.now(),
    updatedAt: unifiedService.now()
  });
  
  // Create grading notification for learner
  const assignment = jsonDb.findById("assignments", submission.assignmentId);
  unifiedService.createNotification(submission.userId, {
    title: 'Assignment Graded',
    message: `Your submission for ${assignment?.title || 'an assignment'} has been graded. Score: ${updated.score}`,
    type: updated.score >= 70 ? 'success' : 'info',
    link: `/learner/assignments/${submission.assignmentId}`
  });
  
  return sendSuccess(request, response, 200, { submission: updated });
});

router.get("/instructor/assignments/:assignmentId/submissions", requireAuth, allowRoles("instructor", "admin"), (request, response) => {
  const submissions = jsonDb
    .all("submissions")
    .filter((item) => String(item.assignmentId) === String(request.params.assignmentId));
  return sendSuccess(request, response, 200, submissions);
});

router.get("/admin/dashboard", requireAuth, allowRoles("admin"), (request, response) =>
  sendSuccess(request, response, 200, unifiedService.getAdminDashboard())
);

router.get("/admin/users", requireAuth, allowRoles("admin"), (request, response) =>
  sendSuccess(request, response, 200, { users: unifiedService.getAdminUsers() })
);

router.get("/admin/users/:userId", requireAuth, allowRoles("admin"), (request, response) => {
  const user = unifiedService.serializeUser(jsonDb.findById("users", request.params.userId));
  if (!user) {
    return sendError(request, response, 404, "User not found");
  }
  return sendSuccess(request, response, 200, user);
});

router.patch("/admin/users/:userId/suspend", requireAuth, allowRoles("admin"), (request, response) => {
  const user = jsonDb.findById("users", request.params.userId);
  const updated = jsonDb.update("users", user.id, { ...user, isActive: false, updatedAt: unifiedService.now() });
  return sendSuccess(request, response, 200, { user: unifiedService.serializeUser(updated) });
});

router.patch("/admin/users/:userId/activate", requireAuth, allowRoles("admin"), (request, response) => {
  const user = jsonDb.findById("users", request.params.userId);
  const updated = jsonDb.update("users", user.id, { ...user, isActive: true, updatedAt: unifiedService.now() });
  return sendSuccess(request, response, 200, { user: unifiedService.serializeUser(updated) });
});

router.get("/admin/audit-logs", requireAuth, allowRoles("admin"), (request, response) =>
  sendSuccess(request, response, 200, { logs: jsonDb.all("audit_logs").slice().reverse() })
);

router.get("/admin/settings", requireAuth, allowRoles("admin"), (request, response) =>
  sendSuccess(request, response, 200, { settings: jsonDb.all("platform_settings")[0] || {} })
);

router.patch("/admin/settings", requireAuth, allowRoles("admin"), (request, response) => {
  const current = jsonDb.all("platform_settings")[0];
  const updated = current
    ? jsonDb.update("platform_settings", current.id, { ...current, ...request.body, updatedAt: unifiedService.now() })
    : jsonDb.insert("platform_settings", { ...request.body, updatedAt: unifiedService.now() });
  return sendSuccess(request, response, 200, { settings: updated });
});

router.get("/admin/courses", requireAuth, allowRoles("admin"), (request, response) =>
  sendSuccess(request, response, 200, { courses: jsonDb.all("courses").map((course) => unifiedService.enrichCourse(course)) })
);

router.patch("/admin/courses/:courseId/approve", requireAuth, allowRoles("admin"), (request, response) => {
  const course = jsonDb.findById("courses", request.params.courseId);
  const updated = jsonDb.update("courses", course.id, { ...course, status: "published", updatedAt: unifiedService.now() });
  return sendSuccess(request, response, 200, { course: updated });
});

router.patch("/admin/courses/:courseId/reject", requireAuth, allowRoles("admin"), (request, response) => {
  const course = jsonDb.findById("courses", request.params.courseId);
  const updated = jsonDb.update("courses", course.id, { ...course, status: "draft", updatedAt: unifiedService.now() });
  return sendSuccess(request, response, 200, { course: updated });
});

router.patch("/admin/courses/:courseId/archive", requireAuth, allowRoles("admin"), (request, response) => {
  const course = jsonDb.findById("courses", request.params.courseId);
  const updated = jsonDb.update("courses", course.id, { ...course, status: "archived", updatedAt: unifiedService.now() });
  return sendSuccess(request, response, 200, { course: updated });
});

router.post("/admin/courses/:courseId/enroll", requireAuth, allowRoles("admin"), (request, response) => {
  const created = jsonDb.insert("enrollments", {
    userId: Number(request.body?.userId),
    courseId: Number(request.params.courseId),
    enrolledAt: unifiedService.now(),
    status: "active",
    completedAt: null
  });
  return sendSuccess(request, response, 201, created);
});

router.delete("/admin/courses/:courseId/enroll/:userId", requireAuth, allowRoles("admin"), (request, response) => {
  const enrollment = jsonDb
    .all("enrollments")
    .find((item) => String(item.courseId) === String(request.params.courseId) && String(item.userId) === String(request.params.userId));
  if (enrollment) {
    jsonDb.delete("enrollments", enrollment.id);
  }
  return sendSuccess(request, response, 200, { removed: true });
});

router.get("/admin/notifications", requireAuth, allowRoles("admin"), (request, response) =>
  sendSuccess(request, response, 200, { notifications: unifiedService.getAdminNotifications() })
);

router.post("/admin/notifications", requireAuth, allowRoles("admin"), (request, response) => {
  const payload = request.body || {};
  const targets =
    payload.userId != null
      ? [Number(payload.userId)]
      : jsonDb.all("users").map((user) => Number(user.id));

  const notifications = targets.map((userId) =>
    jsonDb.insert("notifications", {
      userId,
      title: payload.title || "Platform Notification",
      message: payload.message || payload.content || "",
      type: payload.type || "info",
      status: "unread",
      createdAt: unifiedService.now()
    })
  );
  return sendSuccess(request, response, 201, { notifications });
});

router.get("/teams", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, { teams: jsonDb.all("teams").map((team) => unifiedService.getTeamDetails(team)) })
);

router.post("/teams", requireAuth, allowRoles("admin", "instructor"), (request, response) => {
  const team = jsonDb.insert("teams", {
    name: request.body?.name || request.body?.teamName || "New Team",
    description: request.body?.description || "",
    courseId: request.body?.courseId ? Number(request.body.courseId) : null,
    createdBy: Number(request.user.id),
    capacity: Number(request.body?.capacity || 6),
    createdAt: unifiedService.now(),
    updatedAt: unifiedService.now()
  });
  return sendSuccess(request, response, 201, { team: unifiedService.getTeamDetails(team) });
});

router.get("/teams/:teamId", requireAuth, (request, response) => {
  const team = jsonDb.findById("teams", request.params.teamId);
  if (!team) {
    return sendError(request, response, 404, "Team not found");
  }
  return sendSuccess(request, response, 200, { team: unifiedService.getTeamDetails(team) });
});

router.patch("/teams/:teamId", requireAuth, allowRoles("admin", "instructor"), (request, response) => {
  const team = jsonDb.findById("teams", request.params.teamId);
  const updated = jsonDb.update("teams", team.id, { ...team, ...request.body, updatedAt: unifiedService.now() });
  return sendSuccess(request, response, 200, { team: unifiedService.getTeamDetails(updated) });
});

router.delete("/teams/:teamId", requireAuth, allowRoles("admin", "instructor"), (request, response) => {
  jsonDb.delete("teams", request.params.teamId);
  return sendSuccess(request, response, 200, { deleted: true });
});

router.get("/teams/:teamId/members", requireAuth, (request, response) => {
  const members = jsonDb
    .all("team_members")
    .filter((item) => String(item.teamId) === String(request.params.teamId))
    .map((item) => ({
      ...item,
      ...unifiedService.serializeUser(jsonDb.findById("users", item.userId))
    }));
  return sendSuccess(request, response, 200, { members });
});

router.post("/teams/:teamId/members", requireAuth, allowRoles("admin", "instructor", "learner"), (request, response) => {
  const member = jsonDb.insert("team_members", {
    teamId: Number(request.params.teamId),
    userId: Number(request.body?.userId),
    role: request.body?.role || "member",
    joinedAt: unifiedService.now()
  });
  return sendSuccess(request, response, 201, { member });
});

router.delete("/teams/:teamId/members/:userId", requireAuth, allowRoles("admin", "instructor"), (request, response) => {
  const member = jsonDb
    .all("team_members")
    .find((item) => String(item.teamId) === String(request.params.teamId) && String(item.userId) === String(request.params.userId));
  if (member) {
    jsonDb.delete("team_members", member.id);
  }
  return sendSuccess(request, response, 200, { removed: true });
});

router.get("/communication/announcements", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, { announcements: jsonDb.all("announcements").slice().reverse() })
);

router.post("/communication/announcements", requireAuth, allowRoles("admin", "instructor"), (request, response) => {
  const announcement = jsonDb.insert("announcements", {
    title: request.body?.title || "Announcement",
    content: request.body?.content || request.body?.body || "",
    courseId: request.body?.courseId ? Number(request.body.courseId) : null,
    teamId: request.body?.teamId ? Number(request.body.teamId) : null,
    createdBy: Number(request.user.id),
    createdAt: unifiedService.now(),
    updatedAt: unifiedService.now(),
    recipientType: request.body?.recipientType || "all_users",
    recipientIds: request.body?.recipientIds || [],
    notifyVia: request.body?.notifyVia || ["in-platform"]
  });
  return sendSuccess(request, response, 201, { announcement });
});

router.get("/communication/announcements/:announcementId", requireAuth, (request, response) => {
  const announcement = jsonDb.findById("announcements", request.params.announcementId);
  if (!announcement) {
    return sendError(request, response, 404, "Announcement not found");
  }
  return sendSuccess(request, response, 200, { announcement });
});

router.get("/communication/channels", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, { channels: jsonDb.all("channels") })
);

router.post("/communication/channels", requireAuth, allowRoles("admin", "instructor"), (request, response) => {
  const channel = jsonDb.insert("channels", {
    name: request.body?.name || "New Channel",
    description: request.body?.description || "",
    courseId: request.body?.courseId ? Number(request.body.courseId) : null,
    createdBy: Number(request.user.id),
    isPrivate: Boolean(request.body?.isPrivate),
    createdAt: unifiedService.now(),
    updatedAt: unifiedService.now()
  });
  return sendSuccess(request, response, 201, { channel });
});

router.get("/communication/channels/:channelId", requireAuth, (request, response) => {
  const channel = jsonDb.findById("channels", request.params.channelId);
  if (!channel) {
    return sendError(request, response, 404, "Channel not found");
  }
  return sendSuccess(request, response, 200, { channel });
});

router.get("/communication/channels/:channelId/messages", requireAuth, (request, response) => {
  const messages = jsonDb
    .all("messages")
    .filter((item) => String(item.channelId) === String(request.params.channelId))
    .map((message) => ({
      ...message,
      user: unifiedService.serializeUser(jsonDb.findById("users", message.userId))
    }));
  return sendSuccess(request, response, 200, { messages });
});

router.post("/communication/channels/:channelId/messages", requireAuth, (request, response) => {
  const message = jsonDb.insert("messages", {
    channelId: Number(request.params.channelId),
    userId: Number(request.user.id),
    content: request.body?.content || "",
    threadId: null,
    createdAt: unifiedService.now(),
    updatedAt: unifiedService.now()
  });
  return sendSuccess(request, response, 201, { message });
});

router.post("/communication/direct-messages/:recipientId", requireAuth, (request, response) => {
  const message = jsonDb.insert("direct_messages", {
    senderId: Number(request.user.id),
    recipientId: Number(request.params.recipientId),
    content: request.body?.content || "",
    isRead: false,
    createdAt: unifiedService.now(),
    updatedAt: unifiedService.now()
  });
  return sendSuccess(request, response, 201, { message });
});

router.get("/communication/direct-messages/:otherUserId", requireAuth, (request, response) => {
  const messages = jsonDb.all("direct_messages").filter((item) => {
    const mine = String(item.senderId) === String(request.user.id) && String(item.recipientId) === String(request.params.otherUserId);
    const theirs = String(item.senderId) === String(request.params.otherUserId) && String(item.recipientId) === String(request.user.id);
    return mine || theirs;
  });
  return sendSuccess(request, response, 200, { messages });
});

router.get("/communication/direct-messages", requireAuth, (request, response) => {
  const messages = jsonDb
    .all("direct_messages")
    .filter((item) => String(item.senderId) === String(request.user.id) || String(item.recipientId) === String(request.user.id));
  return sendSuccess(request, response, 200, { messages });
});

router.patch("/communication/direct-messages/:messageId/read", requireAuth, (request, response) => {
  const message = jsonDb.findById("direct_messages", request.params.messageId);
  if (!message) {
    return sendError(request, response, 404, "Message not found");
  }
  const updated = jsonDb.update("direct_messages", message.id, { ...message, isRead: true, updatedAt: unifiedService.now() });
  return sendSuccess(request, response, 200, { message: updated });
});

router.get("/analytics/user/progress", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, unifiedService.getLearnerDashboard(request.user.id).progress)
);

router.get("/analytics/instructor/stats", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, unifiedService.getAnalytics().instructor)
);

router.get("/analytics/platform/metrics", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, unifiedService.getAnalytics().platform)
);

router.get("/analytics/course/:courseId", requireAuth, (request, response) => {
  const course = jsonDb.findById("courses", request.params.courseId);
  return sendSuccess(request, response, 200, unifiedService.enrichCourse(course));
});

router.get("/analytics/course/:courseId/learners", requireAuth, (request, response) => {
  const learners = jsonDb.all("enrollments").filter((item) => String(item.courseId) === String(request.params.courseId));
  return sendSuccess(request, response, 200, learners);
});

router.get("/analytics/engagement/metrics", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, {
    messages: jsonDb.all("messages").length,
    channels: jsonDb.all("channels").length,
    teams: jsonDb.all("teams").length
  })
);

router.get("/analytics/platform/active-users", requireAuth, (request, response) =>
  sendSuccess(request, response, 200, { total: jsonDb.all("sessions").length, days: Number(request.query.days || 30) })
);

router.post("/analytics/activity", requireAuth, (request, response) => {
  const activity = jsonDb.insert("user_activity", {
    userId: Number(request.user.id),
    action: request.body?.action || "view",
    resourceId: request.body?.resourceId || null,
    resourceType: request.body?.resourceType || null,
    createdAt: unifiedService.now()
  });
  return sendSuccess(request, response, 201, activity);
});

router.get("/certificates/:certificateId", requireAuth, (request, response) => {
  const certificate = jsonDb.findById("certificates", request.params.certificateId);
  if (!certificate) {
    return sendError(request, response, 404, "Certificate not found");
  }
  return sendSuccess(request, response, 200, certificate);
});

router.get("/certificates/:certificateId/download", requireAuth, (request, response) => {
  const certificate = jsonDb.findById("certificates", request.params.certificateId);
  if (!certificate) {
    return sendError(request, response, 404, "Certificate not found");
  }

  // Check if user has access to this certificate
  if (String(certificate.userId) !== String(request.user.id) && request.user.role !== 'admin') {
    return sendError(request, response, 403, "Unauthorized to access this certificate");
  }

  // Generate PDF
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
  });

  // Set response headers
  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader('Content-Disposition', `attachment; filename="certificate-${certificate.id}.pdf"`);

  // Pipe to response
  doc.pipe(response);

  const users = jsonDb.all("users");
  const learner = users.find((u) => String(u.id) === String(certificate.userId));
  const learnerName = learner ? `${learner.firstName} ${learner.lastName}`.trim() : "Learner";

  const course = jsonDb.findById("courses", certificate.courseId);
  const courseName = course?.title || "Course";
  const courseDuration = course?.duration ? `${course.duration} hours` : "Self-paced";
  const instructor = course ? users.find((u) => String(u.id) === String(course.instructorId)) : null;
  const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}`.trim() : "TalentFlow Instructor";
  const issuedDate = new Date(certificate.issuedAt || certificate.createdAt);
  const formattedIssuedDate = issuedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certificateCode = certificate.certificateCode || `TF-CERT-${certificate.id}`;

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const panelX = 42;
  const panelY = 42;
  const panelWidth = pageWidth - 84;
  const panelHeight = pageHeight - 84;
  const accent = "#f08a2c";
  const ink = "#18214d";
  const soft = "#f7f1e8";
  const muted = "#635f83";

  doc.rect(0, 0, pageWidth, pageHeight).fill("#fffaf4");
  doc.save();
  doc.fillColor("#fff1df").opacity(0.8).circle(90, 90, 72).fill();
  doc.circle(pageWidth - 70, 120, 95).fill("#f7e2c8");
  doc.restore();

  doc.roundedRect(panelX, panelY, panelWidth, panelHeight, 18).fill(soft);
  doc.lineWidth(2).strokeColor(accent).roundedRect(panelX + 10, panelY + 10, panelWidth - 20, panelHeight - 20, 14).stroke();
  doc.lineWidth(0.8).strokeColor("#d9c2a5").roundedRect(panelX + 22, panelY + 22, panelWidth - 44, panelHeight - 44, 10).stroke();

  doc.fillColor(accent).font("Helvetica-Bold").fontSize(14);
  doc.text("TALENTFLOW", panelX, 74, { width: panelWidth, align: "center" });
  doc.fillColor(ink).font("Helvetica-Bold").fontSize(30);
  doc.text("Certificate of Completion", panelX, 98, { width: panelWidth, align: "center" });
  doc.strokeColor(accent).lineWidth(1.5);
  doc.moveTo(200, 145).lineTo(pageWidth - 200, 145).stroke();

  doc.fillColor(muted).font("Helvetica").fontSize(13);
  doc.text("This certificate is proudly presented to", panelX, 170, { width: panelWidth, align: "center" });

  doc.fillColor(ink).font("Helvetica-Bold").fontSize(28);
  doc.text(learnerName, panelX + 60, 205, { width: panelWidth - 120, align: "center" });

  doc.strokeColor(accent).lineWidth(1);
  doc.moveTo(160, 246).lineTo(pageWidth - 160, 246).stroke();

  doc.fillColor(muted).font("Helvetica").fontSize(13);
  doc.text("for successfully completing the course requirements, lessons, and assessments for", panelX + 72, 266, {
    width: panelWidth - 144,
    align: "center",
  });

  doc.fillColor(accent).font("Helvetica-Bold").fontSize(22);
  doc.text(courseName, panelX + 70, 320, {
    width: panelWidth - 140,
    align: "center",
  });

  doc.fillColor(ink).font("Helvetica").fontSize(12);
  doc.text(
    `Delivered by ${instructorName} with a learning duration of ${courseDuration}. This achievement reflects dedication, consistency, and demonstrated mastery within the TalentFlow learning experience.`,
    panelX + 82,
    362,
    {
      width: panelWidth - 164,
      align: "center",
      lineGap: 4,
    }
  );

  doc.roundedRect(110, 454, 155, 82, 12).fill("#fff8ee");
  doc.roundedRect(290, 454, 155, 82, 12).fill("#fff8ee");
  doc.roundedRect(470, 454, 155, 82, 12).fill("#fff8ee");

  doc.fillColor(muted).font("Helvetica").fontSize(10);
  doc.text("Issue Date", 110, 468, { width: 155, align: "center" });
  doc.fillColor(ink).font("Helvetica-Bold").fontSize(12);
  doc.text(formattedIssuedDate, 110, 490, { width: 155, align: "center" });

  doc.fillColor(muted).font("Helvetica").fontSize(10);
  doc.text("Instructor", 290, 468, { width: 155, align: "center" });
  doc.fillColor(ink).font("Helvetica-Bold").fontSize(12);
  doc.text(instructorName, 300, 490, { width: 135, align: "center" });

  doc.fillColor(muted).font("Helvetica").fontSize(10);
  doc.text("Credential ID", 470, 468, { width: 155, align: "center" });
  doc.fillColor(ink).font("Helvetica-Bold").fontSize(12);
  doc.text(certificateCode, 480, 490, { width: 135, align: "center" });

  doc.strokeColor("#c8a97e").lineWidth(1.2);
  doc.moveTo(120, 630).lineTo(300, 630).stroke();
  doc.moveTo(410, 630).lineTo(590, 630).stroke();

  doc.font("Helvetica-Oblique").fontSize(20).fillColor(accent);
  doc.text("Johnson T.", 130, 600, { width: 160, align: "center" });
  doc.font("Helvetica").fontSize(10).fillColor(ink);
  doc.text("Programme Director", 120, 638, { width: 180, align: "center" });

  doc.font("Helvetica-Oblique").fontSize(20).fillColor(accent);
  doc.text(instructorName, 420, 600, { width: 160, align: "center" });
  doc.font("Helvetica").fontSize(10).fillColor(ink);
  doc.text("Lead Instructor", 410, 638, { width: 180, align: "center" });

  doc.save();
  doc.lineWidth(2.5).strokeColor(accent).opacity(0.8);
  doc.circle(pageWidth / 2, 600, 42).stroke();
  doc.circle(pageWidth / 2, 600, 33).stroke();
  doc.font("Helvetica-Bold").fontSize(10).fillColor(accent);
  doc.text("OFFICIAL", pageWidth / 2 - 20, 585, { width: 40, align: "center" });
  doc.text("STAMP", pageWidth / 2 - 18, 598, { width: 36, align: "center" });
  doc.restore();

  doc.fontSize(9).fillColor("#756d8c");
  doc.text("TalentFlow certifies that this learner has met the completion standard for this course.", panelX, pageHeight - 62, {
    width: panelWidth,
    align: "center",
  });

  // Finalize PDF
  doc.end();
});

// ============================================
// Contact & Feedback Routes
// ============================================

router.post("/contact", (request, response) => {
  const { name, email, subject, message, userId, type } = request.body || {};
  
  if (!email || !message) {
    return sendError(request, response, 400, "Email and message are required.");
  }
  
  const feedback = jsonDb.insert("contact_submissions", {
    userId: userId ? Number(userId) : (request.user?.id ? Number(request.user.id) : null),
    name: name || (request.user?.firstName && request.user?.lastName ? `${request.user.firstName} ${request.user.lastName}` : "Anonymous"),
    email: email,
    subject: subject || "General Feedback",
    message: message,
    type: type || "feedback",
    status: "new",
    createdAt: unifiedService.now(),
    updatedAt: unifiedService.now()
  });
  
  // Log audit event
  unifiedService.logAudit("contact.submitted", request.user?.id || null, "contact", feedback.id, { type });
  
  return sendSuccess(
    request,
    response,
    201,
    { feedback, message: "Thank you for your feedback! We'll review it shortly." },
    { message: "Feedback submitted successfully" }
  );
});

router.get("/contact", requireAuth, allowRoles("admin"), (request, response) => {
  const allFeedback = jsonDb.all("contact_submissions").sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  return sendSuccess(request, response, 200, { feedback: allFeedback, total: allFeedback.length });
});

router.get("/contact/:feedbackId", requireAuth, allowRoles("admin"), (request, response) => {
  const feedback = jsonDb.findById("contact_submissions", request.params.feedbackId);
  if (!feedback) {
    return sendError(request, response, 404, "Feedback not found.");
  }
  return sendSuccess(request, response, 200, feedback);
});

router.patch("/contact/:feedbackId", requireAuth, allowRoles("admin"), (request, response) => {
  const feedback = jsonDb.findById("contact_submissions", request.params.feedbackId);
  if (!feedback) {
    return sendError(request, response, 404, "Feedback not found.");
  }
  const updated = jsonDb.update("contact_submissions", feedback.id, {
    ...feedback,
    status: request.body?.status || feedback.status,
    response: request.body?.response || feedback.response,
    respondedBy: request.user.id,
    respondedAt: request.body?.response ? unifiedService.now() : feedback.respondedAt,
    updatedAt: unifiedService.now()
  });
  
  unifiedService.logAudit("contact.responded", request.user.id, "contact", updated.id, { status: updated.status });
  
  return sendSuccess(request, response, 200, updated);
});

router.delete("/contact/:feedbackId", requireAuth, allowRoles("admin"), (request, response) => {
  const feedback = jsonDb.findById("contact_submissions", request.params.feedbackId);
  if (!feedback) {
    return sendError(request, response, 404, "Feedback not found.");
  }
  jsonDb.delete("contact_submissions", feedback.id);
  return sendSuccess(request, response, 200, { deleted: true });
});

// ============================================
// Phase 1 & 2: Course Catalog & Study Area Routes
// ============================================

// Get all modules for a course
router.get("/courses/:courseId/modules", (request, response) => {
  const modules = jsonDb
    .all("course_modules")
    .filter((item) => String(item.courseId) === String(request.params.courseId))
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  
  return sendSuccess(request, response, 200, { modules });
});

// Get all lessons for a course
router.get("/courses/:courseId/lessons", (request, response) => {
  const lessons = jsonDb
    .all("lessons")
    .filter((item) => String(item.courseId) === String(request.params.courseId))
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  
  return sendSuccess(request, response, 200, { lessons });
});

// Get course reviews
router.get("/courses/:courseId/reviews", (request, response) => {
  const reviews = jsonDb
    .all("course_reviews")
    .filter((item) => String(item.courseId) === String(request.params.courseId));
  
  return sendSuccess(request, response, 200, { reviews });
});

// Get aggregated course ratings
router.get("/courses/:courseId/ratings", (request, response) => {
  const ratings = jsonDb
    .all("course_reviews_aggregate")
    .find((item) => String(item.courseId) === String(request.params.courseId));
  
  if (!ratings) {
    return sendSuccess(request, response, 200, { 
      averageRating: 0, 
      totalReviews: 0, 
      ratingDistribution: {} 
    });
  }
  
  return sendSuccess(request, response, 200, ratings);
});

// Post a course review
router.post("/courses/:courseId/reviews", requireAuth, allowRoles("learner", "admin"), (request, response) => {
  const { rating, title, content } = request.body;
  
  if (!rating || !title || !content) {
    return sendError(request, response, 400, "Rating, title, and content are required");
  }
  
  if (rating < 1 || rating > 5) {
    return sendError(request, response, 400, "Rating must be between 1 and 5");
  }
  
  const review = {
    id: jsonDb.nextId("course_reviews"),
    courseId: Number(request.params.courseId),
    userId: Number(request.user.id),
    rating: Number(rating),
    title,
    content,
    helpfulCount: 0,
    createdAt: unifiedService.now()
  };
  
  jsonDb.insert("course_reviews", review);
  
  // Update aggregated ratings
  const courseReviews = jsonDb
    .all("course_reviews")
    .filter((r) => String(r.courseId) === String(request.params.courseId));
  
  const avgRating = courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length;
  const ratingDistribution = {
    5: courseReviews.filter((r) => r.rating === 5).length,
    4: courseReviews.filter((r) => r.rating === 4).length,
    3: courseReviews.filter((r) => r.rating === 3).length,
    2: courseReviews.filter((r) => r.rating === 2).length,
    1: courseReviews.filter((r) => r.rating === 1).length
  };
  
  const existing = jsonDb
    .all("course_reviews_aggregate")
    .find((item) => String(item.courseId) === String(request.params.courseId));
  
  if (existing) {
    jsonDb.update("course_reviews_aggregate", existing.id, {
      courseId: Number(request.params.courseId),
      averageRating: avgRating,
      totalReviews: courseReviews.length,
      ratingDistribution
    });
  } else {
    jsonDb.insert("course_reviews_aggregate", {
      id: jsonDb.nextId("course_reviews_aggregate"),
      courseId: Number(request.params.courseId),
      averageRating: avgRating,
      totalReviews: courseReviews.length,
      ratingDistribution
    });
  }
  
  return sendSuccess(request, response, 201, { review });
});

// Get quizzes for a course
router.get("/courses/:courseId/quizzes", (request, response) => {
  const quizzes = jsonDb
    .all("quizzes")
    .filter((item) => String(item.courseId) === String(request.params.courseId))
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  
  return sendSuccess(request, response, 200, { quizzes });
});

// Get quiz questions
router.get("/quizzes/:quizId/questions", (request, response) => {
  const questions = jsonDb
    .all("quiz_questions")
    .filter((item) => String(item.quizId) === String(request.params.quizId))
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  
  return sendSuccess(request, response, 200, { questions });
});

// Submit quiz attempt
router.post("/quizzes/:quizId/attempts", requireAuth, (request, response) => {
  const { answers } = request.body;
  
  if (!answers) {
    return sendError(request, response, 400, "Answers are required");
  }
  
  const quiz = jsonDb.findById("quizzes", request.params.quizId);
  if (!quiz) {
    return sendError(request, response, 404, "Quiz not found");
  }
  
  // Get all questions for this quiz
  const questions = jsonDb
    .all("quiz_questions")
    .filter((item) => String(item.quizId) === String(request.params.quizId));
  
  // Calculate score
  let correctCount = 0;
  const answersMap = answers || {};
  
  questions.forEach((question) => {
    if (String(answersMap[question.id]) === String(question.correctAnswer)) {
      correctCount++;
    }
  });
  
  const score = (correctCount / questions.length) * 100;
  const passed = score >= quiz.passingScore;
  
  const attempt = {
    id: jsonDb.nextId("quiz_attempts"),
    userId: Number(request.user.id),
    quizId: Number(request.params.quizId),
    courseId: quiz.courseId,
    score: Math.round(score),
    passed,
    startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Assume 5 min duration
    completedAt: unifiedService.now(),
    answers: answersMap
  };
  
  jsonDb.insert("quiz_attempts", attempt);
  
  return sendSuccess(request, response, 201, { 
    attempt,
    result: {
      score: Math.round(score),
      passed,
      correctAnswers: correctCount,
      totalQuestions: questions.length
    }
  });
});

// Mark lesson as complete
router.post("/lessons/:lessonId/complete", requireAuth, (request, response) => {
  const lesson = jsonDb.findById("lessons", request.params.lessonId);
  if (!lesson) {
    return sendError(request, response, 404, "Lesson not found");
  }
  
  const existing = jsonDb
    .all("lesson_progress")
    .find((item) => String(item.lessonId) === String(lesson.id) && String(item.userId) === String(request.user.id));
  
  if (existing) {
    jsonDb.update("lesson_progress", existing.id, {
      ...existing,
      completed: true,
      completedAt: unifiedService.now()
    });
  } else {
    jsonDb.insert("lesson_progress", {
      id: jsonDb.nextId("lesson_progress"),
      userId: Number(request.user.id),
      lessonId: Number(lesson.id),
      courseId: Number(lesson.courseId),
      completed: true,
      completedAt: unifiedService.now(),
      timeSpent: 0,
      notes: ""
    });
  }
  
  return sendSuccess(request, response, 200, { completed: true });
});

export default router;
