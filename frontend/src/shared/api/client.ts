// @ts-nocheck
/**
 * TalentFlow API Client
 * Created by CaptainCode
 * Comprehensive API service for frontend-backend communication
 */

import axios from 'axios';
import { API_BASE_URL, API_ORIGIN } from './config';

const getAccessToken = () =>
  localStorage.getItem('authToken') ||
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('authToken') ||
  sessionStorage.getItem('accessToken');

const getRefreshToken = () =>
  localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('accessToken', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Required for ngrok tunnels
  },
  withCredentials: true, // Enable credentials for cross-origin requests
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Always ensure ngrok header is sent
    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // Token expired, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update tokens
        setTokens({ accessToken, refreshToken: newRefreshToken });

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// Authentication Endpoints
// ============================================

export const authAPI: any = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  updateProfile: (data) => apiClient.patch('/auth/profile', data),
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  resendVerificationEmail: (email) => apiClient.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password, passwordConfirm) =>
    apiClient.post('/auth/reset-password', { token, password, passwordConfirm }),
};

// ============================================
// Account Settings Endpoints
// ============================================

export const accountAPI: any = {
  getSettings: () => apiClient.get('/account/preferences'),
  updateSettings: (data) => apiClient.patch('/account/preferences', data),
  updateProfile: (data) => {
    // If a FormData instance is passed, ensure multipart/form-data is used
    try {
      if (typeof FormData !== 'undefined' && data instanceof FormData) {
        return apiClient.patch('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
    } catch (e) {
      // In some SSR or test environments FormData may be undefined — fall back to JSON
    }

    return apiClient.patch('/auth/profile', data);
  },
  changePassword: (currentPassword, newPassword) =>
    apiClient.post('/account/change-password', { currentPassword, newPassword, confirmPassword: newPassword }),
  changeEmail: (newEmail, password) =>
    apiClient.post('/account/request-email-change', { newEmail, password }),
  getNotificationPreferences: () => apiClient.get('/account/notification-preferences'),
  updateNotificationPreferences: (data) =>
    apiClient.patch('/account/notification-preferences', data),
};

// ============================================
// Role-Based Settings Endpoints
// ============================================

export const roleSettingsAPI: any = {
  getCurrentSettings: () => apiClient.get('/settings'),
  updateCurrentSettings: (data) => apiClient.patch('/settings', data),
  getNotifications: () => apiClient.get('/settings/notifications'),
  updateNotifications: (preferences) => apiClient.patch('/settings/notifications', { preferences }),
  getLearnerSettings: () => apiClient.get('/settings'),
  updateLearnerSettings: (data) => apiClient.patch('/settings', data),
  getInstructorSettings: () => apiClient.get('/settings'),
  updateInstructorSettings: (data) => apiClient.patch('/settings', data),
  getAdminSettings: () => apiClient.get('/admin/settings'),
  updateAdminSettings: (data) => apiClient.patch('/admin/settings', data),
};

// ============================================
// Admin Platform Settings Endpoints
// ============================================

export const adminSettingsAPI: any = {
  getPlatformSettings: () => apiClient.get('/admin/settings'),
  updatePlatformSettings: (data) => apiClient.patch('/admin/settings', data),
};

// ============================================
// Learner-Specific Endpoints
// ============================================

export const learnerAPI: any = {
  getDashboard: () => apiClient.get('/learner/dashboard'),
  getCourses: () => apiClient.get('/learner/courses'),
  getProgress: () => apiClient.get('/learner/progress'),
  getAssignments: () => apiClient.get('/learner/assignments'),
  getSubmission: (submissionId) => apiClient.get(`/learner/submissions/${submissionId}`),
  getCertificates: () => apiClient.get('/learner/certificates'),
  getLesson: (lessonId) => apiClient.get(`/lessons/${lessonId}`),
  updateLessonProgress: (lessonId, completed) =>
    apiClient.patch(`/lessons/${lessonId}/progress`, { completed }),
  enrollCourse: (courseId) => apiClient.post(`/courses/${courseId}/enroll`),
  submitAssignment: (assignmentId, formData) =>
    apiClient.post(`/assignments/${assignmentId}/submissions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  saveSubmissionDraft: (submissionId, formData) =>
    apiClient.patch(`/submissions/${submissionId}/draft`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ============================================
// Instructor-Specific Endpoints
// ============================================

export const instructorAPI: any = {
  getCourses: () => apiClient.get('/instructor/courses'),
  getCourse: (courseId) => apiClient.get(`/instructor/courses/${courseId}`),
  createCourse: (data) => apiClient.post('/instructor/courses', data),
  updateCourse: (courseId, data) => apiClient.patch(`/instructor/courses/${courseId}`, data),
  deleteCourse: (courseId) => apiClient.delete(`/instructor/courses/${courseId}`),
  getLearners: () => apiClient.get('/instructor/learners'),
  getCourseLearners: (courseId) => apiClient.get(`/instructor/courses/${courseId}/learners`),
  getSubmissions: () => apiClient.get('/instructor/submissions'),
  getSubmission: (submissionId) => apiClient.get(`/instructor/submissions/${submissionId}`),
  gradeSubmission: (submissionId, data) =>
    apiClient.patch(`/instructor/submissions/${submissionId}/grade`, data),
  createAssignment: (courseId, data) => apiClient.post(`/instructor/courses/${courseId}/assignments`, data),
  updateAssignment: (assignmentId, data) => apiClient.patch(`/instructor/assignments/${assignmentId}`, data),
  deleteAssignment: (assignmentId) => apiClient.delete(`/instructor/assignments/${assignmentId}`),
  getAnalytics: () => apiClient.get('/analytics/instructor/stats'),
};

// ============================================
// Admin-Specific Endpoints (combined)
// ============================================

// Dashboard and Analytics
const adminDashboardAPI = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getAnalytics: () => apiClient.get('/analytics/platform/metrics'),
};

// User Management
const adminUserAPI = {
  listUsers: () => apiClient.get('/admin/users'),
  getUserDetail: (userId) => apiClient.get(`/admin/users/${userId}`),
  suspendUser: (userId, reason) => apiClient.patch(`/admin/users/${userId}/suspend`, { reason }),
  activateUser: (userId) => apiClient.patch(`/admin/users/${userId}/activate`),
  getAuditLogs: () => apiClient.get('/admin/audit-logs'),
  getSystemSettings: () => apiClient.get('/admin/settings'),
  updateSystemSettings: (data) => apiClient.patch('/admin/settings', data),
  listCourses: () => apiClient.get('/admin/courses'),
  approveCourse: (courseId) => apiClient.patch(`/admin/courses/${courseId}/approve`),
  rejectCourse: (courseId, reason) => apiClient.patch(`/admin/courses/${courseId}/reject`, { reason }),
  archiveCourse: (courseId) => apiClient.patch(`/admin/courses/${courseId}/archive`),
  enrollUserInCourse: (courseId, userId) => apiClient.post(`/admin/courses/${courseId}/enroll`, { userId }),
  removeUserFromCourse: (courseId, userId) => apiClient.delete(`/admin/courses/${courseId}/enroll/${userId}`),
  listNotifications: () => apiClient.get('/admin/notifications'),
  sendNotification: (data) => apiClient.post('/admin/notifications', data),
};

// Combined export
export const adminAPI: any = {
  ...adminDashboardAPI,
  ...adminUserAPI,
};

// ============================================
// Courses Endpoints
// ============================================

export const coursesAPI: any = {
  listCourses: (filters = {}) => apiClient.get('/courses', { params: filters }),
  getCourseDetail: (courseId) => apiClient.get(`/courses/${courseId}`),
  listPublicHome: () => apiClient.get('/public/home'),
  // New endpoints for Phase 1 & 2
  getModules: (courseId) => apiClient.get(`/courses/${courseId}/modules`),
  getLessons: (courseId) => apiClient.get(`/courses/${courseId}/lessons`),
  getCourseReviews: (courseId) => apiClient.get(`/courses/${courseId}/reviews`),
  getAggregatedRatings: (courseId) => apiClient.get(`/courses/${courseId}/ratings`),
  postReview: (courseId, data) => apiClient.post(`/courses/${courseId}/reviews`, data),
  getQuizzes: (courseId) => apiClient.get(`/courses/${courseId}/quizzes`),
  submitQuizAttempt: (quizId, answers) => apiClient.post(`/quizzes/${quizId}/attempts`, { answers }),
};

// ============================================
// Lessons Endpoints
// ============================================

export const lessonsAPI: any = {
  getLessonDetail: (lessonId) => apiClient.get(`/lessons/${lessonId}`),
};

// ============================================
// Assignments Endpoints
// ============================================

export const assignmentsAPI: any = {
  listAssignments: (courseId) => apiClient.get(`/courses/${courseId}/assignments`),
  getAssignmentDetail: (assignmentId) => apiClient.get(`/assignments/${assignmentId}`),
  listInstructorSubmissions: (assignmentId) =>
    apiClient.get(`/instructor/assignments/${assignmentId}/submissions`),
};

// ============================================
// Grading Endpoints
// ============================================

export const gradingAPI: any = {
  gradeSubmission: (submissionId, data) =>
    apiClient.patch(`/instructor/submissions/${submissionId}/grade`, data),
};

// ============================================
// Certificates Endpoints
// ============================================

export const certificatesAPI: any = {
  listCertificates: () => apiClient.get('/learner/certificates'),
  getCertificateDetail: (certificateId) => apiClient.get(`/certificates/${certificateId}`),
  downloadCertificate: (certificateId) =>
    apiClient.get(`/certificates/${certificateId}/download`, { responseType: 'blob' }),
};

// ============================================
// Teams Endpoints
// ============================================

export const teamsAPI: any = {
  listTeams: () => apiClient.get('/teams'),
  createTeam: (data) => apiClient.post('/teams', data),
  getTeamDetail: (teamId) => apiClient.get(`/teams/${teamId}`),
  updateTeam: (teamId, data) => apiClient.patch(`/teams/${teamId}`, data),
  deleteTeam: (teamId) => apiClient.delete(`/teams/${teamId}`),
  listMembers: (teamId) => apiClient.get(`/teams/${teamId}/members`),
  addMember: (teamId, userId, role = 'member') => apiClient.post(`/teams/${teamId}/members`, { userId, role }),
  removeMember: (teamId, userId) => apiClient.delete(`/teams/${teamId}/members/${userId}`),
};

// ============================================
// Announcements Endpoints
// ============================================

export const announcementsAPI: any = {
  listAnnouncements: (params = {}) => apiClient.get('/communication/announcements', { params }),
  createAnnouncement: (data) => apiClient.post('/communication/announcements', data),
  getAnnouncementDetail: (announcementId) => apiClient.get(`/communication/announcements/${announcementId}`),
  // New methods to support enhanced announcement features
  createAnnouncementWithRecipients: (data) => apiClient.post('/communication/announcements', data),
};

// ============================================
// Notifications Endpoints
// ============================================

export const notificationsAPI: any = {
  listNotifications: () => apiClient.get('/admin/notifications'),
  listMyNotifications: () => apiClient.get('/notifications'),
  markAsRead: (notificationId) => apiClient.patch(`/notifications/${notificationId}/read`),
};

// ============================================
// Analytics Endpoints
// ============================================

export const analyticsAPI: any = {
  getUserProgress: () => apiClient.get('/analytics/user/progress'),
  getInstructorStats: () => apiClient.get('/analytics/instructor/stats'),
  getPlatformMetrics: () => apiClient.get('/analytics/platform/metrics'),
  getCourseAnalytics: (courseId) => apiClient.get(`/analytics/course/${courseId}`),
  getCourseLearners: (courseId) => apiClient.get(`/analytics/course/${courseId}/learners`),
  getEngagementMetrics: () => apiClient.get('/analytics/engagement/metrics'),
  getActiveUsers: (days = 30) => apiClient.get('/analytics/platform/active-users', { params: { days } }),
  recordActivity: (data) => apiClient.post('/analytics/activity', data),
};

export const communicationAPI: any = {
  listChannels: (params = {}) => apiClient.get('/communication/channels', { params }),
  createChannel: (data) => apiClient.post('/communication/channels', data),
  getChannel: (channelId) => apiClient.get(`/communication/channels/${channelId}`),
  listMessages: (channelId, params = {}) =>
    apiClient.get(`/communication/channels/${channelId}/messages`, { params }),
  postMessage: (channelId, data) => apiClient.post(`/communication/channels/${channelId}/messages`, data),
  // Direct Messages
  sendDirectMessage: (recipientId, data) => apiClient.post(`/communication/direct-messages/${recipientId}`, data),
  getDirectMessages: (otherUserId, params = {}) =>
    apiClient.get(`/communication/direct-messages/${otherUserId}`, { params }),
  getUserConversations: () => apiClient.get('/communication/direct-messages'),
  markDirectMessageAsRead: (messageId) => apiClient.patch(`/communication/direct-messages/${messageId}/read`),
};

// ============================================
// Admin Endpoints
// ============================================

// ============================================
// Health & Docs Endpoints
// ============================================

export const systemAPI: any = {
  health: () => axios.get(`${API_ORIGIN}/health`),
  getDocumentation: () => apiClient.get('/docs'),
  getDocumentationJSON: () => apiClient.get('/docs/json'),
};

export default apiClient;
