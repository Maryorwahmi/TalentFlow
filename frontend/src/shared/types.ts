// Created by CaptainCode - FE-3 Specialist
// Core types for Instructor and Admin roles

export enum UserRole {
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
  LEARNER = 'learner',
  PUBLIC = 'public',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  INACTIVE = 'inactive',
}

export enum SubmissionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  REJECTED = 'rejected',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  bio?: string;
  profilePicture?: string;
  profileData?: Record<string, any>;
  department?: string;
}

export interface InstructorProfile extends User {
  courseCount: number;
  learnerCount: number;
  totalSubmissions: number;
}

export interface AdminProfile extends User {
  permissions: string[];
  lastLoginAt?: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  instructorId: string;
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
  category?: string;
  duration?: number;
  image?: string;
}

// Submission types
export interface Submission {
  id: string;
  assignmentId: string;
  learnerId: string;
  courseId: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  createdAt: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  status: NotificationStatus;
  type: string;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
}

// Learner types
export interface Learner {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  enrolledCourses: number;
  completedCourses: number;
  totalScore: number;
  enrollmentDate: string;
}

// Team Allocation types
export interface TeamAllocation {
  id: string;
  teamName: string;
  capacity: number;
  currentSize: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard types
export interface InstructorDashboardData {
  activeCoursesCount: number;
  enrolledLearners: number;
  pendingSubmissions: number;
  totalScore: number;
  recentSubmissions: Submission[];
  coursePerformance: Array<{ courseId: string; courseName: string; performance: number }>;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeCourses: number;
  totalLearners: number;
  platformScore: number;
  recentActivity: Array<{ id: string; action: string; user: string; timestamp: string }>;
}

// Announcement types
export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdBy: string;
  targetAudience: 'all' | 'instructors' | 'admins' | 'learners';
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// Auth and session
export interface AuthSession {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Form types
export interface CreateCourseForm {
  title: string;
  description: string;
  category: string;
  duration?: number;
  image?: File;
}

export interface AddAnnouncementForm {
  title: string;
  body: string;
  targetAudience: 'all' | 'instructors' | 'admins' | 'learners';
  attachments?: File[];
}

export interface GradeSubmissionForm {
  submissionId: string;
  score: number;
  feedback: string;
}

export interface CreateTeamAllocationForm {
  teamName: string;
  capacity: number;
}
