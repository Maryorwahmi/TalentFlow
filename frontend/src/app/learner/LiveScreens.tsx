import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  assignmentsAPI,
  certificatesAPI,
  coursesAPI,
  learnerAPI,
  notificationsAPI,
  roleSettingsAPI,
  teamsAPI,
  accountAPI,
} from '@/shared/api/client';
import { formatDate, unwrapData, useAsyncResource } from '@/shared/api/live';
import { useAuthStore } from '@/shared/state/auth';
import { getCourseVisual } from '@/shared/utils/courseVisuals';
import { useSearchContext } from '@/shared/state/search';
import {
  ActionButton,
  Card,
  CircleAvatar,
  LinkButton,
  PageHeading,
  ProgressBar,
  StatCard,
  StatusPill,
  TabButton,
} from '@/shared/ui/talentFlow';
import { ProgressTrackingPage } from './ProgressTrackingPage';
import { DiscussionCollaborationPage } from './DiscussionCollaborationPage';

function ErrorCard({ error }: { error: string | null }) {
  if (!error) return null;
  return <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card>;
}

function EmptyCard({ text }: { text: string }) {
  return <Card className="text-sm text-[#7a80a9]">{text}</Card>;
}

function formatDurationLabel(hours?: number | null) {
  if (!hours) {
    return 'Self-paced';
  }

  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
}

async function openCertificatePdf(certificateId: string | number) {
  const response = await certificatesAPI.downloadCertificate(certificateId);
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function LearnerDashboardPage() {
  const { data, loading, error, refetch } = useAsyncResource(() => learnerAPI.getDashboard(), {
    courses: [],
    pendingAssignments: [],
    certificatesIssued: 0,
    progress: [],
  });

  const metrics = [
    { title: 'Active Courses', value: String(data?.courses?.length || 0), tone: 'blue' as const },
    { title: 'Certificates Earned', value: String(data?.certificatesIssued || 0), tone: 'amber' as const },
    {
      title: 'Overall Progress',
      value: `${Math.round(
        (data?.progress || []).reduce((sum: number, item: any) => sum + (item.overallPercent || item.overall_percent || 0), 0) /
          Math.max((data?.progress || []).length, 1)
      )}%`,
      tone: 'default' as const,
    },
    { title: 'Pending Assignments', value: String(data?.pendingAssignments?.length || 0), tone: 'rose' as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeading 
        title="Welcome back!" 
        subtitle="Here is your live learning snapshot." 
        action={
          <ActionButton variant="secondary" onClick={refetch} loading={loading}>
            Refresh
          </ActionButton>
        }
      />
      <ErrorCard error={error} />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.title} title={metric.title} value={metric.value} tone={metric.tone} />
        ))}
      </div>
      <Card>
        <h2 className="mb-4 text-xs sm:text-[13px] font-semibold text-[#1d245d]">Recent Courses</h2>
        {loading ? (
          <p className="text-[10px] sm:text-[11px] text-[#7a80a9]">Loading courses...</p>
        ) : data?.courses?.length ? (
          <div className="space-y-3">
            {data.courses.slice(0, 4).map((course: any) => (
              <div key={course.id} className="border-b border-[#e1e4f2] pb-3 last:border-b-0">
                <div className="mb-2 flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <Link className="text-[11px] sm:text-[12px] font-medium text-[#1d245d] hover:text-[#0c1248] line-clamp-1" to={`/learner/courses/${course.id}`}>
                      {course.title}
                    </Link>
                    <p className="text-[9px] sm:text-[10px] text-[#7a80a9] mt-0.5">
                      {course.lessonCount || 0} lessons • {course.assignmentCount || 0} assignments
                    </p>
                  </div>
                  <StatusPill label={`${Math.round(course.progress?.overallPercent || course.progress?.overall_percent || 0)}%`} tone="primary" />
                </div>
                <ProgressBar value={Math.round(course.progress?.overallPercent || course.progress?.overall_percent || 0)} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] sm:text-[11px] text-[#7a80a9]">You have not enrolled in any courses yet.</p>
        )}
      </Card>
      <Card>
        <h2 className="mb-4 text-xs sm:text-[13px] font-semibold text-[#1d245d]">Pending Assignments</h2>
        {data?.pendingAssignments?.length ? (
          <div className="space-y-2">
            {data.pendingAssignments.slice(0, 5).map((assignment: any) => (
              <div key={assignment.id} className="flex items-center justify-between gap-2 sm:gap-3 text-[10px] sm:text-[11px] border-b border-[#e1e4f2] pb-2 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#1d245d] line-clamp-1">{assignment.title}</p>
                  <p className="text-[#7a80a9] text-[9px] sm:text-[10px] mt-0.5">Due {formatDate(assignment.dueAt || assignment.dueDate)}</p>
                </div>
                <LinkButton to={`/learner/assignments/${assignment.id}`} variant="secondary">
                  Open
                </LinkButton>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] sm:text-[11px] text-[#7a80a9]">No pending assignments right now.</p>
        )}
      </Card>
    </div>
  );
}

export function MyCoursesPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const { data, loading, error, refetch } = useAsyncResource(() => learnerAPI.getCourses(), []);
  const { searchQuery } = useSearchContext();

  const filtered = useMemo(() => {
    let courses = (data || []).filter((course: any) => {
      const progress = Math.round(course.progress?.overallPercent || course.progress?.overall_percent || 0);
      // Map 'published' status to 'active' for filtering
      let status = progress >= 100 ? 'completed' : (course.status || 'active');
      if (status === 'published') status = 'active';
      return filterStatus === 'all' ? true : status === filterStatus;
    });

    // Apply search filter
    if (searchQuery) {
      courses = courses.filter(
        (course: any) =>
          (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.category || course.discipline || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return courses;
  }, [data, filterStatus, searchQuery]);

  const tabCounts = useMemo(() => {
    const allCount = (data || []).length;
    const activeCount = (data || []).filter((course: any) => {
      const progress = Math.round(course.progress?.overallPercent || course.progress?.overall_percent || 0);
      let status = progress >= 100 ? 'completed' : (course.status || 'active');
      if (status === 'published') status = 'active';
      return status === 'active';
    }).length;
    const completedCount = (data || []).filter((course: any) => {
      const progress = Math.round(course.progress?.overallPercent || course.progress?.overall_percent || 0);
      return progress >= 100;
    }).length;
    const archivedCount = (data || []).filter((course: any) => course.status === 'archived').length;
    return { all: allCount, active: activeCount, completed: completedCount, archived: archivedCount };
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeading
        title="My Courses"
        subtitle="Your live enrollments and progress"
        action={
          <div className="flex flex-wrap gap-2">
            <ActionButton variant="secondary" onClick={refetch} loading={loading} className="mr-2">
              Refresh
            </ActionButton>
            {['all', 'active', 'completed', 'archived'].map((tab) => (
              <TabButton key={tab} active={filterStatus === tab} onClick={() => setFilterStatus(tab as any)}>
                {tab[0].toUpperCase() + tab.slice(1)} ({tabCounts[tab as keyof typeof tabCounts]})
              </TabButton>
            ))}
          </div>
        }
      />
      <ErrorCard error={error} />
      {loading ? (
        <EmptyCard text="Loading your courses..." />
      ) : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course: any) => {
            const progress = Math.round(course.progress?.overallPercent || course.progress?.overall_percent || 0);
            const isCompleted = progress >= 100;
            const statusLabel = isCompleted
              ? 'Completed'
              : String(course.status || '').toLowerCase() === 'published'
                ? 'Active'
                : (course.status || 'Active');
            return (
              <Card key={course.id} className="flex flex-col h-full">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1d245d] line-clamp-2">{course.title}</p>
                    <p className="text-[10px] text-[#7a80a9] mt-1">{course.category || course.discipline || 'Course'}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusPill label={statusLabel} tone={isCompleted ? 'success' : 'primary'} />
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] text-[#7a80a9]">Progress</p>
                    <p className="text-[9px] font-semibold text-[#1d245d]">{progress}%</p>
                  </div>
                  <ProgressBar value={progress} />
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-[10px] text-[#7a80a9]">{course.lessonCount || 0} lessons • {course.assignmentCount || 0} assignments</p>
                  <LinkButton to={`/learner/courses/${course.id}`} variant="secondary">
                    Continue
                  </LinkButton>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyCard text={searchQuery ? "No courses match your search." : "No courses match this filter yet."} />
      )}
    </div>
  );
}

export function CourseCatalogPage() {
  const navigate = useNavigate();
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest'>('popular');
  const [page, setPage] = useState(1);
  const { searchQuery } = useSearchContext();
  const { data, loading, error, refetch } = useAsyncResource(
    async () => {
      const [catalogResponse, enrolledResponse, certificatesResponse] = await Promise.all([
        coursesAPI.listCourses({
          page,
          pageSize: 9,
          search: searchQuery || undefined,
          category: filterDiscipline !== 'all' ? filterDiscipline : undefined,
        }),
        learnerAPI.getCourses(),
        learnerAPI.getCertificates(),
      ]);

      const catalogPayload = unwrapData<any>(catalogResponse) || {};

      return {
        catalog: catalogPayload.courses || [],
        pagination: catalogPayload.pagination || null,
        enrolled: unwrapData<any[]>(enrolledResponse) || [],
        certificates: unwrapData<any[]>(certificatesResponse) || [],
      };
    },
    { catalog: [], pagination: null, enrolled: [], certificates: [] },
  );

  const catalog = data?.catalog || [];
  const pagination = data?.pagination;
  const enrolled = data?.enrolled || [];
  const certificates = data?.certificates || [];

  const enrolledMap = useMemo(
    () => new Map((enrolled || []).map((course: any) => [String(course.id), course])),
    [enrolled],
  );

  const completedCertificateMap = useMemo(
    () => new Set((certificates || []).map((certificate: any) => String(certificate.courseId))),
    [certificates],
  );

  const catalogCourses = useMemo(() => {
    const merged = (catalog || []).map((course: any) => {
      const id = String(course.id || course.course_id);
      const enrolledCourse: any = enrolledMap.get(id);
      const progress = Math.round(
        enrolledCourse?.progress?.overallPercent ||
        enrolledCourse?.progress?.overall_percent ||
        0,
      );
      const instructors = Array.isArray(course.instructors) ? course.instructors : [];
      const instructorName =
        instructors.map((item: any) => item.name).filter(Boolean)[0] ||
        enrolledCourse?.instructor ||
        'TalentFlow Instructor';
      const category = course.category || course.discipline || 'General';
      const isEnrolled = Boolean(enrolledCourse);
      const isCompleted = progress >= 100 || completedCertificateMap.has(id);

      return {
        ...course,
        id,
        category,
        instructorName,
        isEnrolled,
        isCompleted,
        progress,
        lessonCount: Number(course.lessonCount || course.lesson_count || enrolledCourse?.lessonCount || 0),
        assignmentCount: Number(course.assignmentCount || enrolledCourse?.assignmentCount || 0),
      };
    });

    let filtered = merged.filter((course: any) =>
      filterDiscipline === 'all' ? true : String(course.category).toLowerCase() === filterDiscipline,
    );

    return filtered.sort((left: any, right: any) => {
      if (sortBy === 'newest') {
        return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
      }

      return (right.progress + right.lessonCount + right.assignmentCount) - (left.progress + left.lessonCount + left.assignmentCount);
    });
  }, [catalog, completedCertificateMap, enrolledMap, filterDiscipline, sortBy]);

  const featuredCourse = catalogCourses[0];
  const categories = useMemo(() => {
    const counts = (catalog || []).reduce((acc: Record<string, number>, course: any) => {
      const key = String(course.category || course.discipline || 'General');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return [
      { id: 'all', label: 'All Courses', count: pagination?.total || catalog.length },
      ...Object.entries(counts).map(([label, count]) => ({
        id: label.toLowerCase(),
        label,
        count,
      })),
    ];
  }, [catalog, pagination?.total]);

  useEffect(() => {
    setPage(1);
  }, [filterDiscipline, searchQuery]);

  return (
    <div className="space-y-8">
      <PageHeading title="Course Catalog" subtitle="Browse all available courses and enroll." />
      <ErrorCard error={error} />

      {featuredCourse && (
        <Card className="overflow-hidden border-[#e0e4ec] bg-[#f3f4f8] p-0">
          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[120px_1fr_260px] lg:items-center">
            <div className={`flex h-28 w-28 items-center justify-center rounded-2xl ${getCourseVisual(featuredCourse.category).iconBg} shadow-lg text-4xl`}>
              {getCourseVisual(featuredCourse.category).icon}
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4f5b93]">Featured Course</p>
              <h2 className="text-[28px] font-bold tracking-tight text-[#001d4c]">{featuredCourse.title}</h2>
              <p className="text-sm text-[#4f5b93]">
                {featuredCourse.description || 'Master professional skills with our comprehensive learning paths.'}
              </p>
              <p className="text-[12px] font-medium text-[#4f5b93]">
                {featuredCourse.lessonCount} lessons · {Math.max(featuredCourse.assignmentCount, 1)} assignments · Certificate included
              </p>
              <ActionButton
                variant="primary"
                onClick={() => navigate(featuredCourse.isEnrolled ? `/learner/courses/${featuredCourse.id}` : `/catalog/${featuredCourse.id}`)}
              >
                {featuredCourse.isCompleted ? 'View Course' : featuredCourse.isEnrolled ? 'Continue' : 'Explore'}
              </ActionButton>
            </div>
            <div className="flex items-end justify-end">
              <div className="w-full max-w-[240px]">
                <ProgressBar value={featuredCourse.progress} />
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <TabButton
              key={category.id}
              active={filterDiscipline === category.id}
              onClick={() => setFilterDiscipline(category.id)}
            >
              {category.label} ({category.count})
            </TabButton>
          ))}
        </div>
        <select
          className="rounded-lg border border-[#d8dcee] bg-white px-3 py-2 text-[11px] font-semibold text-[#1d245d] outline-none"
          onChange={(event) => setSortBy(event.target.value as 'popular' | 'newest')}
          value={sortBy}
        >
          <option value="popular">Sort: Most Popular</option>
          <option value="newest">Sort: Newest</option>
        </select>
      </div>

      {loading ? (
        <EmptyCard text="Loading catalog..." />
      ) : !catalogCourses.length ? (
        <EmptyCard text={searchQuery ? "No courses match your search." : "No published courses are available in the catalog yet."} />
      ) : (
        <>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {catalogCourses.map((course: any) => {
            const visual = getCourseVisual(course.category);
            return (
              <Card key={course.id} className="flex h-full flex-col overflow-hidden p-0">
                <div
                  className={`flex h-40 cursor-pointer items-center justify-center ${visual.bgColor} text-5xl shadow-md hover:shadow-lg transition-shadow`}
                  onClick={() => navigate(`/catalog/${course.id}`)}
                >
                  {visual.icon}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-lg border border-[#d7dbef] bg-white px-3 py-1 text-[10px] font-semibold text-[#2f356f]">
                      {course.category}
                    </span>
                    <span className="rounded-lg bg-[#0a1179] px-3 py-1 text-[10px] font-semibold text-white">
                      {course.lessonCount} lessons · {Math.max(course.assignmentCount, 1)} tasks
                    </span>
                  </div>
                  <h3 className="text-[17px] font-bold text-[#001d4c]">{course.title}</h3>
                  <p className="mt-1 text-[12px] text-[#4f5b93]">by {course.instructorName}</p>
                  <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-[#6a7199]">
                    {course.description || 'No description available yet.'}
                  </p>

                  <div className="mt-auto space-y-3 pt-4">
                    <ProgressBar value={course.progress} />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8d93b1]">
                        {course.isCompleted ? 'Certificate included' : course.isEnrolled ? 'In progress' : 'Not started'}
                      </span>
                      {course.isCompleted ? (
                        <LinkButton to="/learner/certificates" variant="success">View Certificate</LinkButton>
                      ) : course.isEnrolled ? (
                        <LinkButton to={`/learner/courses/${course.id}`} variant="primary">Resume</LinkButton>
                      ) : (
                        <ActionButton
                          variant="primary"
                          onClick={async () => {
                            try {
                              await learnerAPI.enrollCourse(course.id);
                              await refetch();
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                        >
                          + Enroll
                        </ActionButton>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        {pagination && pagination.totalPages > 1 ? (
          <Card className="mt-6 flex items-center justify-between">
            <p className="text-[11px] text-[#5f6796]">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} courses
            </p>
            <div className="flex gap-2">
              <ActionButton variant="secondary" disabled={!pagination.hasPreviousPage} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
                Previous
              </ActionButton>
              <ActionButton variant="primary" disabled={!pagination.hasNextPage} onClick={() => setPage((current) => current + 1)}>
                Next
              </ActionButton>
            </div>
          </Card>
        ) : null}
        </>
      )}
    </div>
  );
}

export function CourseDetailsPage() {
  const { id } = useParams();
  const { data, loading, error } = useAsyncResource(() => coursesAPI.getCourseDetail(id), null);
  const navigate = useNavigate();

  const firstLesson = (data?.lessons || [])[0];

  return (
    <div className="space-y-6">
      <PageHeading title={data?.title || 'Course Details'} subtitle={data?.tagline || data?.description || 'Live course detail view'} action={<LinkButton to="/learner/courses" variant="secondary">Back</LinkButton>} />
      <ErrorCard error={error} />
      {loading || !data ? (
        <EmptyCard text="Loading course..." />
      ) : (
        <>
          <Card>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-[10px] text-[#7a80a9]">Status</p>
                <p className="text-[12px] font-semibold text-[#1d245d]">{data.status}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#7a80a9]">Lessons</p>
                <p className="text-[12px] font-semibold text-[#1d245d]">{data.lessons?.length || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#7a80a9]">Assignments</p>
                <p className="text-[12px] font-semibold text-[#1d245d]">{data.assignments?.length || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#7a80a9]">Progress</p>
                <p className="text-[12px] font-semibold text-[#1d245d]">{Math.round(data.progress?.overallPercent || 0)}%</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill label={data.discipline || data.category || 'Course'} tone="primary" />
              <StatusPill label={`${formatDurationLabel(data.duration)} programme`} tone="neutral" />
              <StatusPill label="Certificate on completion" tone="success" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {firstLesson && (
                <ActionButton variant="primary" onClick={() => navigate(`/learner/courses/${id}/learn`)}>
                  Start Learning
                </ActionButton>
              )}
              <LinkButton to="/learner/certificates" variant="secondary">
                View Certificates
              </LinkButton>
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 text-[13px] font-semibold text-[#1d245d]">Course Outline</h2>
            <div className="space-y-4">
              {(data.modules || []).map((module: any, moduleIndex: number) => (
                <div key={module.id} className="rounded-2xl border border-[#e1e4f2] bg-[#fbfcff] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f08a2c]">Section {moduleIndex + 1}</p>
                      <p className="mt-2 text-[15px] font-semibold text-[#1d245d]">{module.title}</p>
                      <p className="mt-1 text-[11px] leading-6 text-[#5f6796]">{module.description}</p>
                    </div>
                    <StatusPill label={`${module.lessons?.length || 0} lessons`} tone="neutral" />
                  </div>
                  <div className="mt-4 space-y-2">
                    {(module.lessons || []).map((lesson: any, lessonIndex: number) => (
                      <div key={lesson.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#edf0fb] bg-white px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#ebedf5] text-[9px] font-semibold text-[#1d245d]">
                              {moduleIndex + 1}.{lessonIndex + 1}
                            </span>
                            <p className="line-clamp-1 text-[12px] font-semibold text-[#1d245d]">{lesson.title}</p>
                          </div>
                          <p className="ml-7 mt-1 text-[10px] leading-5 text-[#7a80a9]">{lesson.content}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[#f08a2c]">{lesson.durationMinutes || 0} mins</span>
                          <LinkButton to={`/learner/courses/${id}/learn`} variant="secondary">
                            Open
                          </LinkButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(!data.modules || data.modules.length === 0) && <p className="text-[11px] text-[#7a80a9]">No lessons available yet.</p>}
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 text-[13px] font-semibold text-[#1d245d]">Learning Map</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#e1e4f2] bg-[#fbfcff] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Branches</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(data.branches || []).map((branch: string) => (
                    <span key={branch} className="rounded-full bg-[#eef3ff] px-3 py-2 text-[11px] font-semibold text-[#2f356f]">{branch}</span>
                  ))}
                </div>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Learning Focus</p>
                <p className="mt-2 text-[11px] leading-6 text-[#5f6796]">{data.learningFocus}</p>
              </div>
              <div className="rounded-2xl border border-[#e1e4f2] bg-[#fffaf5] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Recommended Books</p>
                <div className="mt-3 space-y-3">
                  {(data.recommendedBooks || []).map((book: any) => (
                    <div key={book.title} className="rounded-2xl border border-[#f0e2d2] bg-white px-4 py-3">
                      <p className="text-[12px] font-semibold text-[#1d245d]">{book.title}</p>
                      <p className="mt-1 text-[10px] font-semibold text-[#f08a2c]">{book.author}</p>
                      <p className="mt-1 text-[10px] leading-5 text-[#7a80a9]">{book.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 text-[13px] font-semibold text-[#1d245d]">Assignments & Certification</h2>
            <div className="space-y-3">
              {(data.assignments || []).map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between gap-3 border-b border-[#e1e4f2] pb-3 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#1d245d] line-clamp-1">{assignment.title}</p>
                    <p className="mt-1 text-[10px] text-[#7a80a9]">Due {formatDate(assignment.dueAt || assignment.dueDate)}</p>
                  </div>
                  <LinkButton to={`/learner/assignments/${assignment.id}`} variant="secondary">
                    View
                  </LinkButton>
                </div>
              ))}
              {(!data.assignments || data.assignments.length === 0) && <p className="text-[11px] text-[#7a80a9]">No assignments available yet.</p>}
              <div className="rounded-2xl border border-dashed border-[#d8dcee] bg-[#fbfcff] px-4 py-4">
                <p className="text-[11px] font-semibold text-[#1d245d]">Certification rule</p>
                <p className="mt-1 text-[11px] leading-6 text-[#5f6796]">
                  {data.completionRequirement || 'Complete every lesson and assignment before your certificate can be generated.'}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export function LessonPage() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useAsyncResource(() => learnerAPI.getLesson(id), null);
  const [saving, setSaving] = useState(false);
  const completed = Boolean(data?.progress?.completedLessons?.includes?.(data?.id) || data?.progress?.completed);

  return (
    <div className="space-y-6">
      <PageHeading title={data?.title || 'Lesson'} subtitle={data?.courseTitle || 'Live lesson content'} action={<LinkButton to="/learner/courses" variant="secondary">Back</LinkButton>} />
      <ErrorCard error={error} />
      {loading || !data ? (
        <EmptyCard text="Loading lesson..." />
      ) : (
        <>
          <Card className="space-y-4">
            <p className="text-[11px] leading-6 text-[#5f6796]">{data.content || data.description || 'Lesson content is available for enrolled learners.'}</p>
          </Card>
          <div className="flex gap-2">
            <ActionButton
              loading={saving}
              variant="primary"
              onClick={async () => {
                setSaving(true);
                try {
                  await learnerAPI.updateLessonProgress(id, !completed);
                  await refetch();
                } finally {
                  setSaving(false);
                }
              }}
            >
              {completed ? 'Mark as Incomplete' : 'Mark as Complete'}
            </ActionButton>
          </div>
        </>
      )}
    </div>
  );
}

// Enhanced Progress Page - imported from ProgressTrackingPage
export function ProgressPage() {
  return <ProgressTrackingPage />;
}

// Re-export the comprehensive ProgressTrackingPage as well for direct import
export { ProgressTrackingPage } from './ProgressTrackingPage';

export function AssignmentsPage() {
  const { data, loading, error } = useAsyncResource(() => learnerAPI.getAssignments(), []);
  const { searchQuery } = useSearchContext();

  const filteredAssignments = useMemo(() => {
    if (!searchQuery) {
      return data || [];
    }

    return (data || []).filter(
      (assignment: any) =>
        (assignment.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assignment.courseTitle || assignment.courseName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assignment.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeading title="Assignments" subtitle="Live coursework and submission status" />
      <ErrorCard error={error} />
      {loading ? (
        <EmptyCard text="Loading assignments..." />
      ) : filteredAssignments?.length ? (
        <div className="space-y-3">
          {filteredAssignments.map((assignment: any) => (
            <Card key={assignment.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold text-[#1d245d]">{assignment.title}</p>
                  <p className="text-[10px] text-[#7a80a9]">{assignment.courseTitle || assignment.courseName || 'Course assignment'}</p>
                  <p className="mt-1 text-[10px] text-[#7a80a9]">Due: {formatDate(assignment.dueAt || assignment.dueDate)}</p>
                  {assignment.feedback ? (
                    <p className="mt-1 text-[10px] text-[#2f356f]">Feedback available from your instructor.</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill
                    label={assignment.isLate && !assignment.submission ? 'Late' : assignment.submission ? (assignment.submission.status || 'Submitted') : 'Pending'}
                    tone={assignment.submission ? (String(assignment.submission.status).toLowerCase() === 'graded' ? 'success' : 'primary') : assignment.isLate ? 'warning' : 'warning'}
                  />
                  {assignment.submissionId && String(assignment.status).toLowerCase() === 'graded' ? (
                    <LinkButton to={`/learner/assignments/${assignment.submissionId}/graded`} variant="primary">
                      Feedback
                    </LinkButton>
                  ) : (
                    <LinkButton to={`/learner/assignments/${assignment.id}`} variant="primary">
                      {assignment.submissionId ? 'Update' : 'View'}
                    </LinkButton>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyCard text={searchQuery ? "No assignments match your search." : "No assignments yet."} />
      )}
    </div>
  );
}

export function AssignmentsSubmissionPage() {
  const { id } = useParams();
  const { data, loading, error } = useAsyncResource(() => assignmentsAPI.getAssignmentDetail(id), null);
  const [textResponse, setTextResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeading title={data?.title || 'Assignment'} subtitle={data?.courseTitle || 'Submit your work'} action={<LinkButton to="/learner/assignments" variant="secondary">Back</LinkButton>} />
      <ErrorCard error={error} />
      {loading || !data ? (
        <EmptyCard text="Loading assignment..." />
      ) : (
        <>
          <Card>
            <h2 className="mb-3 text-[12px] font-semibold text-[#1d245d]">Instructions</h2>
            <p className="text-[11px] text-[#5f6796]">{data.instructions || data.description || 'Complete the assignment and submit your response.'}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-[#f8f9fc] p-3 text-[10px] text-[#5f6796]">
                <span className="font-semibold text-[#1d245d]">Due Date:</span> {formatDate(data.dueDate)}
              </div>
              <div className="rounded-lg bg-[#f8f9fc] p-3 text-[10px] text-[#5f6796]">
                <span className="font-semibold text-[#1d245d]">Max Score:</span> {data.maxScore || 100}
              </div>
              <div className="rounded-lg bg-[#f8f9fc] p-3 text-[10px] text-[#5f6796]">
                <span className="font-semibold text-[#1d245d]">Resubmission:</span> {data.allowResubmission ? 'Allowed' : 'One attempt'}
              </div>
            </div>
          </Card>
          <Card className="space-y-3">
            <label className="block text-[11px] font-semibold text-[#2f356f]">
              Written response
              <textarea className="mt-2 min-h-[160px] w-full rounded-md border border-[#d8dcee] px-3 py-2 text-[11px]" value={textResponse} onChange={(e) => setTextResponse(e.target.value)} />
            </label>
            {data.dueDate && new Date(data.dueDate).getTime() < Date.now() ? (
              <p className="text-[10px] text-[#b45309]">This assignment is past the due date. You can still submit, but it may be marked late.</p>
            ) : null}
            <div className="flex gap-2">
              <ActionButton
                loading={savingDraft}
                variant="secondary"
                onClick={async () => {
                  setSavingDraft(true);
                  try {
                    const formData = new FormData();
                    formData.append('textResponse', textResponse);
                    if (data.submissionId) {
                      await learnerAPI.saveSubmissionDraft(data.submissionId, formData);
                    }
                  } finally {
                    setSavingDraft(false);
                  }
                }}
              >
                Save Draft
              </ActionButton>
              <ActionButton
                loading={submitting}
                variant="primary"
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    const formData = new FormData();
                    formData.append('textResponse', textResponse);
                    await learnerAPI.submitAssignment(id, formData);
                    navigate('/learner/assignments');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                Submit Assignment
              </ActionButton>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export function AssignmentsGradedPage() {
  const { id } = useParams();
  const { data, loading, error } = useAsyncResource(() => learnerAPI.getSubmission(id), null);

  return (
    <div className="space-y-6">
      <PageHeading title={data?.assignment?.title || 'Graded Submission'} subtitle="Live grading details" action={<LinkButton to="/learner/assignments" variant="secondary">Back</LinkButton>} />
      <ErrorCard error={error} />
      {loading || !data ? (
        <EmptyCard text="Loading submission..." />
      ) : (
        <>
          <Card className="border-2 border-[#9cd4ae] bg-[#e7f8eb] p-6">
            <div className="text-center">
              <p className="text-[11px] text-[#1f7b3a]">Your Score</p>
              <p className="text-[32px] font-bold text-[#1f7b3a]">{data.score ?? 'Pending'}</p>
              <p className="mt-2 text-[10px] text-[#1f7b3a]">Graded {formatDate(data.gradedAt || data.updatedAt)}</p>
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 text-[12px] font-semibold text-[#1d245d]">Instructor Feedback</h2>
            <p className="text-[11px] text-[#5f6796]">{data.feedback || 'Feedback will appear here once grading is complete.'}</p>
          </Card>
          {data.assignment?.allowResubmission ? (
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold text-[#1d245d]">Resubmission Available</p>
                <p className="text-[10px] text-[#5f6796]">You can improve your work and submit another version.</p>
              </div>
              <LinkButton to={`/learner/assignments/${data.assignment.id}`} variant="primary">Resubmit</LinkButton>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}

export function CertificatePage() {
  const { data, loading, error } = useAsyncResource(() => certificatesAPI.listCertificates(), []);
  const certificates = data || [];
  const featuredCertificate = certificates[0];

  return (
    <div className="space-y-6">
      <PageHeading title="Certificates" subtitle="Completed courses and downloadable certificates from live learner records" />
      <ErrorCard error={error} />
      {loading ? (
        <EmptyCard text="Loading certificates..." />
      ) : !certificates.length ? (
        <EmptyCard text="No certificates yet. Complete a certificate-enabled course to generate one here." />
      ) : (
        <>
          <Card className="overflow-hidden border-0 bg-transparent p-0 shadow-none">
            <div className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_28%),linear-gradient(135deg,#1d245d_0%,#28327f_54%,#f08a2c_140%)] p-[1px]">
              <div className="relative overflow-hidden rounded-[27px] bg-[#f8f3eb] px-4 py-5 md:px-8 md:py-8">
                <div className="pointer-events-none absolute -left-10 top-6 h-32 w-32 rounded-full bg-[#f7d4b1]/50 blur-2xl" />
                <div className="pointer-events-none absolute -right-8 bottom-0 h-36 w-36 rounded-full bg-[#f0b073]/25 blur-2xl" />
                <div className="relative rounded-[24px] border border-[#e8d7c2] bg-[linear-gradient(180deg,#fffaf4_0%,#f8efe1_100%)] px-5 py-7 shadow-[0_24px_80px_rgba(29,36,93,0.12)] md:px-10 md:py-10">
                  <div className="mx-auto max-w-3xl text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[#f08a2c]">TalentFlow</p>
                    <h2 className="mt-3 font-serif text-[28px] font-bold leading-tight text-[#1d245d] md:text-[42px]">Certificate of Completion</h2>
                    <div className="mx-auto mt-4 h-px w-40 bg-[#f08a2c]/70" />
                    <p className="mt-6 text-[12px] uppercase tracking-[0.28em] text-[#8a6f55]">This certifies that</p>
                    <p className="mt-4 font-serif text-[26px] font-semibold text-[#1d245d] md:text-[40px]">{featuredCertificate.learnerName || 'Learner'}</p>
                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#5f567b]">
                      has successfully completed all required lessons and assessments in
                    </p>
                    <p className="mt-3 text-[20px] font-bold text-[#f08a2c] md:text-[28px]">
                      {featuredCertificate.courseTitle || featuredCertificate.title || 'Certificate Course'}
                    </p>
                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#5f567b]">
                      guided by {featuredCertificate.instructorName || 'TalentFlow Instructor'} with a duration of{' '}
                      {formatDurationLabel(featuredCertificate.courseDuration)}.
                    </p>

                    <div className="mt-8 grid gap-3 text-left md:grid-cols-3">
                      <div className="rounded-2xl border border-[#ecdcc8] bg-white/70 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Issued</p>
                        <p className="mt-2 text-sm font-semibold text-[#1d245d]">{formatDate(featuredCertificate.issuedAt || featuredCertificate.createdAt)}</p>
                      </div>
                      <div className="rounded-2xl border border-[#ecdcc8] bg-white/70 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Instructor</p>
                        <p className="mt-2 text-sm font-semibold text-[#1d245d]">{featuredCertificate.instructorName || 'TalentFlow Instructor'}</p>
                      </div>
                      <div className="rounded-2xl border border-[#ecdcc8] bg-white/70 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Credential ID</p>
                        <p className="mt-2 text-sm font-semibold text-[#1d245d]">{featuredCertificate.certificateCode || `TF-CERT-${featuredCertificate.id}`}</p>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col items-center justify-between gap-8 md:flex-row md:items-end">
                      <div className="w-full max-w-[220px]">
                        <p className="font-serif text-xl text-[#f08a2c]">Johnson T.</p>
                        <div className="mt-2 h-px bg-[#1d245d]" />
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6a6285]">Programme Director</p>
                      </div>
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#f08a2c]/70 text-center">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#f08a2c]">Official</p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#f08a2c]">Stamp</p>
                        </div>
                      </div>
                      <div className="w-full max-w-[220px]">
                        <p className="font-serif text-xl text-[#f08a2c]">{featuredCertificate.instructorName || 'TalentFlow Instructor'}</p>
                        <div className="mt-2 h-px bg-[#1d245d]" />
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6a6285]">Lead Instructor</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {certificates.map((cert: any) => (
              <Card key={cert.id} className="border border-[#eadccf] bg-[#fffdf9] shadow-[0_18px_50px_rgba(29,36,93,0.08)]">
                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f08a2c]">Completed Course</p>
                      <p className="mt-2 text-lg font-bold leading-snug text-[#1d245d]">{cert.courseTitle || cert.title || 'Certificate'}</p>
                    </div>
                    <div className="rounded-full bg-[#eef6f0] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2d8a57]">
                      Issued
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#f8f6ff] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Learner</p>
                      <p className="mt-1 text-sm font-semibold text-[#1d245d]">{cert.learnerName || 'Learner'}</p>
                    </div>
                    <div className="rounded-2xl bg-[#fff4e9] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b67a3b]">Duration</p>
                      <p className="mt-1 text-sm font-semibold text-[#1d245d]">{formatDurationLabel(cert.courseDuration)}</p>
                    </div>
                    <div className="rounded-2xl bg-[#f3f8ff] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6d7fa7]">Instructor</p>
                      <p className="mt-1 text-sm font-semibold text-[#1d245d]">{cert.instructorName || 'TalentFlow Instructor'}</p>
                    </div>
                    <div className="rounded-2xl bg-[#f7f6f1] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#948773]">Date Issued</p>
                      <p className="mt-1 text-sm font-semibold text-[#1d245d]">{formatDate(cert.issuedAt || cert.createdAt)}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-[#ddd0c1] px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Certificate ID</p>
                    <p className="mt-1 text-sm font-semibold text-[#1d245d]">{cert.certificateCode || `TF-CERT-${cert.id}`}</p>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3">
                    <ActionButton variant="secondary" onClick={() => openCertificatePdf(cert.id)}>
                      Download PDF
                    </ActionButton>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function NotificationPage() {
  const { data, loading, error } = useAsyncResource(() => notificationsAPI.listMyNotifications(), []);

  return (
    <div className="space-y-6">
      <PageHeading title="Notifications" subtitle="Assignment updates, announcements, and platform alerts" />
      <ErrorCard error={error} />
      {loading ? (
        <EmptyCard text="Loading notifications..." />
      ) : (
        <div className="space-y-3">
          {(data || []).map((item: any) => (
            <Card key={item.id}>
              <p className="text-[12px] font-semibold text-[#1d245d]">{item.title}</p>
              <p className="mt-1 text-[11px] text-[#5f6796]">{item.message || item.content}</p>
              <p className="mt-2 text-[10px] text-[#7a80a9]">{formatDate(item.createdAt)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function DiscussionPage() {
  return <DiscussionCollaborationPage />;
}

export function MyTeamPage() {
  const { user } = useAuthStore();
  const { data, loading, error } = useAsyncResource(() => teamsAPI.listTeams(), []);
  const team = (data || []).find((entry: any) => (entry.members || []).some((member: any) => String(member.userId) === String(user?.id))) || null;
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!team?.id) return;
      const response = await teamsAPI.listMembers(team.id);
      setMembers(unwrapData<any[]>(response));
    };
    loadMembers().catch(console.error);
  }, [team?.id]);

  if (loading) return <EmptyCard text="Loading your team..." />;

  return (
    <div className="space-y-6">
      <PageHeading title="My Team" subtitle={team ? team.name : 'No team assigned yet'} />
      <ErrorCard error={error} />
      {!team ? (
        <EmptyCard text="You are not assigned to any team yet." />
      ) : (
        <>
          <Card>
            <div className="grid gap-4 md:grid-cols-3">
              <div><p className="text-[10px] text-[#7a80a9]">Description</p><p className="text-[12px] font-semibold text-[#1d245d]">{team.description || 'Project team'}</p></div>
              <div><p className="text-[10px] text-[#7a80a9]">Members</p><p className="text-[12px] font-semibold text-[#1d245d]">{members.length}</p></div>
              <div><p className="text-[10px] text-[#7a80a9]">Created</p><p className="text-[12px] font-semibold text-[#1d245d]">{formatDate(team.createdAt)}</p></div>
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 text-[14px] font-semibold text-[#1d245d]">Team Members</h2>
            <div className="space-y-3">
              {members.map((member: any) => {
                const name = [member.firstName, member.lastName].filter(Boolean).join(' ');
                return (
                  <div key={member.userId} className="flex items-center justify-between border-b border-[#e1e4f2] pb-3 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <CircleAvatar initials={name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()} tone="primary" />
                      <div>
                        <p className="text-[11px] font-semibold text-[#1d245d]">{name || member.email}</p>
                        <p className="text-[10px] text-[#7a80a9]">{member.email}</p>
                      </div>
                    </div>
                    <StatusPill label={member.role || 'member'} tone="neutral" />
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export function TeamAllocationPage() {
  const { user } = useAuthStore();
  const { data, loading, error, refetch } = useAsyncResource(() => teamsAPI.listTeams(), []);

  return (
    <div className="space-y-6">
      <PageHeading title="Team Allocation" subtitle="Join a live team or view your assignment" />
      <ErrorCard error={error} />
      {loading ? (
        <EmptyCard text="Loading teams..." />
      ) : (
        <div className="space-y-3">
          {(data || []).map((team: any) => (
            <Card key={team.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold text-[#1d245d]">{team.name}</p>
                  <p className="text-[10px] text-[#7a80a9]">{team.description || 'Project team'}</p>
                </div>
                <ActionButton
                  variant="primary"
                  onClick={async () => {
                    if (!user?.id) return;
                    await teamsAPI.addMember(team.id, user.id);
                    await refetch();
                  }}
                >
                  Join
                </ActionButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function LearnerProfilePage() {
  const { user } = useAuthStore();
  const { data: courses } = useAsyncResource(() => learnerAPI.getCourses(), []);
  const { data: certificates } = useAsyncResource(() => learnerAPI.getCertificates(), []);
  const initials = `${user?.firstName?.[0] || 'U'}${user?.lastName?.[0] || ''}`.toUpperCase();
  const completedCourses = (courses || []).filter((course: any) => Math.round(course.progress?.overallPercent || course.progress?.overall_percent || 0) >= 100);
  const averageProgress = (courses || []).length
    ? Math.round((courses || []).reduce((sum: number, course: any) => sum + Math.round(course.progress?.overallPercent || course.progress?.overall_percent || 0), 0) / (courses || []).length)
    : 0;
  const badges = [
    completedCourses.length > 0 ? 'Course Finisher' : null,
    certificates.length > 0 ? 'Certified Learner' : null,
    averageProgress >= 60 ? 'Steady Progress' : null,
    (courses || []).length >= 3 ? 'Consistent Learner' : null,
  ].filter(Boolean);

  return (
    <div className="max-w-[960px] space-y-5">
      <div className="overflow-hidden rounded-xl border border-[#eceff8] bg-white">
        <div className="bg-gradient-to-r from-[#07107b] to-[#000033] px-6 py-7 text-center text-white">
          <p className="text-[11px] opacity-90">This User is a</p>
          <p className="text-[22px] font-bold tracking-wide">{user?.role || 'learner'}</p>
        </div>
        <div className="flex items-start gap-3 px-5 py-4">
          <CircleAvatar initials={initials} tone="primary" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#1f2560]">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p>
            <p className="text-[11px] text-[#646b95]">{user?.email}</p>
          </div>
          <div className="ml-auto"><LinkButton to="/learner/settings" variant="secondary">Settings</LinkButton></div>
        </div>
      </div>
      <Card>
        <h3 className="mb-3 text-[12px] font-semibold text-[#2f356f]">About</h3>
        <p className="text-[11px] leading-5 text-[#646b95]">{user?.bio || 'Update your learner profile from settings to personalize this space.'}</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Average Progress" value={`${averageProgress}%`} tone="blue" />
        <StatCard title="Completed Courses" value={String(completedCourses.length)} tone="default" />
        <StatCard title="Certificates" value={String(certificates.length)} tone="amber" />
        <StatCard title="Endorsements" value={String(Math.max(badges.length - 1, 0))} tone="rose" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-[12px] font-semibold text-[#2f356f]">My Courses</h3>
          <div className="space-y-2">
            {(courses || []).slice(0, 5).map((course: any) => (
              <div key={course.id} className="flex items-center justify-between">
                <span className="text-[11px] text-[#2f356f]">{course.title}</span>
                <StatusPill label={`${Math.round(course.progress?.overallPercent || course.progress?.overall_percent || 0)}%`} tone="primary" />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-[12px] font-semibold text-[#2f356f]">Certificates</h3>
          <div className="space-y-2">
            {(certificates || []).slice(0, 5).map((cert: any) => (
              <div key={cert.id} className="flex items-center justify-between">
                <span className="text-[11px] text-[#2f356f]">{cert.courseTitle || cert.title}</span>
                <span className="text-[10px] text-[#8f94b2]">{formatDate(cert.issuedAt || cert.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-[12px] font-semibold text-[#2f356f]">Achievements & Badges</h3>
          <div className="flex flex-wrap gap-2">
            {badges.length ? badges.map((badge) => (
              <span key={badge} className="rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-semibold text-[#1d245d]">
                {badge}
              </span>
            )) : <p className="text-[11px] text-[#646b95]">Complete more course milestones to unlock badges.</p>}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-[12px] font-semibold text-[#2f356f]">Public Portfolio</h3>
          <p className="text-[11px] leading-5 text-[#646b95]">
            Share your learning story using your public learner link and certificate collection.
          </p>
          <div className="mt-3 rounded-lg bg-[#f8f9fc] px-3 py-2 text-[11px] font-medium text-[#1d245d]">
            talentflow.app/u/{String(user?.id || 'learner')}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function LearnerSettingsPage() {
  const { data: settings, loading, error } = useAsyncResource(() => roleSettingsAPI.getLearnerSettings(), {} as any);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings?.settings || settings || {});
  }, [settings]);

  return (
    <div className="max-w-[960px] space-y-6">
      <PageHeading subtitle="Manage learner preferences and notifications." title="Settings" />
      <ErrorCard error={error} />
      <Card className="space-y-4">
        {loading ? (
          <p className="text-sm text-[#7a80a9]">Loading settings...</p>
        ) : (
          <>
            {[
              'assignmentReminders',
              'announcements',
              'teamMentions',
              'emailNotifications',
              'pushNotifications',
              'smsNotifications',
              'realtimeNotifications',
            ].map((key) => (
              <label key={key} className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
                <div><p className="text-[12px] font-medium text-[#1d245d]">{key}</p></div>
                <input checked={Boolean(form[key])} onChange={(e) => setForm((current: any) => ({ ...current, [key]: e.target.checked }))} type="checkbox" className="h-5 w-5 accent-[#08107b]" />
              </label>
            ))}
            <div className="flex gap-2">
              <ActionButton loading={saving} variant="primary" onClick={async () => {
                setSaving(true);
                try {
                  await roleSettingsAPI.updateLearnerSettings({ settings: form });
                } finally {
                  setSaving(false);
                }
              }}>
                Save Settings
              </ActionButton>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export function LearnerChangeEmailPage() {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-[600px] space-y-5">
      <PageHeading subtitle="Enter your new email and confirm your password" title="Change Email Address" />
      <Card className="space-y-3">
        <input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New email" type="email" />
        <input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Current password" type="password" />
        <ActionButton loading={saving} variant="primary" onClick={async () => {
          setSaving(true);
          try {
            await accountAPI.changeEmail(newEmail, password);
          } finally {
            setSaving(false);
          }
        }}>Save New Email</ActionButton>
      </Card>
    </div>
  );
}

export function LearnerChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-[600px] space-y-5">
      <PageHeading subtitle="Enter your current password, then choose a new one" title="Change Password" />
      <Card className="space-y-3">
        <input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" />
        <input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" />
        <ActionButton loading={saving} variant="primary" onClick={async () => {
          setSaving(true);
          try {
            await accountAPI.changePassword(currentPassword, newPassword);
          } finally {
            setSaving(false);
          }
        }}>Save New Password</ActionButton>
      </Card>
    </div>
  );
}
