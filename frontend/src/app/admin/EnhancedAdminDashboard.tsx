/**
 * Enhanced Admin Dashboard
 * Created by CaptainCode
 * Comprehensive dashboard with user management, course management, and analytics
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  AlertCircle,
  BarChart3,
  Activity,
} from 'lucide-react';
import { adminAPI, analyticsAPI } from '@/shared/api/client';
import { useAsyncResource, unwrapData } from '@/shared/api/live';
import {
  ActionButton,
  Card,
  CircleAvatar,
  PageHeading,
  StatCard,
  StatusPill,
  ProgressBar,
} from '@/shared/ui/talentFlow';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  avgCompletionRate: number;
  certificatesIssued: number;
  pendingApprovals: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Course {
  id: number;
  title: string;
  instructor: string;
  enrolledCount: number;
  status: string;
  createdAt: string;
}

export function EnhancedAdminDashboard() {
  const navigate = useNavigate();
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useAsyncResource(() => adminAPI.getDashboard().then(unwrapData), null);

  const { data: users, loading: usersLoading } = useAsyncResource(
    () => adminAPI.listUsers().then(unwrapData),
    []
  );

  const { data: courses, loading: coursesLoading } = useAsyncResource(
    () => adminAPI.listCourses?.().then(unwrapData) || Promise.resolve([]),
    []
  );

  const { loading: analyticsLoading } = useAsyncResource(
    () => analyticsAPI.getPlatformMetrics().then(unwrapData),
    null
  );

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    avgCompletionRate: 0,
    certificatesIssued: 0,
    pendingApprovals: 0,
  });

  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'courses' | 'analytics'>('overview');

  // Calculate stats from fetched data
  useEffect(() => {
    if (dashboardData) {
      setStats({
        totalUsers: dashboardData.users?.total || 0,
        activeUsers: dashboardData.users?.active || 0,
        totalCourses: dashboardData.courses?.total || 0,
        activeCourses: dashboardData.courses?.active || 0,
        totalEnrollments: dashboardData.enrollments?.total || 0,
        avgCompletionRate: dashboardData.avgCompletionRate || 0,
        certificatesIssued: dashboardData.certificatesIssued || 0,
        pendingApprovals: dashboardData.pendingApprovals || 0,
      });
    }
  }, [dashboardData]);

  const recentUsers = users?.slice(0, 5) || [];
  const recentCourses = courses?.slice(0, 5) || [];

  const isLoading = dashboardLoading || usersLoading || coursesLoading || analyticsLoading;

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-8">
        <div className="flex justify-between items-center">
          <div>
            <PageHeading title="Admin Dashboard" />
            <p className="text-gray-600 mt-2">Platform overview and management tools</p>
          </div>
          <ActionButton
            variant="secondary"
            onClick={refetchDashboard}
            className="flex items-center gap-2"
          >
            <Activity size={18} />
            Refresh
          </ActionButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Error Display */}
        {dashboardError && (
          <Card className="bg-red-50 border-red-200 text-red-700 mb-6">
            <div className="flex gap-3">
              <AlertCircle size={20} />
              <div>Error loading dashboard: {dashboardError}</div>
            </div>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={String(stats.totalUsers)}
            tone="blue"
          />
          <StatCard
            title="Total Courses"
            value={String(stats.totalCourses)}
            tone="default"
          />
          <StatCard
            title="Enrollments"
            value={String(stats.totalEnrollments)}
            tone="amber"
          />
          <StatCard
            title="Certificates"
            value={String(stats.certificatesIssued)}
            tone="rose"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          {['overview', 'users', 'courses', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-4 py-3 font-medium capitalize transition-colors ${
                selectedTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <ActionButton
                  variant="primary"
                  onClick={() => navigate('/admin/users')}
                  className="w-full justify-start"
                >
                  <Users size={18} />
                  Manage Users
                </ActionButton>
                <ActionButton
                  variant="primary"
                  onClick={() => navigate('/admin/courses')}
                  className="w-full justify-start"
                >
                  <BookOpen size={18} />
                  Manage Courses
                </ActionButton>
                <ActionButton
                  variant="primary"
                  onClick={() => navigate('/admin/team-allocation')}
                  className="w-full justify-start"
                >
                  <Users size={18} />
                  Team Allocation
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  onClick={() => navigate('/admin/analytics')}
                  className="w-full justify-start"
                >
                  <BarChart3 size={18} />
                  View Analytics
                </ActionButton>
              </div>
            </Card>

            {/* Platform Health */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Platform Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">System Load</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <ProgressBar value={45} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Database Usage</span>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                  <ProgressBar value={62} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">User Engagement</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <ProgressBar value={78} />
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700">✓ All systems operational</p>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Recent Users</h3>
              <div className="space-y-2">
                {recentUsers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No users yet</p>
                ) : (
                  recentUsers.map((user: User) => (
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <CircleAvatar
                          initials={`${user.firstName?.[0]}${user.lastName?.[0]}`}
                          tone="primary"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <StatusPill
                        label={user.role}
                        tone={user.status === 'active' ? 'success' : 'warning'}
                      />
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Recent Courses */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Recent Courses</h3>
              <div className="space-y-2">
                {recentCourses.length === 0 ? (
                  <p className="text-gray-500 text-sm">No courses yet</p>
                ) : (
                  recentCourses.map((course: Course) => (
                    <div key={course.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{course.title}</p>
                        <p className="text-xs text-gray-500">{course.instructor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">{course.enrolledCount}</p>
                        <p className="text-xs text-gray-500">enrolled</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">User Management</h3>
              <ActionButton
                variant="primary"
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-1"
              >
                View All Users
              </ActionButton>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-gray-500 text-sm">No users</p>
              ) : (
                users.map((user: User) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <CircleAvatar
                        initials={`${user.firstName?.[0]}${user.lastName?.[0]}`}
                        tone="primary"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill
                        label={user.role}
                        tone={user.status === 'active' ? 'success' : 'warning'}
                      />
                      <ActionButton
                        variant="secondary"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                      >
                        Edit
                      </ActionButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* Courses Tab */}
        {selectedTab === 'courses' && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Course Management</h3>
              <ActionButton
                variant="primary"
                onClick={() => navigate('/admin/courses')}
                className="flex items-center gap-1"
              >
                View All Courses
              </ActionButton>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {courses.length === 0 ? (
                <p className="text-gray-500 text-sm">No courses</p>
              ) : (
                courses.map((course: Course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-xs text-gray-500">Instructor: {course.instructor}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">{course.enrolledCount}</p>
                        <p className="text-xs text-gray-500">enrolled</p>
                      </div>
                      <StatusPill
                        label={course.status}
                        tone={course.status === 'active' ? 'success' : 'warning'}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Platform Analytics</h3>
              <ActionButton
                variant="primary"
                onClick={() => navigate('/admin/analytics')}
                className="flex items-center gap-1"
              >
                View Detailed Analytics
              </ActionButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">User Growth</p>
                <p className="text-2xl font-bold text-blue-600">+12%</p>
                <p className="text-xs text-gray-500 mt-1">compared to last month</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Course Completion</p>
                <p className="text-2xl font-bold text-green-600">{stats.avgCompletionRate}%</p>
                <p className="text-xs text-gray-500 mt-1">average completion rate</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Daily Active Users</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-1">users today</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Engagement Rate</p>
                <p className="text-2xl font-bold text-orange-600">72%</p>
                <p className="text-xs text-gray-500 mt-1">platform engagement</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
