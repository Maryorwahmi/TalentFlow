import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';

// Auth Pages
import {
  LoginPage,
  SignUp,
  EmailVerification,
  ForgotPassword,
  SetNewPassword,
  OAuthCallback,
} from '@/app/auth';

// Public Pages
import {
  LandingPage,
  AboutPage,
  HowItWorksPage,
  ContactPage,
  TermsPage,
  PrivacyPolicyPage,
  PricingPage,
  FAQPage,
  DemoPage,
  NotFound,
} from '@/app/public';
import PublicCourseDetailsPage from '@/app/public/CourseDetailsPage';

// Public Additional Pages
import { SettingsPage } from '@/app/public/SettingsPage';
import { ChangePasswordPage } from '@/app/public/ChangePasswordPage';
import { NotificationsPage } from '@/app/public/NotificationsPage';

// Layouts
import { PublicLayout } from '@/shared/layouts/PublicLayout';
import { AdminLayout } from '@/shared/layouts/AdminLayout';
import { InstructorLayout } from '@/shared/layouts/InstructorLayout';
import { LearnerLayout } from '@/shared/layouts/LearnerLayout';

import {
  InstructorDashboardPage as LiveInstructorDashboardPage,
  InstructorCoursesPage as LiveInstructorCoursesPage,
  InstructorCreateCoursePage as LiveInstructorCreateCoursePage,
  InstructorCourseDetailPage as LiveInstructorCourseDetailPage,
  InstructorSubmissionsPage as LiveInstructorSubmissionsPage,
  InstructorGradesPage as LiveInstructorGradesPage,
  InstructorLearnersPage as LiveInstructorLearnersPage,
  InstructorDiscussionPage as LiveInstructorDiscussionPage,
  InstructorAnalyticsPage as LiveInstructorAnalyticsPage,
  InstructorProfilePage as LiveInstructorProfilePage,
  InstructorEditProfilePage as LiveInstructorEditProfilePage,
  InstructorAnnouncementsPage as LiveInstructorAnnouncementsPage,
  InstructorAddAnnouncementPage as LiveInstructorAddAnnouncementPage,
  InstructorSettingsPage as LiveInstructorSettingsPage,
  InstructorChangeEmailPage as LiveInstructorChangeEmailPage,
  InstructorChangePasswordPage as LiveInstructorChangePasswordPage,
} from '@/app/instructor/LiveScreens';

import {
  AdminDashboardPage as LiveAdminDashboardPage,
  AdminUsersPage as LiveAdminUsersPage,
  AdminUserEditPage as LiveAdminUserEditPage,
  AdminCoursesPage as LiveAdminCoursesPage,
  AdminNotificationsPage as LiveAdminNotificationsPage,
  AdminNotificationDetailsPage as LiveAdminNotificationDetailsPage,
  AdminTeamAllocationPage as LiveAdminTeamAllocationPage,
  AdminCreateTeamPage as LiveAdminCreateTeamPage,
  AdminEditTeamPage as LiveAdminEditTeamPage,
  AdminAssignLearnerPage as LiveAdminAssignLearnerPage,
  AdminAnalyticsPage as LiveAdminAnalyticsPage,
  AdminAnnouncementsPage as LiveAdminAnnouncementsPage,
  AdminAddAnnouncementPage as LiveAdminAddAnnouncementPage,
  AdminProfilePage as LiveAdminProfilePage,
  AdminSettingsPage as LiveAdminSettingsPage,
  AdminChangeEmailPage as LiveAdminChangeEmailPage,
  AdminChangePasswordPage as LiveAdminChangePasswordPage,
} from '@/app/admin/LiveScreens';
import {
  LearnerDashboardPage as LiveLearnerDashboardPage,
  MyCoursesPage as LiveMyCoursesPage,
  CourseCatalogPage as LiveCourseCatalogPage,
  CourseDetailsPage as LiveCourseDetailsPage,
  LessonPage as LiveLessonPage,
  ProgressPage as LiveProgressPage,
  AssignmentsPage as LiveAssignmentsPage,
  AssignmentsSubmissionPage as LiveAssignmentsSubmissionPage,
  AssignmentsGradedPage as LiveAssignmentsGradedPage,
  CertificatePage as LiveCertificatePage,
  NotificationPage as LiveNotificationPage,
  DiscussionPage as LiveDiscussionPage,
  MyTeamPage as LiveMyTeamPage,
  TeamAllocationPage as LiveTeamAllocationPage,
  LearnerProfilePage as LiveLearnerProfilePage,
  LearnerSettingsPage as LiveLearnerSettingsPage,
  LearnerChangeEmailPage as LiveLearnerChangeEmailPage,
  LearnerChangePasswordPage as LiveLearnerChangePasswordPage,
} from '@/app/learner/LiveScreens';
import { CourseDetailPage } from '@/app/learner/CourseDetailPage';
import { CourseStudyArea } from '@/app/learner/CourseStudyArea';

// Routing & Auth
import { useAuthStore } from '@/shared/state/auth';
import { UnauthorizedPage } from '@/app/public/UnauthorizedPage';
import { AdminRoute, InstructorRoute, ProtectedRoute } from '@/shared/utils/routing';
import { UserRole } from '@/shared/types';

function App() {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Layout Routes */}
        <Route element={<PublicLayout><LandingPage /></PublicLayout>} path="/" />
        <Route element={<PublicLayout><AboutPage /></PublicLayout>} path="/about" />
        <Route element={<PublicLayout><HowItWorksPage /></PublicLayout>} path="/how-it-works" />
        <Route element={<PublicLayout><ContactPage /></PublicLayout>} path="/contact" />
        <Route element={<PublicLayout><PricingPage /></PublicLayout>} path="/pricing" />
        <Route element={<PublicLayout><FAQPage /></PublicLayout>} path="/faq" />
        <Route element={<PublicLayout><DemoPage /></PublicLayout>} path="/demo" />
        <Route element={<PublicLayout><TermsPage /></PublicLayout>} path="/terms" />
        <Route element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} path="/privacy" />
        <Route element={<PublicLayout><LiveCourseCatalogPage /></PublicLayout>} path="/catalog" />
        <Route element={<PublicLayout><PublicCourseDetailsPage /></PublicLayout>} path="/catalog/:id" />

        {/* Auth Routes */}
        <Route element={<LoginPage />} path="/login" />
        <Route element={<SignUp />} path="/signup" />
        <Route element={<EmailVerification />} path="/email-verification" />
        <Route element={<ForgotPassword />} path="/forgot-password" />
        <Route element={<SetNewPassword />} path="/set-new-password" />
        <Route element={<OAuthCallback />} path="/oauth/callback" />

        {/* Account/Settings Routes (render inside PublicLayout so navbar stays visible) */}
        <Route element={<PublicLayout><ProtectedRoute><SettingsPage /></ProtectedRoute></PublicLayout>} path="/settings" />
        <Route element={<PublicLayout><ProtectedRoute><ChangePasswordPage /></ProtectedRoute></PublicLayout>} path="/settings/change-password" />
        <Route element={<PublicLayout><ProtectedRoute><NotificationsPage /></ProtectedRoute></PublicLayout>} path="/notifications" />

        {/* Instructor Routes */}
        <Route
          path="/instructor"
          element={
            <InstructorRoute>
              <InstructorLayout />
            </InstructorRoute>
          }
        >
          <Route element={<LiveInstructorDashboardPage />} index />
          <Route element={<LiveInstructorCoursesPage />} path="courses" />
          <Route element={<LiveInstructorCreateCoursePage />} path="courses/create" />
          <Route element={<LiveInstructorCourseDetailPage />} path="courses/:courseId" />
          <Route element={<LiveInstructorSubmissionsPage />} path="submissions" />
          <Route element={<LiveInstructorGradesPage />} path="grades" />
          <Route element={<LiveInstructorGradesPage />} path="grades/:submissionId" />
          <Route element={<LiveInstructorLearnersPage />} path="learners" />
          <Route element={<LiveInstructorDiscussionPage />} path="discussion" />
          <Route element={<LiveInstructorAnalyticsPage />} path="analytics" />
          <Route element={<LiveInstructorProfilePage />} path="profile" />
          <Route element={<LiveInstructorEditProfilePage />} path="profile/edit" />
          <Route element={<LiveInstructorAnnouncementsPage />} path="announcements" />
          <Route element={<LiveInstructorAddAnnouncementPage />} path="announcements/new" />
          <Route element={<LiveInstructorAddAnnouncementPage />} path="announcements/add" />
          <Route element={<LiveInstructorSettingsPage />} path="settings" />
          <Route element={<LiveInstructorChangeEmailPage />} path="settings/change-email" />
          <Route element={<LiveInstructorChangePasswordPage />} path="settings/change-password" />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route element={<LiveAdminDashboardPage />} index />
          <Route element={<LiveAdminUsersPage />} path="users" />
          <Route element={<LiveAdminUserEditPage />} path="users/:id/edit" />
          <Route element={<LiveAdminCoursesPage />} path="courses" />
          <Route element={<LiveAdminNotificationsPage />} path="notifications" />
          <Route element={<LiveAdminNotificationDetailsPage />} path="notifications/:id" />
          <Route element={<LiveAdminTeamAllocationPage />} path="team-allocation" />
          <Route element={<LiveAdminCreateTeamPage />} path="team-allocation/create" />
          <Route element={<LiveAdminEditTeamPage />} path="team-allocation/:id/edit" />
          <Route element={<LiveAdminAssignLearnerPage />} path="team-allocation/assign" />
          <Route element={<LiveAdminAnalyticsPage />} path="analytics" />
          <Route element={<LiveAdminAnnouncementsPage />} path="announcements" />
          <Route element={<LiveAdminAddAnnouncementPage />} path="announcements/new" />
          <Route element={<LiveAdminProfilePage />} path="profile" />
          <Route element={<LiveAdminSettingsPage />} path="settings" />
          <Route element={<LiveAdminChangeEmailPage />} path="settings/change-email" />
          <Route element={<LiveAdminChangePasswordPage />} path="settings/change-password" />
        </Route>

        {/* Learner Routes */}
        <Route
          path="/learner"
          element={
            <ProtectedRoute requiredRole={[UserRole.LEARNER]}>
              <LearnerLayout />
            </ProtectedRoute>
          }
        >
          <Route element={<LiveLearnerDashboardPage />} index />
          <Route element={<LiveMyCoursesPage />} path="courses" />
          <Route element={<LiveCourseCatalogPage />} path="catalog" />
          <Route element={<CourseDetailPage />} path="catalog/:courseId" />
          <Route element={<LiveCourseDetailsPage />} path="courses/:id" />
          <Route element={<CourseStudyArea />} path="courses/:courseId/learn" />
          <Route element={<LiveLessonPage />} path="lessons/:id" />
          <Route element={<LiveProgressPage />} path="progress" />
          <Route element={<LiveAssignmentsPage />} path="assignments" />
          <Route element={<LiveAssignmentsSubmissionPage />} path="assignments/:id" />
          <Route element={<LiveAssignmentsGradedPage />} path="assignments/:id/graded" />
          <Route element={<LiveCertificatePage />} path="certificates" />
          <Route element={<LiveNotificationPage />} path="notifications" />
          <Route element={<LiveDiscussionPage />} path="discussion" />
          <Route element={<LiveDiscussionPage />} path="discussion/:id" />
          <Route element={<LiveMyTeamPage />} path="team" />
          <Route element={<LiveTeamAllocationPage />} path="team-allocation" />
          <Route element={<LiveLearnerProfilePage />} path="profile" />
          <Route element={<LiveLearnerSettingsPage />} path="settings" />
          <Route element={<LiveLearnerChangeEmailPage />} path="settings/change-email" />
          <Route element={<LiveLearnerChangePasswordPage />} path="settings/change-password" />
        </Route>

        {/* Error Routes */}
        <Route element={<UnauthorizedPage />} path="/unauthorized" />
        <Route element={<NotFound />} path="/404" />
        <Route element={<NotFound />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
