import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  accountAPI,
  analyticsAPI,
  announcementsAPI,
  communicationAPI,
  instructorAPI,
  roleSettingsAPI,
} from '@/shared/api/client';
import { formatDate, unwrapData, useAsyncResource } from '@/shared/api/live';
import { useAuthStore } from '@/shared/state/auth';
import { useSearchContext } from '@/shared/state/search';
import { getCourseIcon } from '@/shared/utils/courseVisuals';
import { ActionButton, Card, CircleAvatar, LinkButton, PageHeading, StatCard, StatusPill, TabButton } from '@/shared/ui/talentFlow';
import { AnnouncementForm } from './AnnouncementForm';

const ErrorCard = ({ error }: { error: string | null }) => (error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null);
const EmptyCard = ({ text }: { text: string }) => <Card className="text-sm text-[#7a80a9]">{text}</Card>;

function courseGlyph(category?: string) {
  return getCourseIcon(category);
}

function courseStatusTone(status?: string) {
  const lower = String(status || '').toLowerCase();
  if (lower === 'draft') return 'warning' as const;
  if (lower === 'archived') return 'neutral' as const;
  return 'primary' as const;
}

export function InstructorDashboardPage() {
  const { data: courses, refetch: refetchCourses } = useAsyncResource(() => instructorAPI.getCourses(), []);
  const { data: submissions, refetch: refetchSubmissions } = useAsyncResource(() => instructorAPI.getSubmissions(), []);
  const pending = (submissions || []).filter((item: any) => String(item.status).toLowerCase() !== 'graded');
  const learners = Array.from(new Set((submissions || []).map((item: any) => item.learner?.id || item.userId).filter(Boolean))).length;
  const average = Math.round((submissions || []).reduce((sum: number, item: any) => sum + (item.score || 0), 0) / Math.max((submissions || []).filter((item: any) => item.score != null).length, 1));
  
  const handleRefresh = () => {
    refetchCourses();
    refetchSubmissions();
  };

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1d245d]">Dashboard</h1>
        </div>
        <button
          onClick={handleRefresh}
          className="px-3 py-1.5 text-[11px] font-semibold text-[#1d245d] border border-[#d8dcee] rounded-lg hover:bg-[#f8f9fc] transition"
        >
          Refresh
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Learners" value={String(learners)} tone="rose" />
        <StatCard title="Active Courses" value={String(courses?.length || 0)} tone="blue" />
        <StatCard title="Pending Submissions" value={String(pending.length)} tone="default" />
        <StatCard title="Average Score" value={`${average || 0}%`} tone="amber" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-[18px] font-semibold text-[#1f2560]">My Courses</h3>
          {(courses || []).slice(0, 5).map((course: any) => (
            <div className="flex items-center justify-between rounded-md border border-[#e4e6f2] bg-[#fcfcff] px-2.5 py-2" key={course.id}>
              <div>
                <p className="text-[11px] font-semibold text-[#2a315f]">{course.title}</p>
                <p className="text-[10px] text-[#7a80a8]">{course.lessonCount || 0} lessons • {course.assignmentCount || 0} assignments</p>
              </div>
              <StatusPill label={course.status} tone={course.status === 'draft' ? 'warning' : 'neutral'} />
            </div>
          ))}
        </Card>
        <Card className="space-y-3">
          <h3 className="text-[18px] font-semibold text-[#1f2560]">Pending Submissions</h3>
          {pending.slice(0, 5).map((item: any) => (
            <div className="flex items-center justify-between rounded-md border border-[#e4e6f2] bg-[#fcfcff] px-2.5 py-2" key={item.id}>
              <p className="text-[11px] font-semibold text-[#2a315f]">{item.assignment?.title || item.assignmentTitle || 'Assignment'}</p>
              <LinkButton to="/instructor/submissions" variant="primary">Review</LinkButton>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export function InstructorCoursesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const { searchQuery } = useSearchContext();
  const { data, loading, error } = useAsyncResource(async () => {
    const courses = unwrapData<any[]>(await instructorAPI.getCourses()) || [];
    const learnersByCourse = await Promise.all(
      courses.map(async (course: any) => {
        try {
          const learners = unwrapData<any[]>(await instructorAPI.getCourseLearners(course.id)) || [];
          return [String(course.id), learners.length];
        } catch {
          return [String(course.id), 0];
        }
      }),
    );

    return courses.map((course: any) => ({
      ...course,
      learnerCount: Number(Object.fromEntries(learnersByCourse)[String(course.id)] || 0),
    }));
  }, []);
  
  const filtered = useMemo(() => {
    let result = (data || []).filter((course: any) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'active') return String(course.status) === 'published';
      return String(course.status) === activeTab;
    });
    
    if (searchQuery) {
      result = result.filter((course: any) =>
        (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [data, activeTab, searchQuery]);

  return (
    <div className="space-y-7">
      <PageHeading
        title="My courses"
        subtitle="Create, monitor, and update the courses you own."
        action={<LinkButton to="/instructor/courses/create" variant="primary">Create courses</LinkButton>}
      />
      <ErrorCard error={error} />
      <div className="flex flex-wrap gap-6 border-b border-[#e0e4ec] pb-3">
        {[
          { key: 'all', label: `All (${(data || []).length})` },
          { key: 'active', label: `Active (${(data || []).filter((course: any) => String(course.status) === 'published').length})` },
          { key: 'draft', label: `Draft (${(data || []).filter((course: any) => String(course.status) === 'draft').length})` },
          { key: 'archived', label: `Archived (${(data || []).filter((course: any) => String(course.status) === 'archived').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`border-b-2 pb-2 text-[13px] font-medium transition-colors ${
              activeTab === tab.key ? 'border-[#1d245d] text-[#1d245d]' : 'border-transparent text-[#6f769c] hover:text-[#1d245d]'
            }`}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <EmptyCard text="Loading courses..." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course: any) => {
            const category = course.category || 'General';
            const learnerCount = Number(course.learnerCount || 0);
            const actionLabel = String(course.status) === 'draft' ? 'Continue setup' : 'View submissions';
            const actionTo = String(course.status) === 'draft' ? `/instructor/courses/${course.id}` : '/instructor/submissions';
            const instructorName = [course.instructorFirstName, course.instructorLastName].filter(Boolean).join(' ') || 'You';

            return (
              <Card className="overflow-hidden p-0" key={course.id}>
                <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-[#eef2fb] via-[#f9fafc] to-[#e6edf8] text-6xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(8,16,123,0.08),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(240,138,44,0.16),_transparent_40%)]" />
                  <div className="relative rounded-2xl border border-white/80 bg-white px-5 py-4 shadow-sm">
                    {courseGlyph(category)}
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-lg border border-[#d7dbef] bg-white px-3 py-1 text-[10px] font-semibold text-[#2f356f]">
                      {category}
                    </span>
                    <StatusPill label={String(course.status)} tone={courseStatusTone(course.status)} />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-[#1d245d]">{course.title}</p>
                    <p className="mt-1 text-[12px] text-[#5f6796]">
                      Instructor: {instructorName}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[#6f769c]">
                      {course.description || 'This course is ready for modules, lessons, and assignments.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#f7f8fc] p-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-[#8d93b1]">Lessons</p>
                      <p className="mt-1 text-[15px] font-bold text-[#1d245d]">{course.lessonCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-[#8d93b1]">Learners</p>
                      <p className="mt-1 text-[15px] font-bold text-[#1d245d]">{learnerCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-[#8d93b1]">Tasks</p>
                      <p className="mt-1 text-[15px] font-bold text-[#1d245d]">{course.assignmentCount || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <LinkButton to={`/instructor/courses/${course.id}`} variant="secondary">Open</LinkButton>
                    <LinkButton to={actionTo} variant="primary">{actionLabel}</LinkButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function InstructorCreateCoursePage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'draft',
    category: 'Backend Engineering',
    level: 'beginner',
    duration: '6',
    catalogVisibility: 'public',
    pdfViewerUrl: '',
    liveSessionUrl: '',
    documentLinks: '',
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeading title="Create course" subtitle="Set up the core details for a new course before adding content." />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Course title</label>
              <input className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" placeholder="Backend Engineering Fundamentals" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Description</label>
              <textarea className="min-h-[160px] w-full rounded-lg border border-[#d8dcee] px-3 py-3 text-[12px]" placeholder="Describe the course outcomes, modules, and learner expectations." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Category</label>
              <input className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Level</label>
              <select className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Status</label>
              <select className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Duration (hours)</label>
              <input className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" type="number" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">PDF viewer URL</label>
              <input className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" placeholder="https://..." value={form.pdfViewerUrl} onChange={(e) => setForm({ ...form, pdfViewerUrl: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Live session link</label>
              <input className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" placeholder="https://meet.google.com/..." value={form.liveSessionUrl} onChange={(e) => setForm({ ...form, liveSessionUrl: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Document links</label>
              <textarea className="min-h-[90px] w-full rounded-lg border border-[#d8dcee] px-3 py-3 text-[12px]" placeholder="One document URL per line" value={form.documentLinks} onChange={(e) => setForm({ ...form, documentLinks: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <ActionButton loading={saving} variant="primary" onClick={async () => {
              setSaving(true);
              try {
                await instructorAPI.createCourse({
                  ...form,
                  duration: Number(form.duration),
                  documentLinks: form.documentLinks.split('\n').map((item) => item.trim()).filter(Boolean),
                  assignments: []
                });
                navigate('/instructor/courses');
              } finally { setSaving(false); }
            }}>Save course</ActionButton>
            <LinkButton to="/instructor/courses" variant="secondary">Cancel</LinkButton>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#eef2fb] via-[#f8faff] to-[#fff2e8] text-6xl">
            {courseGlyph(form.category)}
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-[#d7dbef] px-3 py-1 text-[10px] font-semibold text-[#2f356f]">{form.category}</span>
              <StatusPill label={form.status} tone={courseStatusTone(form.status)} />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#001d4c]">{form.title || 'Your course title'}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-[#6f769c]">{form.description || 'A live preview of how the course header will look once it is created.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f7f8fc] p-3">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-[#8d93b1]">Level</p>
                <p className="mt-1 text-[13px] font-bold text-[#1d245d] capitalize">{form.level}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-[#8d93b1]">Duration</p>
                <p className="mt-1 text-[13px] font-bold text-[#1d245d]">{form.duration || '0'} hrs</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function InstructorSubmissionsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'graded'>('all');
  const { searchQuery } = useSearchContext();
  const { data, loading, error } = useAsyncResource(() => instructorAPI.getSubmissions(), []);
  
  const rows = useMemo(() => {
    let result = (data || []).filter((entry: any) => activeTab === 'all' ? true : String(entry.status).toLowerCase() === activeTab);
    
    if (searchQuery) {
      result = result.filter((entry: any) =>
        (entry.assignment?.title || entry.assignmentTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.learner?.name || entry.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [data, activeTab, searchQuery]);
  
  return (
    <div className="space-y-5">
      <PageHeading title="Submissions" />
      <ErrorCard error={error} />
      <div className="flex gap-2">{['all', 'pending', 'graded'].map((tab) => <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab as any)}>{tab}</TabButton>)}</div>
      {loading ? <EmptyCard text="Loading submissions..." /> : (
        <Card className="space-y-3">
          {rows.map((row: any) => (
            <div className="flex items-center justify-between border-b border-[#eceff8] pb-3 last:border-b-0" key={row.id}>
              <div><p className="text-[11px] font-semibold text-[#2f356f]">{row.assignment?.title || row.assignmentTitle || 'Assignment'}</p><p className="text-[10px] text-[#8e93b2]">{row.learner?.name || row.email || 'Learner'} • {formatDate(row.submittedAt || row.updatedAt)}</p></div>
              <LinkButton to={`/instructor/grades/${row.id}`} variant="primary">Grade</LinkButton>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

export function InstructorGradesPage() {
  const { submissionId } = useParams() as { submissionId?: string };
  const { data, loading } = useAsyncResource(
    () => (submissionId ? instructorAPI.getSubmission(submissionId) : instructorAPI.getSubmissions()),
    submissionId ? null : [],
  );
  const submission = submissionId ? data : data?.[0];
  const [score, setScore] = useState(85);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (submission?.score != null) {
      setScore(Number(submission.score));
    }
    if (submission?.feedback) {
      setFeedback(submission.feedback);
    }
  }, [submission]);
  return (
    <div className="max-w-[640px] space-y-4">
      <PageHeading title="Grade Assignment" />
      {loading || !submission ? <EmptyCard text="Loading submission..." /> : (
        <>
          <Card><p className="text-[12px] font-semibold text-[#2a315f]">{submission.learner?.name || 'Learner'}</p><p className="text-[10px] text-[#7a80a8]">{submission.assignment?.title || 'Assignment'}</p></Card>
          <Card className="space-y-3">
            <input className="h-10 rounded-md border border-[#d7dcef] px-3 text-[11px]" type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} />
            <textarea className="min-h-[90px] rounded-md border border-[#d7dcef] px-3 py-2 text-[11px]" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            <ActionButton loading={saving} variant="primary" onClick={async () => {
              setSaving(true);
              try {
                await instructorAPI.gradeSubmission(submission.id, { score, feedback, status: 'graded' });
              } finally { setSaving(false); }
            }}>Submit Grade</ActionButton>
          </Card>
        </>
      )}
    </div>
  );
}

export function InstructorLearnersPage() {
  const { searchQuery } = useSearchContext();
  const { data, loading, error } = useAsyncResource(() => instructorAPI.getLearners(), []);
  
  const filtered = useMemo(() => {
    if (!searchQuery) return data || [];
    return (data || []).filter((row: any) =>
      (row.learner?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.learner?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);
  
  return (
    <div className="space-y-4">
      <PageHeading title="Learners" />
      <ErrorCard error={error} />
      {loading ? (
        <EmptyCard text="Loading learners..." />
      ) : (
        <Card className="space-y-2">
          {filtered.map((row: any) => (
            <div className="flex items-center gap-3 rounded-md border border-[#eceff8] px-2.5 py-2" key={row.learner?.id}>
              <CircleAvatar initials={(row.learner?.name || 'L').slice(0,2).toUpperCase()} />
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-[#2f356f]">{row.learner?.name}</p>
                <p className="text-[10px] text-[#8e93b2]">{row.learner?.email}</p>
              </div>
              <StatusPill label={`${row.courses?.length || 0} courses`} tone="neutral" />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

export function InstructorDiscussionPage() {
  const { searchQuery } = useSearchContext();
  const { data: channels } = useAsyncResource(() => communicationAPI.listChannels(), []);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  
  useEffect(() => { if (!active && channels?.[0]?.id) setActive(String(channels[0].id)); }, [channels, active]);
  useEffect(() => { if (!active) return; communicationAPI.listMessages(active).then((res: any) => setMessages(unwrapData<any[]>(res))); }, [active]);
  
  const filteredChannels = useMemo(() => {
    if (!searchQuery) return channels || [];
    return (channels || []).filter((channel: any) =>
      (channel.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, searchQuery]);
  
  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    return messages.filter((m: any) =>
      (m.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);
  
  return (
    <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
      <Card className="space-y-2">
        {(filteredChannels || []).map((channel: any) => (
          <button
            key={channel.id}
            type="button"
            className="w-full rounded-md border px-3 py-2 text-left"
            onClick={() => setActive(String(channel.id))}
          >
            {channel.name}
          </button>
        ))}
      </Card>
      <Card className="space-y-3">
        {filteredMessages.map((m: any) => (
          <div key={m.id} className="rounded-md bg-[#f8f9fc] p-3 text-[11px]">
            {m.content}
          </div>
        ))}
        {active && (
          <div className="flex gap-2">
            <input
              className="h-10 flex-1 rounded-md border border-[#d8dcee] px-3 text-[11px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <ActionButton
              variant="primary"
              onClick={async () => {
                await communicationAPI.postMessage(active, { content });
                const res = await communicationAPI.listMessages(active);
                setMessages(unwrapData<any[]>(res));
                setContent('');
              }}
            >
              Send
            </ActionButton>
          </div>
        )}
      </Card>
    </div>
  );
}

export function InstructorAnalyticsPage() {
  const { data: statsData, loading, error } = useAsyncResource(
    () => analyticsAPI.getInstructorStats(),
    []
  );

  // Sample data for weekly completion
  const weeklyCompletionData = [
    { week: 'week 1', value: 75 },
    { week: 'week 3', value: 65 },
    { week: 'week 5', value: 50 },
    { week: 'Sat', value: 85 },
  ];

  // Sample data for top courses
  const topCourses = [
    { name: 'Social Marketing', rating: 5 },
    { name: 'UI/UX Design', rating: 5 },
    { name: 'Digital Marketing', rating: 4.5 },
  ];

  // Per-course breakdown data from API
  const courseBreakdown = Array.isArray(statsData)
    ? statsData.map((course: any) => ({
        name: course.courseTitle || course.title || 'Untitled Course',
        enrolled: course.enrolledCount || 0,
        avgProgress: Math.round(course.averageProgress || 0),
        avgScore: course.averageScore || 0,
        completions: course.completions || 0,
      }))
    : [];

  const maxCompletionValue = Math.max(...weeklyCompletionData.map((d) => d.value), 100);
  const totalLearnings = courseBreakdown.reduce((sum, c) => sum + c.enrolled, 0);
  const avgCompletion = courseBreakdown.length
    ? Math.round(courseBreakdown.reduce((sum, c) => sum + c.avgProgress, 0) / courseBreakdown.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeading title="Instructor Dashboard" subtitle="Live instructor course analytics" />
      <ErrorCard error={error} />

      {loading ? (
        <EmptyCard text="Loading analytics..." />
      ) : (
        <>
          {/* Top Metrics */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Learnings" value={String(totalLearnings)} tone="rose" />
            <StatCard title="Active Students" value={String(courseBreakdown.length * 2 || 22)} tone="blue" />
            <StatCard
              title="Avg Time Per Course"
              value={`${courseBreakdown.length > 0 ? '2.4' : '0'}h`}
            />
            <StatCard title="Course Completion" value={`${avgCompletion}%`} tone="amber" />
          </div>

          {/* Weekly Completion Chart */}
          <Card>
            <h2 className="mb-4 text-[13px] font-semibold text-[#1d245d]">Weekly Completion</h2>
            <div className="flex items-end justify-start gap-4 h-48 px-2">
              {weeklyCompletionData.map((data) => (
                <div
                  key={data.week}
                  className="flex flex-col items-center gap-2 flex-1 min-w-[60px]"
                >
                  <div
                    className="w-full bg-[#6366f1] rounded-sm transition-all hover:bg-[#FF7A18]"
                    style={{
                      height: `${(data.value / maxCompletionValue) * 160}px`,
                    }}
                    title={`${data.week}: ${data.value}%`}
                  />
                  <span className="text-[10px] text-[#8d93b1]">{data.week}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Course Performance */}
          <Card>
            <h2 className="mb-4 text-[13px] font-semibold text-[#1d245d]">Course Performance</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-[11px] font-semibold text-[#2f356f] mb-3">Top Courses</h3>
                <div className="space-y-2">
                  {topCourses.map((course) => (
                    <div key={course.name} className="text-[11px] text-[#2f356f]">
                      {course.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#e1e4f2] pt-4">
                <h3 className="text-[11px] font-semibold text-[#2f356f] mb-2">Average ratings:</h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-lg">
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Per-Course Breakdown */}
          <Card>
            <h2 className="mb-4 text-[13px] font-semibold text-[#1d245d]">Per-Course Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-[#eceff8]">
                    <th className="text-left py-2 px-2 text-[#2f356f] font-semibold">Course</th>
                    <th className="text-center py-2 px-2 text-[#2f356f] font-semibold">Enrolled</th>
                    <th className="text-center py-2 px-2 text-[#2f356f] font-semibold">Avg Progress</th>
                    <th className="text-center py-2 px-2 text-[#2f356f] font-semibold">Avg Score</th>
                    <th className="text-center py-2 px-2 text-[#2f356f] font-semibold">Completions</th>
                  </tr>
                </thead>
                <tbody>
                  {courseBreakdown.length > 0 ? (
                    courseBreakdown.slice(0, 5).map((course) => (
                      <tr key={course.name} className="border-b border-[#eceff8] hover:bg-[#f8f9fc]">
                        <td className="py-2 px-2 text-[#2f356f] font-medium line-clamp-1">
                          {course.name}
                        </td>
                        <td className="py-2 px-2 text-center text-[#8d93b1]">{course.enrolled}</td>
                        <td className="py-2 px-2">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-12 h-1.5 bg-[#e1e4f2] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#00d084]"
                                style={{ width: `${course.avgProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-[#8d93b1]">{course.avgProgress}%</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center text-[#0c1248] font-semibold">
                          {course.avgScore > 0 ? `${Math.round(course.avgScore)}/100` : '-'}
                        </td>
                        <td className="py-2 px-2 text-center text-[#08107b] font-semibold">
                          {course.completions}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 px-2 text-center text-[#8d93b1]">
                        No courses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export function InstructorCourseDetailPage() {
  const { courseId } = useParams() as { courseId: string };
  const { data: course, loading, error, refetch } = useAsyncResource(
    () => instructorAPI.getCourse(courseId),
    null
  );
  const { data: learners } = useAsyncResource(
    () => instructorAPI.getCourseLearners(courseId),
    []
  );
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '', maxScore: 100, allowResubmission: true });
  const [savingAssignment, setSavingAssignment] = useState(false);

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        level: course.level || 'beginner',
        status: course.status || 'draft',
        duration: course.duration || 6,
        pdfViewerUrl: course.pdfViewerUrl || '',
        liveSessionUrl: course.liveSessionUrl || '',
        documentLinks: Array.isArray(course.documentLinks) ? course.documentLinks.join('\n') : '',
      });
    }
  }, [course]);

  const handleSave = async () => {
    try {
      await instructorAPI.updateCourse(courseId, {
        ...form,
        documentLinks: String(form.documentLinks || '').split('\n').map((item) => item.trim()).filter(Boolean),
      });
      setIsEditing(false);
      refetch();
      alert('Course updated successfully');
    } catch (err: any) {
      alert('Failed to update course: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeading title={course?.title || 'Loading...'} subtitle={course?.category || ''} />
        <div className="flex gap-2">
          <LinkButton to="/instructor/courses" variant="secondary">
            Back
          </LinkButton>
          <ActionButton
            variant="danger"
            onClick={async () => {
              await instructorAPI.deleteCourse(courseId);
              navigate('/instructor/courses');
            }}
          >
            Delete
          </ActionButton>
          <ActionButton
            variant={isEditing ? 'secondary' : 'primary'}
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? 'Save' : 'Edit'}
          </ActionButton>
        </div>
      </div>

      <ErrorCard error={error} />

      {loading ? (
        <EmptyCard text="Loading course details..." />
      ) : course ? (
        <>
          {/* Course Overview */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Enrolled Learners" value={String(course.enrolledCount || learners?.length || 0)} />
            <StatCard title="Duration" value={`${course.duration || 0}h`} tone="blue" />
            <StatCard title="Status" value={course.status?.toUpperCase() || 'DRAFT'} tone="amber" />
            <StatCard title="Level" value={course.level?.toUpperCase() || 'BEGINNER'} />
          </div>

          {/* Course Details */}
          <Card className="space-y-4">
            <h2 className="text-[14px] font-semibold text-[#1d245d]">Course Information</h2>

            {isEditing ? (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">
                      Title
                    </label>
                    <input
                      className="h-10 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">
                      Description
                    </label>
                    <textarea
                      className="min-h-[120px] w-full rounded-lg border border-[#d8dcee] px-3 py-2 text-[12px]"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">
                        Category
                      </label>
                      <input
                        className="h-10 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">
                        Level
                      </label>
                      <select
                        className="h-10 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]"
                        value={form.level}
                        onChange={(e) => setForm({ ...form, level: e.target.value })}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">
                        Duration (hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="h-10 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">
                        Status
                      </label>
                      <select
                        className="h-10 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">PDF viewer URL</label>
                      <input
                        className="h-10 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]"
                        value={form.pdfViewerUrl || ''}
                        onChange={(e) => setForm({ ...form, pdfViewerUrl: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Live session link</label>
                      <input
                        className="h-10 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]"
                        value={form.liveSessionUrl || ''}
                        onChange={(e) => setForm({ ...form, liveSessionUrl: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-[11px] font-semibold text-[#1d245d]">Document links</label>
                      <textarea
                        className="min-h-[100px] w-full rounded-lg border border-[#d8dcee] px-3 py-2 text-[12px]"
                        value={form.documentLinks || ''}
                        onChange={(e) => setForm({ ...form, documentLinks: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-[11px] font-semibold text-[#8d93b1]">Description</p>
                  <p className="mt-1 text-[12px] text-[#2f356f]">{course.description || 'No description'}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold text-[#8d93b1]">Category</p>
                    <p className="mt-1 text-[12px] text-[#2f356f]">{course.category || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#8d93b1]">Level</p>
                    <p className="mt-1 text-[12px] text-[#2f356f]">{course.level || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#8d93b1]">PDF Viewer</p>
                    <p className="mt-1 text-[12px] text-[#2f356f]">{course.pdfViewerUrl || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#8d93b1]">Live Session</p>
                    <p className="mt-1 text-[12px] text-[#2f356f]">{course.liveSessionUrl || '-'}</p>
                  </div>
                </div>
              </>
            )}
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#1d245d]">Assignments</h2>
              <span className="text-[10px] text-[#8d93b1]">{course.assignments?.length || 0} total</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="h-10 rounded-lg border border-[#d8dcee] px-3 text-[12px]"
                placeholder="Assignment title"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-[#d8dcee] px-3 text-[12px]"
                type="date"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
              />
              <textarea
                className="min-h-[100px] rounded-lg border border-[#d8dcee] px-3 py-2 text-[12px] md:col-span-2"
                placeholder="Assignment brief"
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
              />
              <input
                className="h-10 rounded-lg border border-[#d8dcee] px-3 text-[12px]"
                type="number"
                min="1"
                value={assignmentForm.maxScore}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, maxScore: Number(e.target.value) })}
              />
              <label className="flex items-center gap-2 text-[12px] font-medium text-[#1d245d]">
                <input
                  checked={assignmentForm.allowResubmission}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, allowResubmission: e.target.checked })}
                  type="checkbox"
                />
                Allow resubmission
              </label>
            </div>
            <ActionButton
              loading={savingAssignment}
              variant="primary"
              onClick={async () => {
                setSavingAssignment(true);
                try {
                  await instructorAPI.createAssignment(courseId, assignmentForm);
                  setAssignmentForm({ title: '', description: '', dueDate: '', maxScore: 100, allowResubmission: true });
                  refetch();
                } finally {
                  setSavingAssignment(false);
                }
              }}
            >
              Add Assignment
            </ActionButton>
            <div className="space-y-2">
              {(course.assignments || []).map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between rounded-lg border border-[#eceff8] px-3 py-3">
                  <div>
                    <p className="text-[12px] font-semibold text-[#1d245d]">{assignment.title}</p>
                    <p className="text-[10px] text-[#7a80a9]">
                      Due {formatDate(assignment.dueDate)} · Max {assignment.maxScore || 100}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <LinkButton to={`/instructor/grades`} variant="secondary">Review</LinkButton>
                    <ActionButton
                      variant="danger"
                      onClick={async () => {
                        await instructorAPI.deleteAssignment(assignment.id);
                        refetch();
                      }}
                    >
                      Delete
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Enrolled Learners */}
          <Card>
            <h2 className="mb-4 text-[13px] font-semibold text-[#1d245d]">Enrolled Learners</h2>
            {learners && learners.length > 0 ? (
              <div className="space-y-2">
                {learners.slice(0, 10).map((learner: any) => (
                  <div
                    key={learner.id || learner.userId}
                    className="flex items-center justify-between border-b border-[#eceff8] pb-2 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <CircleAvatar
                        initials={`${learner.firstName?.[0] || ''}${learner.lastName?.[0] || ''}`.toUpperCase()}
                      />
                      <div>
                        <p className="text-[11px] font-semibold text-[#2f356f]">
                          {`${learner.firstName || ''} ${learner.lastName || ''}`.trim()}
                        </p>
                        <p className="text-[10px] text-[#8d93b1]">{learner.email || '-'}</p>
                      </div>
                    </div>
                    <StatusPill
                      label={`${Math.round(learner.progress || 0)}%`}
                      tone="primary"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#8d93b1]">No learners enrolled yet</p>
            )}
          </Card>
        </>
      ) : (
        <EmptyCard text="Course not found" />
      )}
    </div>
  );
}

export function InstructorProfilePage() {
  const { user } = useAuthStore();
  return <div className="max-w-[760px] space-y-5"><div className="flex justify-start"><LinkButton to="/instructor/profile/edit" variant="secondary">Edit Profile</LinkButton></div><Card><p className="text-[28px] font-semibold text-[#1f2560]">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p><p className="text-[11px] text-[#6e75a0]">{user?.email}</p><p className="text-[11px] text-[#2f356f]">{user?.bio || 'Instructor profile powered by live account data.'}</p></Card></div>;
}

export function InstructorEditProfilePage() {
  const { user, setUser } = useAuthStore();
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  return <div className="max-w-[760px] space-y-5"><PageHeading title="Edit Profile" /><Card className="space-y-3"><textarea className="min-h-[120px] rounded-md border border-[#d8dcee] px-3 py-2 text-[11px]" value={bio} onChange={(e) => setBio(e.target.value)} /><ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await accountAPI.updateSettings({ bio }); setUser(user ? { ...user, bio } : user); } finally { setSaving(false); } }}>Save Changes</ActionButton></Card></div>;
}

export function InstructorAnnouncementsPage() {
  const { data, loading, error } = useAsyncResource(() => announcementsAPI.listAnnouncements(), []);
  return <div className="max-w-[860px] space-y-5"><PageHeading title="Announcements" action={<LinkButton to="/instructor/announcements/new" variant="secondary">+ Add Announcement</LinkButton>} /><ErrorCard error={error} />{loading ? <EmptyCard text="Loading announcements..." /> : <div className="space-y-2">{(data || []).map((row: any) => <Card key={row.id}><p className="text-[12px] font-semibold text-[#2f356f]">{row.title}</p><p className="mt-1 text-[11px] text-[#646b95]">{row.content}</p><p className="mt-1 text-[10px] text-[#a0a6c4]">{formatDate(row.createdAt)}</p></Card>)}</div>}</div>;
}

export function InstructorAddAnnouncementPage() {
  return <AnnouncementForm />;
}

export function InstructorSettingsPage() {
  const { data: settings, loading } = useAsyncResource(() => roleSettingsAPI.getInstructorSettings(), {} as any);
  const [form, setForm] = useState<any>({}); const [saving, setSaving] = useState(false);
  useEffect(() => setForm(settings?.settings || settings || {}), [settings]);
  return <div className="max-w-[860px] space-y-6"><PageHeading subtitle="Manage your account and preferences." title="Settings" />{loading ? <EmptyCard text="Loading settings..." /> : <Card className="space-y-3">{['assignmentReminders','announcements','submissionNotifications','discussionAlerts'].map((key) => <label key={key} className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3"><span className="text-[12px] font-medium text-[#1d245d]">{key}</span><input checked={Boolean(form[key])} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} type="checkbox" className="h-5 w-5 accent-[#08107b]" /></label>)}<ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await roleSettingsAPI.updateInstructorSettings({ settings: form }); } finally { setSaving(false); } }}>Save Settings</ActionButton></Card>}</div>;
}

export function InstructorChangeEmailPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [saving, setSaving] = useState(false);
  return <div className="max-w-[600px] space-y-5"><PageHeading title="Change Email Address" /><Card className="space-y-3"><input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="New email" /><input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Current password" type="password" /><ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await accountAPI.changeEmail(email, password); } finally { setSaving(false); } }}>Save New Email</ActionButton></Card></div>;
}

export function InstructorChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [saving, setSaving] = useState(false);
  return <div className="max-w-[600px] space-y-5"><PageHeading title="Change Password" /><Card className="space-y-3"><input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" type="password" /><input className="h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" type="password" /><ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await accountAPI.changePassword(currentPassword, newPassword); } finally { setSaving(false); } }}>Save New Password</ActionButton></Card></div>;
}
