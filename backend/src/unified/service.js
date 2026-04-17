import bcrypt from "bcrypt";

import { jsonDb } from "./json-database.js";

function now() {
  return new Date().toISOString();
}

function toName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
}

function getUserRole(userId) {
  const link = jsonDb.all("user_roles").find((item) => String(item.userId) === String(userId));
  if (!link) {
    return "learner";
  }
  return jsonDb.findById("roles", link.roleId)?.name || "learner";
}

function serializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: String(user.id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: getUserRole(user.id),
    status: user.isActive ? "active" : "inactive",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    bio: user.bio || "",
    profilePicture: user.profilePicture || null,
    phone: user.phone || null,
    profileData: user.profileData || null
  };
}

function getUserSettings(userId) {
  return (
    jsonDb.all("user_settings").find((item) => String(item.userId) === String(userId)) ||
    jsonDb.insert("user_settings", {
      userId: Number(userId),
      theme: "light",
      language: "en",
      timezone: "Africa/Lagos",
      notificationsEnabled: true,
      emailNotifications: true,
      createdAt: now(),
      updatedAt: now()
    })
  );
}

function getNotificationPreferences(userId) {
  return (
    jsonDb.all("notification_preferences").find((item) => String(item.userId) === String(userId)) ||
    jsonDb.insert("notification_preferences", {
      userId: Number(userId),
      courseUpdates: true,
      assignmentReminders: true,
      gradeNotifications: true,
      discussionReplies: true,
      announcements: true,
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      realtimeNotifications: true,
      createdAt: now()
    })
  );
}

function getCourseLessons(courseId) {
  return jsonDb
    .all("lessons")
    .filter((item) => String(item.courseId) === String(courseId))
    .sort((left, right) => Number(left.orderIndex || 0) - Number(right.orderIndex || 0));
}

function getCourseAssignments(courseId) {
  return jsonDb
    .all("assignments")
    .filter((item) => String(item.courseId) === String(courseId))
    .sort((left, right) => Number(left.orderIndex || 0) - Number(right.orderIndex || 0));
}

function getCourseModules(courseId) {
  return jsonDb
    .all("course_modules")
    .filter((item) => String(item.courseId) === String(courseId))
    .sort((left, right) => Number(left.orderIndex || 0) - Number(right.orderIndex || 0));
}

const COURSE_BLUEPRINTS = [
  {
    matchTerms: ["ui/ux", "ui ux", "ux", "product design"],
    discipline: "UI/UX Design",
    tagline: "Blend research, interface thinking, and product clarity into digital experiences people actually enjoy using.",
    coreSections: [
      "User Research",
      "Interaction Design (UX)",
      "Visual Design (UI)",
      "Prototyping & Testing"
    ],
    branches: ["UX Researcher", "UI Designer", "Product Designer", "Interaction Designer"],
    keyTopics: [
      "User personas and journey mapping",
      "Wireframing and prototyping in Figma",
      "Usability testing",
      "Design systems",
      "Accessibility and WCAG fundamentals"
    ],
    learningFocus:
      "Start with UX fundamentals, move into visual interface design, then master Figma workflows and finish with portfolio-ready product case studies.",
    recommendedBooks: [
      { title: "Don't Make Me Think", author: "Steve Krug", reason: "A practical introduction to usability and intuitive interfaces." },
      { title: "The Design of Everyday Things", author: "Don Norman", reason: "Build strong interaction instincts from timeless design psychology." },
      { title: "Hooked", author: "Nir Eyal", reason: "Understand behaviour, habit loops, and product engagement patterns." }
    ],
    teachingHighlights: [
      "Research interviews, persona drafting, and journey map creation",
      "Low-fidelity wireframes before polished interfaces",
      "Interactive Figma prototypes with guided critique",
      "Usability test scripts and iteration checkpoints"
    ]
  },
  {
    matchTerms: ["data science", "data", "machine learning", "ai"],
    discipline: "Data Science",
    tagline: "Learn to turn raw data into insight, prediction, and business decisions with a solid analytical workflow.",
    coreSections: [
      "Mathematics & Statistics",
      "Programming",
      "Data Analysis",
      "Machine Learning"
    ],
    branches: ["Data Analyst", "Machine Learning Engineer", "AI Engineer", "Data Engineer"],
    keyTopics: [
      "Python with Pandas and NumPy",
      "Data visualization with Matplotlib and Power BI",
      "Probability and statistics",
      "Machine learning algorithms",
      "SQL and database querying"
    ],
    learningFocus:
      "Start with Python and data analysis, strengthen your statistics, then step into machine learning with practical projects and storytelling dashboards.",
    recommendedBooks: [
      { title: "Python for Data Analysis", author: "Wes McKinney", reason: "Excellent foundation for analysis with Pandas and NumPy." },
      { title: "Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow", author: "Aurelien Geron", reason: "A project-friendly path into modern ML workflows." },
      { title: "Storytelling With Data", author: "Cole Nussbaumer Knaflic", reason: "Helps learners communicate findings clearly to stakeholders." }
    ],
    teachingHighlights: [
      "Python notebooks for cleaning, exploration, and feature thinking",
      "Visualization exercises that explain real patterns",
      "SQL practice tied to product and business questions",
      "End-of-course mini models and performance reflection"
    ]
  },
  {
    matchTerms: ["backend", "api", "server", "node"],
    discipline: "Backend Development",
    tagline: "Build the systems, APIs, databases, and deployment habits that power secure and scalable software.",
    coreSections: [
      "Server-side Programming",
      "Databases",
      "APIs",
      "System Design"
    ],
    branches: ["Backend Engineer", "API Developer", "DevOps Engineer"],
    keyTopics: [
      "Languages like Node.js, Python, or Java",
      "REST and GraphQL APIs",
      "SQL and NoSQL databases",
      "Authentication and security",
      "Cloud services, Docker, and deployment"
    ],
    learningFocus:
      "Choose one backend language, learn how data is stored, build APIs around real use cases, then deploy and observe your applications.",
    recommendedBooks: [
      { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", reason: "A strong systems-thinking book for long-term backend growth." },
      { title: "Node.js Design Patterns", author: "Mario Casciaro and Luciano Mammino", reason: "Useful for structuring maintainable backend applications." },
      { title: "Web API Design", author: "Brian Mulloy", reason: "Helps learners think clearly about practical API design." }
    ],
    teachingHighlights: [
      "Database modelling and query design",
      "Authentication, authorization, and security hygiene",
      "API implementation with validation and error handling",
      "Deployment practice with Docker and cloud-ready workflows"
    ]
  },
  {
    matchTerms: ["project management", "scrum", "agile", "program manager"],
    discipline: "Project Management",
    tagline: "Plan, coordinate, and deliver meaningful work with structure, communication, and healthy execution habits.",
    coreSections: [
      "Planning & Scheduling",
      "Execution",
      "Risk Management",
      "Team Management"
    ],
    branches: ["Agile Project Manager", "Scrum Master", "Program Manager"],
    keyTopics: [
      "Agile and Scrum frameworks",
      "Gantt charts and roadmaps",
      "Budgeting and resource planning",
      "Stakeholder communication",
      "Tools such as Jira and Trello"
    ],
    learningFocus:
      "Learn Agile principles first, then practice planning, tracking, and stakeholder updates on increasingly realistic projects.",
    recommendedBooks: [
      { title: "Scrum: The Art of Doing Twice the Work in Half the Time", author: "Jeff Sutherland", reason: "A strong starting point for agile delivery." },
      { title: "Making Things Happen", author: "Scott Berkun", reason: "Balances planning theory with practical team leadership." },
      { title: "Project Management Absolute Beginner's Guide", author: "Greg Horine", reason: "Clear entry point for new project managers." }
    ],
    teachingHighlights: [
      "Project kickoff documents and milestone planning",
      "Risk logs, issue tracking, and communication cadences",
      "Sprint planning and backlog refinement practice",
      "Retrospectives that turn chaos into better systems"
    ]
  },
  {
    matchTerms: ["graphics", "graphic design", "brand design", "illustrator"],
    discipline: "Graphics Design",
    tagline: "Use typography, colour, and composition to create visuals that communicate clearly and feel memorable.",
    coreSections: [
      "Design Principles",
      "Branding",
      "Digital Design",
      "Print Design"
    ],
    branches: ["Brand Designer", "Illustrator", "Motion Designer"],
    keyTopics: [
      "Typography and colour theory",
      "Adobe Photoshop and Illustrator",
      "Logo design",
      "Social media design",
      "Layout and composition"
    ],
    learningFocus:
      "Master visual fundamentals, learn the tools, and apply them through practical brand assets and portfolio projects.",
    recommendedBooks: [
      { title: "Thinking with Type", author: "Ellen Lupton", reason: "A sharp foundation for typography and hierarchy." },
      { title: "Logo Design Love", author: "David Airey", reason: "Practical for learners entering identity and branding work." },
      { title: "The Non-Designer's Design Book", author: "Robin Williams", reason: "Great for fundamentals of layout, alignment, and contrast." }
    ],
    teachingHighlights: [
      "Typography and colour exercises with critique",
      "Brand identity development from moodboard to final assets",
      "Social graphics and campaign-ready visual systems",
      "Portfolio polishing and presentation guidance"
    ]
  },
  {
    matchTerms: ["frontend", "react", "web design", "javascript"],
    discipline: "Frontend Development",
    tagline: "Create fast, responsive interfaces that bring product ideas to life in the browser.",
    coreSections: [
      "Web Fundamentals",
      "UI Development",
      "Frameworks",
      "Performance Optimization"
    ],
    branches: ["Frontend Engineer", "React Developer", "Web Designer"],
    keyTopics: [
      "HTML, CSS, and JavaScript",
      "Responsive design",
      "Frameworks such as React or Vue",
      "API integration",
      "Web performance"
    ],
    learningFocus:
      "Start with HTML and CSS, build JavaScript confidence, then move into component frameworks and real responsive applications.",
    recommendedBooks: [
      { title: "Eloquent JavaScript", author: "Marijn Haverbeke", reason: "A strong JavaScript foundation with real reasoning." },
      { title: "Learning React", author: "Alex Banks and Eve Porcello", reason: "Friendly introduction to modern component thinking." },
      { title: "Refactoring UI", author: "Adam Wathan and Steve Schoger", reason: "Sharpens interface judgement for frontend builders." }
    ],
    teachingHighlights: [
      "Semantic HTML and responsive layout exercises",
      "JavaScript interaction patterns and state thinking",
      "Component architecture with framework-based projects",
      "Accessibility, testing, and performance review"
    ]
  },
  {
    matchTerms: ["marketing", "seo", "content", "growth"],
    discipline: "Marketing",
    tagline: "Grow awareness, trust, and conversion with messaging, channels, and measurable campaigns.",
    coreSections: [
      "Digital Marketing",
      "Content Marketing",
      "SEO & Analytics",
      "Advertising"
    ],
    branches: ["Digital Marketer", "Growth Hacker", "Content Strategist"],
    keyTopics: [
      "Social media marketing",
      "SEO and search intent",
      "Email marketing",
      "Google Ads and analytics",
      "Brand strategy"
    ],
    learningFocus:
      "Start with digital marketing basics, then choose a growth channel such as SEO, paid ads, email, or content strategy and build campaigns around it.",
    recommendedBooks: [
      { title: "This Is Marketing", author: "Seth Godin", reason: "Strong mindset shift around positioning and audience empathy." },
      { title: "Contagious", author: "Jonah Berger", reason: "Useful for understanding what makes messages spread." },
      { title: "Building a StoryBrand", author: "Donald Miller", reason: "Helps learners improve communication and offer clarity." }
    ],
    teachingHighlights: [
      "Audience definition and messaging work",
      "Campaign planning across organic and paid channels",
      "Analytics review and KPI interpretation",
      "Content systems built for consistency and conversion"
    ]
  },
  {
    matchTerms: ["product management", "product", "mvp", "roadmap"],
    discipline: "Product Management",
    tagline: "Bridge users, business, and engineering to shape products that solve the right problems.",
    coreSections: [
      "Product Strategy",
      "Roadmapping",
      "User Research",
      "Execution"
    ],
    branches: ["Product Manager", "Technical Product Manager", "Growth Product Manager"],
    keyTopics: [
      "Product lifecycle",
      "Market research",
      "MVP development",
      "KPIs and OKRs",
      "Stakeholder management"
    ],
    learningFocus:
      "Understand users first, define outcomes clearly, build thoughtful product bets, and learn to measure whether they worked.",
    recommendedBooks: [
      { title: "Inspired", author: "Marty Cagan", reason: "A core book for modern product thinking and team practice." },
      { title: "Escaping the Build Trap", author: "Melissa Perri", reason: "Helpful for shifting from shipping features to driving outcomes." },
      { title: "Lean Product and Lean Analytics", author: "Ben Yoskovitz and Alistair Croll", reason: "Connects product decisions to measurement." }
    ],
    teachingHighlights: [
      "User and market research synthesis",
      "Roadmaps tied to product outcomes rather than feature lists",
      "Experiment thinking, MVP shaping, and prioritization",
      "Metrics review and stakeholder storytelling"
    ]
  }
];

function getCourseBlueprint(course) {
  const haystack = `${course?.title || ""} ${course?.category || ""} ${course?.description || ""}`.toLowerCase();
  return (
    COURSE_BLUEPRINTS.find((item) => item.matchTerms.some((term) => haystack.includes(term))) || {
      discipline: course?.category || "General",
      tagline: "Build practical skills through structured lessons, guided reading, and applied work.",
      coreSections: ["Foundations", "Core Practice", "Applied Work", "Reflection"],
      branches: ["Specialist", "Practitioner"],
      keyTopics: ["Core principles", "Tools", "Practical execution", "Review and iteration"],
      learningFocus:
        "Begin with fundamentals, practice with guided lessons, and complete the course work to unlock certification.",
      recommendedBooks: [
        { title: "Atomic Habits", author: "James Clear", reason: "Supports consistent learning routines and focused skill building." }
      ],
      teachingHighlights: [
        "Concept explanations",
        "Hands-on lessons",
        "Applied checkpoints",
        "Completion-driven progress"
      ]
    }
  );
}

function getCourseProgress(userId, courseId) {
  const lessons = getCourseLessons(courseId);
  const assignments = getCourseAssignments(courseId);
  const completedLessons = jsonDb
    .all("lesson_progress")
    .filter(
      (item) =>
        String(item.userId) === String(userId) &&
        String(item.courseId) === String(courseId) &&
        item.completed
    ).length;
  const gradedAssignments = jsonDb
    .all("submissions")
    .filter(
      (item) =>
        String(item.userId) === String(userId) &&
        String(item.courseId) === String(courseId) &&
        String(item.status).toLowerCase() === "graded"
    ).length;
  const totalWork = lessons.length + assignments.length;
  const completedWork = completedLessons + gradedAssignments;
  const overallPercent = totalWork ? Math.round((completedWork / totalWork) * 100) : 0;

  return {
    completedLessons,
    completedAssignments: gradedAssignments,
    totalLessons: lessons.length,
    totalAssignments: assignments.length,
    overallPercent
  };
}

function getCourseInstructors(courseId) {
  return jsonDb
    .all("course_instructors")
    .filter((item) => String(item.courseId) === String(courseId))
    .map((item) => serializeUser(jsonDb.findById("users", item.userId)))
    .filter(Boolean)
    .map((user) => ({ id: user.id, name: toName(user) || user.email, role: user.role }));
}

function enrichCourse(course, viewerId = null) {
  const progress = viewerId ? getCourseProgress(viewerId, course.id) : undefined;
  const enrollments = jsonDb
    .all("enrollments")
    .filter((item) => String(item.courseId) === String(course.id));
  const blueprint = getCourseBlueprint(course);

  return {
    ...course,
    id: String(course.id),
    instructorId: String(course.instructorId),
    lessonCount: getCourseLessons(course.id).length,
    assignmentCount: getCourseAssignments(course.id).length,
    enrolledCount: enrollments.length,
    enrollmentCount: enrollments.length,
    instructors: getCourseInstructors(course.id),
    discipline: blueprint.discipline,
    tagline: blueprint.tagline,
    progress
  };
}

function getCourseDetail(courseId, viewerId = null) {
  const course = jsonDb.findById("courses", courseId);
  if (!course) {
    return null;
  }

  const enrichedCourse = enrichCourse(course, viewerId);
  const blueprint = getCourseBlueprint(course);
  const lessons = getCourseLessons(course.id);
  const assignments = getCourseAssignments(course.id);
  const modules = getCourseModules(course.id).map((module) => {
    const moduleLessons = lessons.filter((lesson) => String(lesson.moduleId) === String(module.id));
    const moduleAssignments = assignments.filter((assignment) => String(assignment.moduleId) === String(module.id));

    return {
      ...module,
      lessons: moduleLessons,
      assignments: moduleAssignments
    };
  });

  const totalMinutes = lessons.reduce((sum, lesson) => sum + Number(lesson.durationMinutes || 0), 0);

  return {
    ...enrichedCourse,
    modules,
    lessons,
    assignments,
    branches: blueprint.branches,
    coreSections: blueprint.coreSections,
    keyTopics: blueprint.keyTopics,
    learningFocus: blueprint.learningFocus,
    recommendedBooks: blueprint.recommendedBooks,
    teachingHighlights: blueprint.teachingHighlights,
    estimatedReadingHours: Math.max(2, Math.round((totalMinutes / 60) * 0.5)),
    completionRequirement:
      "Learners must complete all lessons and required assignments before a certificate can be issued.",
    outlineSummary: `${blueprint.coreSections.join(" -> ")}`
  };
}

function logAudit(action, userId, resourceType, resourceId, details = {}) {
  jsonDb.insert("audit_logs", {
    action,
    userId: userId ? Number(userId) : null,
    resourceType,
    resourceId: resourceId ? Number(resourceId) : null,
    details: JSON.stringify(details),
    createdAt: now()
  });
}

async function createUser(payload) {
  const existing = jsonDb
    .all("users")
    .find((item) => item.email.toLowerCase() === payload.email.toLowerCase());

  if (existing) {
    throw new Error("Email already registered");
  }

  const password = await bcrypt.hash(payload.password, 10);
  const created = jsonDb.insert("users", {
    email: payload.email,
    password,
    firstName: payload.firstName,
    lastName: payload.lastName,
    bio: "",
    profilePicture: null,
    isEmailVerified: false,
    isActive: true,
    createdAt: now(),
    updatedAt: now()
  });

  const role = jsonDb.all("roles").find((item) => item.name === (payload.role || "learner"));
  if (role) {
    jsonDb.insert("user_roles", {
      userId: created.id,
      roleId: role.id,
      createdAt: now()
    });
  }

  getUserSettings(created.id);
  getNotificationPreferences(created.id);

  const verificationToken = String(Math.floor(100000 + Math.random() * 900000));
  jsonDb.insert("email_verification_tokens", {
    userId: created.id,
    token: verificationToken,
    createdAt: now(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });

  logAudit("auth.signup", created.id, "user", created.id, { role: payload.role || "learner" });
  return { user: created, verificationToken };
}

async function authenticate(email, password) {
  const user = jsonDb
    .all("users")
    .find((item) => item.email.toLowerCase() === String(email).toLowerCase());

  if (!user || !user.isActive) {
    return null;
  }

  const matches = await bcrypt.compare(password, user.password);
  return matches ? user : null;
}

function createSession(userId) {
  return jsonDb.insert("sessions", {
    userId: Number(userId),
    createdAt: now(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });
}

function saveRefreshToken(userId, token) {
  return jsonDb.insert("refresh_tokens", {
    userId: Number(userId),
    token,
    createdAt: now(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });
}

function getLearnerCourses(userId) {
  return jsonDb
    .all("enrollments")
    .filter((item) => String(item.userId) === String(userId))
    .map((enrollment) => jsonDb.findById("courses", enrollment.courseId))
    .filter(Boolean)
    .map((course) => enrichCourse(course, userId));
}

function getLearnerAssignments(userId) {
  return getLearnerCourses(userId).flatMap((course) =>
    getCourseAssignments(course.id).map((assignment) => {
      const submission = jsonDb
        .all("submissions")
        .find(
          (item) =>
            String(item.assignmentId) === String(assignment.id) &&
            String(item.userId) === String(userId)
        );

      return {
        ...assignment,
        courseTitle: course.title,
        status: submission?.status || "pending",
        dueAt: assignment.dueDate,
        submissionId: submission?.id || null,
        feedback: submission?.feedback || "",
        score: submission?.score ?? null,
        gradedAt: submission?.gradedAt || null,
        isLate:
          assignment.dueDate != null &&
          new Date(assignment.dueDate).getTime() < Date.now() &&
          !submission,
        canResubmit:
          Boolean(assignment.allowResubmission) &&
          submission != null &&
          String(submission.status || "").toLowerCase() !== "graded",
        submission
      };
    })
  );
}

function getLearnerDashboard(userId) {
  const courses = getLearnerCourses(userId);
  const assignments = getLearnerAssignments(userId).filter(
    (item) => String(item.status).toLowerCase() !== "graded"
  );

  return {
    courses,
    pendingAssignments: assignments,
    progress: courses.map((course) => ({
      courseId: course.id,
      title: course.title,
      ...course.progress
    })),
    certificatesIssued: jsonDb
      .all("certificates")
      .filter((item) => String(item.userId) === String(userId)).length
  };
}

function listPublicCourses() {
  return jsonDb
    .all("courses")
    .filter(
      (item) =>
        String(item.status).toLowerCase() === "published" &&
        String(item.catalogVisibility).toLowerCase() === "public"
    )
    .map((course) => enrichCourse(course));
}

function getInstructorCourses(userId) {
  return jsonDb
    .all("courses")
    .filter((item) => String(item.instructorId) === String(userId))
    .map((course) => enrichCourse(course))
    .map((course) => ({
      ...course,
      instructorFirstName: serializeUser(jsonDb.findById("users", course.instructorId))?.firstName,
      instructorLastName: serializeUser(jsonDb.findById("users", course.instructorId))?.lastName
    }));
}

function getInstructorLearners(userId) {
  const courses = getInstructorCourses(userId);
  const map = new Map();

  for (const course of courses) {
    const enrollments = jsonDb
      .all("enrollments")
      .filter((item) => String(item.courseId) === String(course.id));
    for (const enrollment of enrollments) {
      const learner = serializeUser(jsonDb.findById("users", enrollment.userId));
      if (!learner) continue;
      const current = map.get(String(learner.id)) || { learner, courses: [] };
      current.courses.push({ id: course.id, title: course.title });
      map.set(String(learner.id), current);
    }
  }

  return Array.from(map.values());
}

function getInstructorSubmissions(userId) {
  const courseIds = new Set(getInstructorCourses(userId).map((course) => String(course.id)));
  return jsonDb
    .all("submissions")
    .filter((item) => courseIds.has(String(item.courseId)))
    .map((submission) => {
      const assignment = jsonDb.findById("assignments", submission.assignmentId);
      const learner = serializeUser(jsonDb.findById("users", submission.userId));
      return {
        ...submission,
        assignment,
        learner: learner
          ? { id: learner.id, name: toName(learner) || learner.email, email: learner.email }
          : null
      };
    });
}

function getAdminDashboard() {
  const users = jsonDb.all("users");
  const courses = jsonDb.all("courses");
  const enrollments = jsonDb.all("enrollments");
  const sessions = jsonDb.all("sessions");

  return {
    users: { total: users.length },
    courses: {
      total: courses.length,
      published: courses.filter((item) => String(item.status) === "published").length
    },
    enrollments: { total: enrollments.length },
    activeUsers: { todayActive: sessions.length },
    recentLogs: jsonDb.all("audit_logs").slice(-10).reverse()
  };
}

function getAdminUsers() {
  return jsonDb.all("users").map((user) => serializeUser(user));
}

function getAdminNotifications() {
  return jsonDb.all("notifications").map((item) => ({
    ...item,
    user: serializeUser(jsonDb.findById("users", item.userId))
  })).sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
}

function getUserNotifications(userId) {
  return jsonDb
    .all("notifications")
    .filter((item) => String(item.userId) === String(userId))
    .map((item) => ({
      ...item,
      user: serializeUser(jsonDb.findById("users", item.userId))
    }))
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
}

function createNotification(userId, { title, message, type = 'info', link = null }) {
  return jsonDb.insert("notifications", {
    userId: Number(userId),
    title,
    message,
    type,
    link,
    status: "unread",
    createdAt: now(),
    updatedAt: now()
  });
}

function getTeamDetails(team) {
  const members = jsonDb
    .all("team_members")
    .filter((item) => String(item.teamId) === String(team.id))
    .map((item) => ({
      ...item,
      user: serializeUser(jsonDb.findById("users", item.userId))
    }));

  return {
    ...team,
    id: String(team.id),
    members,
    memberCount: members.length,
    currentSize: members.length
  };
}

function getAnalytics() {
  return {
    instructor: getInstructorCourses(2).map((course) => ({
      courseId: course.id,
      courseTitle: course.title,
      averageProgress: course.enrolledCount
        ? Math.round(
            jsonDb
              .all("enrollments")
              .filter((item) => String(item.courseId) === String(course.id))
              .reduce((sum, enrollment) => sum + getCourseProgress(enrollment.userId, course.id).overallPercent, 0) /
              course.enrolledCount
          )
        : 0
    })),
    platform: {
      totalUsers: jsonDb.all("users").length,
      totalCourses: jsonDb.all("courses").length,
      totalTeams: jsonDb.all("teams").length,
      totalMessages: jsonDb.all("messages").length
    }
  };
}

export const unifiedService = {
  now,
  serializeUser,
  getUserRole,
  getUserSettings,
  getNotificationPreferences,
  createUser,
  authenticate,
  createSession,
  saveRefreshToken,
  listPublicCourses,
  enrichCourse,
  getCourseDetail,
  getLearnerDashboard,
  getLearnerCourses,
  getLearnerAssignments,
  getInstructorCourses,
  getInstructorLearners,
  getInstructorSubmissions,
  getAdminDashboard,
  getAdminUsers,
  getAdminNotifications,
  getUserNotifications,
  createNotification,
  getAnalytics,
  getTeamDetails,
  logAudit
};
