/**
 * Progress Tracking Page for Learners
 * Created by CaptainCode
 * Displays comprehensive learning progress, course completion rates, and statistics
 */

import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react';
import { useGetLearnerProgress, useGetLearnerCourses, useGetLearnerDashboard } from '@/shared/hooks/useLearnerData';
import { learnerAPI } from '@/shared/api/client';
import {
  Card,
  PageHeading,
  ProgressBar,
  StatCard,
  StatusPill,
} from '@/shared/ui/talentFlow';

interface CourseProgress {
  courseId: number;
  title: string;
  category: string;
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
  status: 'not-started' | 'in-progress' | 'completed';
  enrolledDate: string;
}

interface LearnerStats {
  totalCoursesEnrolled: number;
  completedCourses: number;
  inProgressCourses: number;
  certificatesEarned: number;
  totalHoursLearned: number;
  learningStreak: number;
  averageCompletionRate: number;
}

interface Assignment {
  id: number;
  title: string;
  courseId: number;
  courseName: string;
  status: 'pending' | 'submitted' | 'graded';
  dueDate: string;
  grade?: number;
  submittedDate?: string;
}

export function ProgressTrackingPage() {
  const { data: progressData, loading: progressLoading, error: progressError } = useGetLearnerProgress() as {
    data: any;
    loading: boolean;
    error: string | null;
  };
  const { loading: coursesLoading } = useGetLearnerCourses();
  const { loading: dashboardLoading } = useGetLearnerDashboard();

  const [courseProgresses, setCourseProgresses] = useState<CourseProgress[]>([]);
  const [learnerStats, setLearnerStats] = useState<LearnerStats>({
    totalCoursesEnrolled: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certificatesEarned: 0,
    totalHoursLearned: 0,
    learningStreak: 0,
    averageCompletionRate: 0,
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'courses' | 'assignments'>('overview');

  // Calculate stats from progress data
  useEffect(() => {
    if (progressData?.progress) {
      const progresses: CourseProgress[] = progressData.progress.map((item: any) => ({
        courseId: item.courseId,
        title: item.title || `Course ${item.courseId}`,
        category: item.category || 'General',
        completedLessons: item.completedLessons || 0,
        totalLessons: item.totalLessons || 1,
        percentComplete: item.completionPercentage || 0,
        status: item.status || (item.completionPercentage === 100 ? 'completed' : item.completionPercentage > 0 ? 'in-progress' : 'not-started'),
        enrolledDate: item.enrolledDate || new Date().toISOString(),
      }));

      setCourseProgresses(progresses);

      // Calculate aggregate stats
      const completed = progresses.filter((p) => p.percentComplete === 100).length;
      const inProgress = progresses.filter((p) => p.percentComplete > 0 && p.percentComplete < 100).length;
      const totalHours = progresses.reduce((sum, p) => sum + (p.totalLessons * 0.5), 0); // Assume 30min per lesson
      const avgCompletion = progresses.length > 0 ? Math.round(progresses.reduce((sum, p) => sum + p.percentComplete, 0) / progresses.length) : 0;

      setLearnerStats({
        totalCoursesEnrolled: progresses.length,
        completedCourses: completed,
        inProgressCourses: inProgress,
        certificatesEarned: progressData.certificates?.length || 0,
        totalHoursLearned: Math.round(totalHours),
        learningStreak: calculateLearningStreak(progresses),
        averageCompletionRate: avgCompletion,
      });
    }
  }, [progressData]);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await learnerAPI.getAssignments();
        if (response?.data?.data) {
          setAssignments(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };
    fetchAssignments();
  }, []);

  const calculateLearningStreak = (progresses: CourseProgress[]): number => {
    // Simple calculation: days since first enrollment
    if (progresses.length === 0) return 0;
    const enrolledDates = progresses.map((p) => new Date(p.enrolledDate).getTime());
    const oldestDate = Math.min(...enrolledDates);
    const today = new Date().getTime();
    const streak = Math.floor((today - oldestDate) / (1000 * 60 * 60 * 24));
    return Math.max(1, streak);
  };

  const isLoading = progressLoading || coursesLoading || dashboardLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (progressError) {
    return (
      <div className="p-6">
        <Card className="bg-red-50 border-red-200 text-red-700">
          Error loading progress data: {progressError}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-8">
        <PageHeading title="Learning Progress" />
        <p className="text-gray-600 mt-2">Track your learning journey and achievements</p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Courses Enrolled"
            value={String(learnerStats.totalCoursesEnrolled)}
            tone="blue"
          />
          <StatCard
            title="Courses Completed"
            value={String(learnerStats.completedCourses)}
            tone="default"
          />
          <StatCard
            title="Certificates Earned"
            value={String(learnerStats.certificatesEarned)}
            tone="amber"
          />
          <StatCard
            title="Hours Learned"
            value={String(learnerStats.totalHoursLearned)}
            tone="rose"
          />
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">Overall Progress</h3>
                  <span className="text-2xl font-bold text-blue-600">{learnerStats.averageCompletionRate}%</span>
                </div>
                <ProgressBar value={learnerStats.averageCompletionRate} />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{learnerStats.inProgressCourses}</div>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{learnerStats.completedCourses}</div>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{learnerStats.totalCoursesEnrolled - learnerStats.completedCourses - learnerStats.inProgressCourses}</div>
                  <p className="text-sm text-gray-600">Not Started</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Target className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Learning Streak</p>
                  <p className="text-2xl font-bold text-orange-600">{learnerStats.learningStreak} days</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Pro Tip</p>
                <p className="text-sm text-blue-700 mt-1">
                  Keep your learning streak going! Consistent learning leads to better retention.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-3 font-medium transition-colors ${
              selectedTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('courses')}
            className={`px-4 py-3 font-medium transition-colors ${
              selectedTab === 'courses'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Courses ({courseProgresses.length})
          </button>
          <button
            onClick={() => setSelectedTab('assignments')}
            className={`px-4 py-3 font-medium transition-colors ${
              selectedTab === 'assignments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Assignments ({assignments.length})
          </button>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Courses */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Recently Enrolled</h3>
              <div className="space-y-3">
                {courseProgresses.slice(0, 3).map((course) => (
                  <div key={course.courseId} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{course.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{course.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900">{course.percentComplete}%</p>
                      <ProgressBar value={course.percentComplete} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Performance Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-bold text-blue-600">{learnerStats.averageCompletionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Courses</span>
                  <span className="font-bold text-green-600">{learnerStats.inProgressCourses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Finished Courses</span>
                  <span className="font-bold text-blue-600">{learnerStats.completedCourses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Time Invested</span>
                  <span className="font-bold text-orange-600">{learnerStats.totalHoursLearned}h</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Courses Tab */}
        {selectedTab === 'courses' && (
          <div className="space-y-4">
            {courseProgresses.length === 0 ? (
              <Card className="text-center py-8">
                <BookOpen className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600">No courses enrolled yet</p>
              </Card>
            ) : (
              courseProgresses.map((course) => (
                <Card key={course.courseId}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <StatusPill
                          label={course.status}
                          tone={
                            course.status === 'completed'
                              ? 'success'
                              : course.status === 'in-progress'
                                ? 'warning'
                                : 'neutral'
                          }
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{course.category}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen size={16} />
                          {course.completedLessons}/{course.totalLessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          Enrolled {new Date(course.enrolledDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{course.percentComplete}%</div>
                      <ProgressBar value={course.percentComplete} />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {selectedTab === 'assignments' && (
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <Card className="text-center py-8">
                <CheckCircle className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600">No assignments yet</p>
              </Card>
            ) : (
              assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                        <StatusPill
                          label={assignment.status}
                          tone={
                            assignment.status === 'graded'
                              ? 'success'
                              : assignment.status === 'submitted'
                                ? 'primary'
                                : 'warning'
                          }
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{assignment.courseName}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        {assignment.submittedDate && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={16} />
                            Submitted: {new Date(assignment.submittedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {assignment.status === 'graded' && assignment.grade !== undefined ? (
                        <div className="text-2xl font-bold text-green-600">{assignment.grade}%</div>
                      ) : (
                        <StatusPill
                          label={assignment.status}
                          tone={
                            assignment.status === 'graded'
                              ? 'success'
                              : assignment.status === 'submitted'
                                ? 'primary'
                                : 'warning'
                          }
                        />
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
