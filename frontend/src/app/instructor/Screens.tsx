import { useMemo, useState } from 'react';
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
import { useSearchContext } from '@/shared/state/search';
import { useArraySearch } from '@/shared/hooks/useSearch';

const instructorMetrics = [
  { value: '28', title: 'Total Learners', tone: 'rose' as const },
  { value: '3', title: 'Active Courses', tone: 'blue' as const },
  { value: '7', title: 'Pending Submissions', tone: 'default' as const },
  { value: '81%', title: 'Average score', tone: 'amber' as const },
];

const coursePreviewRows = [
  { title: 'UI/UX Fundamentals', status: 'Active' },
  { title: 'Brand Identity 101', status: 'Active' },
  { title: 'Figma Advanced', status: 'Draft' },
];

const pendingRows = [
  { learner: 'Ada', title: 'User Flow Diagram' },
  { learner: 'Kolade', title: 'Wireframe Set' },
  { learner: 'Bayo', title: 'Brand Moodboard' },
];

const instructorCourses = [
  {
    id: 'ux-fundamentals',
    category: 'UI/UX',
    title: 'UI/UX Fundamentals',
    meta: 'By Mr. Emeka, 30 Learners',
    action: 'Submissions',
  },
  {
    id: 'social-strategy',
    category: 'Social Media',
    title: 'Social Media Strategy',
    meta: 'By Mr. Emeka, 25 Learners',
    action: 'Submissions',
  },
  {
    id: 'brand-identity',
    category: 'Design',
    title: 'Brand Identity 101',
    meta: 'By Mr. Emeka, 18 Learners',
    action: 'Submissions',
  },
  {
    id: 'research-methods',
    category: 'Research',
    title: 'UX Research Methods',
    meta: 'By Mr. Emeka, 30 Learners',
    action: 'Publish',
  },
];

const submissions = [
  { learner: 'Ada Okonkwo', assignment: 'UX Case Study', date: 'Mar 20', status: 'Graded' },
  { learner: 'Bayo Adeyemi', assignment: 'UX Case Study', date: 'Mar 21', status: 'Pending' },
  { learner: 'Temi Lawson', assignment: 'Research Report', date: 'Mar 22', status: 'Pending' },
  { learner: 'Kolade Obi', assignment: 'Wireframe Task', date: 'Mar 22', status: 'Pending' },
];

const learnerRows = [
  { name: 'Ada Okonkwo', progress: 65, initials: 'AO' },
  { name: 'Temi Lawson', progress: 45, initials: 'TL' },
  { name: 'Kolade Obi', progress: 75, initials: 'KO' },
  { name: 'Bayo Adeyemi', progress: 90, initials: 'BA' },
];

const channels = [
  { name: '# general', preview: 'Mr. Emeka: Phase 2 doc...', unread: 2 },
  { name: '# ui-ux-course', preview: 'Ada: Understood review.', unread: 0 },
  { name: '# design-team', preview: 'Bayo: Any colour tokens?', unread: 1 },
  { name: '# frontend-dev', preview: 'Chidi: CSS task is live', unread: 0 },
];

const messages = [
  { sender: 'Ada', text: 'Noted sir!', tone: 'success' as const },
  { sender: 'Kolade', text: 'Got it! Starting wireframes now.', tone: 'warning' as const },
  { sender: 'Bayo', text: 'Anyone need help with colour system?', tone: 'danger' as const },
];

const announcementRows = [
  {
    title: 'Assignment 2 deadline extended',
    detail:
      'The deadline for the AI-prototypes submission has been moved to April 3rd. This gives everyone extra 5 days.',
    date: 'Mar 31, 2026',
  },
  {
    title: 'New lesson - Usability Testing is LIVE',
    detail: 'Lesson 6 on usability testing is now published. Please complete it before end of week.',
    date: 'Mar 30, 2026',
  },
  {
    title: 'Welcome to Figma Advanced!',
    detail: 'Welcome! Phase 1 course build is complete. You will need Figma professional access.',
    date: 'Mar 24, 2026',
  },
];

const lessons = [
  { title: 'Intro to UI/UX Design', status: 'Published' },
  { title: 'Design Thinking Process', status: 'Published' },
  { title: 'User Flows & Diagrams', status: 'Draft' },
];

const assignments = [
  { title: 'User Flow Diagram', status: 'Published' },
  { title: 'Design Thinking Process', status: 'Published' },
];

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[18px] font-semibold text-[#1f2560]">{title}</h3>
      {action && <button className="text-[10px] font-semibold text-[#f08a2c]">{action}</button>}
    </div>
  );
}

export function InstructorDashboardPage() {
  return (
    <div className="space-y-7">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {instructorMetrics.map((item) => (
          <StatCard key={item.title} title={item.title} tone={item.tone} value={item.value} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <SectionHeader action="Set all ->" title="My Courses" />
          <div className="space-y-2">
            {coursePreviewRows.map((item) => (
              <div
                className="flex items-center justify-between rounded-md border border-[#e4e6f2] bg-[#fcfcff] px-2.5 py-2"
                key={item.title}
              >
                <p className="text-[11px] font-semibold text-[#2a315f]">{item.title}</p>
                <StatusPill label={item.status} tone={item.status === 'Active' ? 'neutral' : 'primary'} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader action="Set all ->" title="Pending Submissions" />
          <div className="space-y-2">
            {pendingRows.map((item) => (
              <div
                className="flex items-center justify-between rounded-md border border-[#e4e6f2] bg-[#fcfcff] px-2.5 py-2"
                key={item.title}
              >
                <div className="flex items-center gap-2">
                  <CircleAvatar initials={item.learner.slice(0, 2).toUpperCase()} tone="soft" />
                  <p className="text-[11px] font-semibold text-[#2a315f]">
                    {item.learner} - {item.title}
                  </p>
                </div>
                <LinkButton to="/instructor/grades" variant="primary">
                  Grade
                </LinkButton>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function InstructorCoursesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const { searchQuery } = useSearchContext();

  const filteredCourses = useMemo(() => {
    let courses = instructorCourses;

    // Filter by tab
    if (activeTab === 'all') {
      courses = instructorCourses;
    } else if (activeTab === 'active') {
      courses = instructorCourses.filter((course) => course.action === 'Submissions');
    } else if (activeTab === 'draft') {
      courses = instructorCourses.filter((course) => course.action === 'Publish');
    } else {
      courses = [];
    }

    // Filter by search
    if (searchQuery) {
      courses = courses.filter(
        (course) =>
          (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.meta || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return courses;
  }, [activeTab, searchQuery]);

  return (
    <div className="space-y-5">
      <PageHeading title="My courses" />

      <div className="flex flex-wrap gap-2">
        <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
          All ({instructorCourses.length})
        </TabButton>
        <TabButton active={activeTab === 'active'} onClick={() => setActiveTab('active')}>
          Active ({instructorCourses.filter((c) => c.action === 'Submissions').length})
        </TabButton>
        <TabButton active={activeTab === 'draft'} onClick={() => setActiveTab('draft')}>
          Draft ({instructorCourses.filter((c) => c.action === 'Publish').length})
        </TabButton>
        <TabButton active={activeTab === 'archived'} onClick={() => setActiveTab('archived')}>
          Archived (0)
        </TabButton>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Card className="p-0" key={course.id}>
              <div className="h-24 rounded-t-md bg-gradient-to-r from-[#d7e4f2] via-[#c6d8ea] to-[#e6eef7]" />
              <div className="space-y-2 p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#7a80a8]">{course.category}</p>
                <h3 className="text-[14px] font-semibold text-[#1d245d]">{course.title}</h3>
                <p className="text-[10px] text-[#7a80a8]">{course.meta}</p>
                <div className="flex items-center gap-2">
                  <ActionButton variant="secondary">Edit</ActionButton>
                  <ActionButton variant={course.action === 'Publish' ? 'success' : 'primary'}>
                    {course.action}
                  </ActionButton>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-[11px] text-[#8e93b2]">No courses found</p>
        )}
      </div>
    </div>
  );
}

export function InstructorCreateCoursePage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-[760px] space-y-6">
      <PageHeading title="Add Course" />

      <div className="space-y-4">
        <label className="block text-[11px] font-semibold text-[#2f356f]">
          Course Title
          <input
            className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px] placeholder:text-[#a5abc8]"
            placeholder="Enter title"
            type="text"
          />
        </label>

        <label className="block text-[11px] font-semibold text-[#2f356f]">
          Description
          <textarea
            className="mt-1 min-h-[108px] rounded-md border border-[#d8dcee] text-[11px] placeholder:text-[#a5abc8]"
            placeholder="Add course description..."
          />
        </label>

        <label className="block text-[11px] font-semibold text-[#2f356f]">
          Discipline / Category
          <select className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]">
            <option>UI/UX Design</option>
            <option>Frontend</option>
            <option>Social Media</option>
          </select>
        </label>

        <div>
          <p className="mb-1 text-[11px] font-semibold text-[#2f356f]">Upload Media</p>
          <div className="flex min-h-[130px] flex-col items-center justify-center rounded-md border border-dashed border-[#d2d6ea] bg-[#fcfcff] text-center">
            <div className="h-8 w-8 rounded-md bg-[#edf0fb]" />
            <p className="mt-2 text-[10px] text-[#a0a6c4]">Upload your file</p>
            <ActionButton className="mt-3" variant="primary">
              Browse File
            </ActionButton>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#2f356f]">Learning Outcomes</p>
            <ActionButton variant="secondary">+ Add Outcome</ActionButton>
          </div>
          <ul className="space-y-1 text-[11px] text-[#2f356f]">
            <li>Understand user-centred design principles</li>
            <li>Create wireframes and prototypes in Figma</li>
            <li>Conduct user research and usability testing</li>
          </ul>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#2f356f]">Lessons</p>
            <ActionButton variant="secondary">+ Add Course</ActionButton>
          </div>
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <Card className="flex items-center justify-between p-2.5" key={lesson.title}>
                <div className="flex items-center gap-3">
                  <CircleAvatar initials={`${index + 1}`} tone="primary" />
                  <div>
                    <p className="text-[11px] font-semibold text-[#2f356f]">{lesson.title}</p>
                    <p className="text-[10px] text-[#8e93b2]">Week {index + 1}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill label={lesson.status} tone={lesson.status === 'Draft' ? 'warning' : 'neutral'} />
                  <ActionButton variant="primary">Edit</ActionButton>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#2f356f]">Assignment</p>
            <ActionButton variant="secondary">+ Add Assignment</ActionButton>
          </div>
          <div className="space-y-2">
            {assignments.map((item, index) => (
              <Card className="flex items-center justify-between p-2.5" key={item.title}>
                <div className="flex items-center gap-3">
                  <CircleAvatar initials={`${index + 1}`} tone="primary" />
                  <div>
                    <p className="text-[11px] font-semibold text-[#2f356f]">{item.title}</p>
                    <p className="text-[10px] text-[#8e93b2]">Due in 14 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill label={item.status} />
                  <ActionButton variant="primary">Edit</ActionButton>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ActionButton variant="secondary">Save Draft</ActionButton>
          <ActionButton
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1200);
            }}
            type="button"
            variant="primary"
          >
            Publish Course
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export function InstructorSubmissionsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'graded'>('all');
  const { searchQuery } = useSearchContext();

  const rows = useMemo(() => {
    let filtered = submissions;

    // Filter by tab
    if (activeTab === 'all') {
      filtered = submissions;
    } else {
      filtered = submissions.filter((entry) => entry.status.toLowerCase() === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          (entry.learner || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (entry.assignment || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  return (
    <div className="space-y-5">
      <PageHeading title="Submission" />

      <div className="flex gap-2">
        <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
          All ({submissions.length})
        </TabButton>
        <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>
          Pending ({submissions.filter((row) => row.status === 'Pending').length})
        </TabButton>
        <TabButton active={activeTab === 'graded'} onClick={() => setActiveTab('graded')}>
          Graded ({submissions.filter((row) => row.status === 'Graded').length})
        </TabButton>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[#f2f4fa]">
            <tr className="text-[10px] uppercase tracking-wide text-[#4e5582]">
              <th className="px-3 py-2 font-semibold">Learner</th>
              <th className="px-3 py-2 font-semibold">Assignment</th>
              <th className="px-3 py-2 font-semibold">Date</th>
              <th className="px-3 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr className="border-t border-[#eceff8] text-[11px] text-[#2f356f]" key={`${row.learner}-${row.assignment}`}>
                  <td className="px-3 py-2">{row.learner}</td>
                  <td className="px-3 py-2">{row.assignment}</td>
                  <td className="px-3 py-2">{row.date}</td>
                  <td className="px-3 py-2">
                    <StatusPill label={row.status} tone={row.status === 'Graded' ? 'success' : 'warning'} />
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-[#eceff8]">
                <td colSpan={4} className="px-3 py-4 text-center text-[11px] text-[#8e93b2]">
                  No submissions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function InstructorGradesPage() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="max-w-[640px] space-y-4">
      <PageHeading title="Grade Assignment" />

      <Card>
        <div className="flex items-center gap-3">
          <CircleAvatar initials="AO" tone="soft" />
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-[#2a315f]">Ada Okonkwo</p>
            <p className="text-[10px] text-[#7a80a8]">Course: UI/UX Design</p>
          </div>
          <div className="w-44">
            <ProgressBar value={65} />
          </div>
        </div>
      </Card>

      <div className="space-y-2 text-[11px] text-[#2f356f]">
        <p className="font-semibold">UX Casestudy</p>
        <p>Status: Submitted</p>
        <p>Submitted on: April 24, 2026</p>
      </div>

      <div className="flex gap-2">
        <ActionButton variant="primary">View Submission</ActionButton>
        <ActionButton variant="secondary">Download Submission</ActionButton>
      </div>

      <Card className="max-w-[420px] space-y-3">
        <p className="text-[12px] font-semibold text-[#2f356f]">Grade Submission</p>
        {[
          ['Completeness', '/30', '26'],
          ['Clarity & Readability', '/30', '24'],
          ['Correctness', '/25', '20'],
          ['Creativity', '/15', '15'],
        ].map(([label, denominator, value]) => (
          <div className="grid grid-cols-[1fr_58px_58px] items-center gap-2" key={label}>
            <div>
              <p className="text-[10px] font-semibold text-[#2f356f]">{label}</p>
              <p className="text-[9px] text-[#979dbb]">Add score</p>
            </div>
            <p className="text-right text-[10px] text-[#7b81aa]">{denominator}</p>
            <input className="h-8 rounded-md border border-[#d7dcef] text-[11px]" defaultValue={value} type="number" />
          </div>
        ))}

        <p className="text-[11px] font-semibold text-[#2f356f]">Score: 85/100</p>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[#2f356f]" htmlFor="feedback">
            Feedback:
          </label>
          <textarea
            className="min-h-[70px] rounded-md border border-[#d7dcef] text-[11px]"
            defaultValue="Good structure, but spacing could improve. Nice work overall!"
            id="feedback"
          />
        </div>
      </Card>

      <ActionButton
        loading={loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1000);
        }}
        variant="primary"
      >
        Submit Grades
      </ActionButton>
    </div>
  );
}

export function InstructorLearnersPage() {
  const { searchQuery } = useSearchContext();
  const filteredLearners = useArraySearch(learnerRows, searchQuery, ['name']);

  return (
    <div className="max-w-[640px] space-y-4">
      <PageHeading title="Learner" />
      <div className="max-w-[360px]">
        <input
          className="h-9 rounded-md border border-[#d8dcee] text-[11px] placeholder:text-[#a5abc8]"
          placeholder="Search learners..."
          type="text"
          value={searchQuery}
          disabled
        />
      </div>

      <Card className="space-y-2">
        {filteredLearners.length > 0 ? (
          filteredLearners.map((learner) => (
            <div className="flex items-center gap-3 rounded-md border border-[#eceff8] px-2.5 py-2" key={learner.name}>
              <CircleAvatar initials={learner.initials} />
              <div className="min-w-[140px]">
                <p className="text-[11px] font-semibold text-[#2f356f]">{learner.name}</p>
                <p className="text-[10px] text-[#8e93b2]">Progress: {learner.progress}%</p>
              </div>
              <div className="flex-1">
                <ProgressBar value={learner.progress} />
              </div>
              <LinkButton to="/instructor/grades" variant="primary">
                Grade
              </LinkButton>
            </div>
          ))
        ) : (
          <p className="text-center text-[11px] text-[#8e93b2]">No learners found</p>
        )}
      </Card>
    </div>
  );
}

export function InstructorDiscussionPage() {
  const { searchQuery } = useSearchContext();
  const filteredChannels = useArraySearch(channels, searchQuery, ['name', 'preview']);

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
      <Card className="space-y-3">
        <div>
          <input 
            className="h-8 rounded-md border border-[#d7dcef] text-[11px]" 
            placeholder="Search" 
            type="text"
            value={searchQuery}
            disabled
          />
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#7c82ab]">Channels</p>
          <div className="space-y-1">
            {filteredChannels.length > 0 ? (
              filteredChannels.map((channel) => (
                <div className="rounded-md border border-[#eef0f8] px-2 py-2" key={channel.name}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-[#2f356f]">{channel.name}</p>
                    {channel.unread > 0 && (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0a1179] px-1 text-[9px] text-white">
                        {channel.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#8f94b2]">{channel.preview}</p>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-[#8f94b2]">No channels found</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#7c82ab]">Direct Message</p>
          <div className="space-y-1 text-[11px] text-[#2f356f]">
            <p>Hi, Emeka</p>
            <p>Kolade</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div>
          <p className="text-[12px] font-semibold text-[#2f356f]"># general</p>
          <p className="text-[10px] text-[#8d93b1]">32 members, all interns and instructors</p>
        </div>

        <Card className="space-y-3">
          <div className="ml-auto max-w-[380px] rounded-xl bg-[#edf0fa] px-3 py-2 text-[11px] text-[#37406b]">
            Hey everyone, Phase 2 project doc has been shared. Please check the Figma link and start your assigned sections.
          </div>

          {messages.map((message) => (
            <div className="flex items-start gap-2" key={message.sender}>
              <CircleAvatar
                initials={message.sender.slice(0, 2).toUpperCase()}
                tone={message.tone === 'success' ? 'soft' : message.tone === 'warning' ? 'neutral' : 'primary'}
              />
              <div>
                <p className="text-[11px] font-semibold text-[#2f356f]">{message.sender}</p>
                <p className="text-[11px] text-[#4f5786]">{message.text}</p>
              </div>
            </div>
          ))}
        </Card>

        <input
          className="h-10 rounded-full border border-[#d8dcee] px-4 text-[11px] placeholder:text-[#a5abc8]"
          placeholder="Type a message..."
          type="text"
        />
      </div>
    </div>
  );
}

export function InstructorAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Learners" tone="rose" value="30" />
        <StatCard title="Active Students" tone="blue" value="22" />
        <StatCard title="Avg Time Per Course" tone="default" value="2.4h" />
        <StatCard title="Course Completion" tone="amber" value="9" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <h3 className="mb-3 text-[18px] font-semibold text-[#1f2560]">Weekly Completion</h3>
          <div className="flex h-40 items-end gap-2">
            {[80, 60, 54, 42, 34, 72, 88].map((height, index) => (
              <div className="flex-1" key={height}>
                <div className="rounded-t-md bg-[#7a67e8]" style={{ height: `${height}%` }} />
                <p className="mt-1 text-center text-[9px] text-[#8f94b2]">w{index + 1}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-[18px] font-semibold text-[#1f2560]">Course Performance</h3>
          <div className="space-y-2">
            {[
              ['Social Marketing', 75],
              ['UI/UX Design', 85],
              ['Digital Marketing', 68],
            ].map(([name, rating]) => (
              <div key={name}>
                <p className="text-[11px] font-semibold text-[#2f356f]">{name}</p>
                <ProgressBar value={Number(rating)} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="border-b border-[#eceff8] px-3 py-2">
          <h3 className="text-[16px] font-semibold text-[#1f2560]">Per-Course Breakdown</h3>
        </div>
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[#f2f4fa] text-[10px] uppercase tracking-wide text-[#4e5582]">
            <tr>
              <th className="px-3 py-2 font-semibold">Course</th>
              <th className="px-3 py-2 font-semibold">Enrolled</th>
              <th className="px-3 py-2 font-semibold">Avg Progress</th>
              <th className="px-3 py-2 font-semibold">Avg Score</th>
              <th className="px-3 py-2 font-semibold">Completions</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['UI/UX Fundamentals', '22', 75, '84/100', '7'],
              ['Figma Advanced', '15', 60, '78/100', '15'],
              ['Brand Identity 101', '18', 85, '89/100', '9'],
            ].map(([course, enrolled, progress, score, completions]) => (
              <tr className="border-t border-[#eceff8] text-[11px] text-[#2f356f]" key={course}>
                <td className="px-3 py-2">{course}</td>
                <td className="px-3 py-2">{enrolled}</td>
                <td className="px-3 py-2">
                  <div className="max-w-[170px]">
                    <ProgressBar value={Number(progress)} />
                  </div>
                </td>
                <td className="px-3 py-2">{score}</td>
                <td className="px-3 py-2">{completions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function InstructorProfilePage() {
  return (
    <div className="max-w-[760px] space-y-5">
      <div className="flex justify-start">
        <LinkButton to="/instructor/profile/edit" variant="secondary">
          Edit Profile
        </LinkButton>
      </div>

      <div className="relative h-[98px] rounded-sm bg-[#08107b]">
        <div className="absolute -bottom-9 left-4">
          <span className="inline-flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-[#e7ebfb] bg-[#08107b] text-[28px] font-semibold text-white">
            ME
          </span>
        </div>
      </div>

      <div className="pt-8">
        <h2 className="text-[28px] font-semibold text-[#1f2560]">Mr. Emeka</h2>
        <p className="text-[11px] text-[#6e75a0]">Experienced educator and course creator</p>
        <p className="text-[11px] text-[#6e75a0]">5 years of experience</p>
      </div>

      <div className="flex gap-4 border-b border-[#e4e7f3] pb-2 text-[18px] text-[#2f356f]">
        <button className="border-b-2 border-[#08107b] pb-1 font-medium text-[#1f2560]" type="button">
          About
        </button>
        <button className="pb-1 text-[#646b95]" type="button">
          My Courses
        </button>
        <button className="pb-1 text-[#646b95]" type="button">
          Certificates
        </button>
      </div>

      <div>
        <h3 className="text-[20px] font-semibold text-[#1f2560]">Bio</h3>
        <p className="mt-1 text-[12px] leading-5 text-[#2f356f]">
          Mr. Emeka is a passionate product designer and mentor with over 5 years of experience in UI/UX design. He has
          guided numerous students and interns through hands-on projects, helping them build strong portfolios and practical
          skills. He believes in creating learning experiences that are clear, engaging and actionable.
        </p>
      </div>

      <div>
        <h3 className="text-[20px] font-semibold text-[#1f2560]">Discipline &amp; Skills</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusPill label="UI/UX Design" tone="primary" />
          <StatusPill label="Figma" />
          <StatusPill label="User Research" />
          <StatusPill label="Wireframing" />
        </div>
      </div>

      <div>
        <h3 className="text-[20px] font-semibold text-[#1f2560]">Badges &amp; Achievements</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-md border border-[#e4e7f3] text-[24px]">
            A
          </div>
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-md border border-[#e4e7f3] text-[24px]">
            B
          </div>
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-md border border-[#e4e7f3] text-[24px]">
            C
          </div>
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[#e4e7f3] bg-[#f0f2fa] text-[24px]">
            D
          </div>
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[#e4e7f3] bg-[#f0f2fa] text-[24px]">
            E
          </div>
        </div>
      </div>
    </div>
  );
}

export function InstructorEditProfilePage() {
  const [saving, setSaving] = useState(false);
  return (
    <div className="max-w-[760px] space-y-5">
      <p className="text-[11px] font-semibold text-[#7076a1]">Profile &gt; Edit Profile</p>

      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#08107b] text-[14px] font-semibold text-white">
          ME
        </span>
        <ActionButton variant="secondary">Change Photo</ActionButton>
        <p className="text-[10px] text-[#a0a6c4]">JPG or PNG, Max size 2MB</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-[11px] font-semibold text-[#2f356f]">
          Full Name
          <input className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]" defaultValue="Mr. Emeka O." type="text" />
        </label>
        <label className="text-[11px] font-semibold text-[#2f356f]">
          Title
          <input
            className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]"
            defaultValue="Senior UI/UX Design Lead"
            type="text"
          />
        </label>
      </div>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Email Address
        <input className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]" defaultValue="emeka@talentflow.io" type="email" />
      </label>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Professional bio
        <textarea
          className="mt-1 min-h-[96px] rounded-md border border-[#d8dcee] text-[11px]"
          defaultValue="Passionate product designer and mentor with over 5 years of experience in UI/UX design."
        />
      </label>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Expertise
        <input
          className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]"
          defaultValue="Product Design, Figma, React"
          type="text"
        />
      </label>

      <div className="flex items-center gap-2">
        <ActionButton
          loading={saving}
          onClick={() => {
            setSaving(true);
            setTimeout(() => setSaving(false), 1000);
          }}
          variant="primary"
        >
          Save Changes
        </ActionButton>
        <LinkButton to="/instructor/profile" variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </div>
  );
}

export function InstructorAnnouncementsPage() {
  return (
    <div className="max-w-[860px] space-y-5">
      <PageHeading
        action={
          <LinkButton to="/instructor/announcements/new" variant="secondary">
            + Add Announcement
          </LinkButton>
        }
        subtitle="Post updates to your learners and cohorts"
        title="Announcements"
      />

      <div className="space-y-2">
        {announcementRows.map((row) => (
          <Card className="flex items-center justify-between gap-4" key={row.title}>
            <div>
              <p className="text-[12px] font-semibold text-[#2f356f]">{row.title}</p>
              <p className="mt-1 max-w-[560px] text-[11px] leading-4 text-[#646b95]">{row.detail}</p>
              <p className="mt-1 text-[10px] text-[#a0a6c4]">{row.date}</p>
            </div>
            <ActionButton variant="primary">Edit</ActionButton>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function InstructorAddAnnouncementPage() {
  const [sending, setSending] = useState(false);

  return (
    <div className="max-w-[700px] space-y-5">
      <PageHeading subtitle="Compose and send a new announcement" title="Add Announcement" />

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Send To
        <select className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]">
          <option>All Learners (30)</option>
          <option>UI/UX Team</option>
          <option>Frontend Team</option>
        </select>
      </label>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Subject *
        <input className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]" placeholder="Announcement title..." type="text" />
      </label>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Message *
        <textarea className="mt-1 min-h-[120px] rounded-md border border-[#d8dcee] text-[11px]" placeholder="Write your announcement here..." />
      </label>

      <label className="block max-w-[260px] text-[11px] font-semibold text-[#2f356f]">
        Notify via
        <select className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]">
          <option>In-platform + Email</option>
          <option>In-platform only</option>
          <option>Email only</option>
        </select>
      </label>

      <div className="flex items-center gap-2">
        <ActionButton
          loading={sending}
          onClick={() => {
            setSending(true);
            setTimeout(() => setSending(false), 1200);
          }}
          type="button"
          variant="primary"
        >
          Send Announcement
        </ActionButton>
        <LinkButton to="/instructor/announcements" variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </div>
  );
}

export function InstructorSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [announcements, setAnnouncements] = useState(true);
  const [submissionNotifications, setSubmissionNotifications] = useState(true);
  const [discussionAlerts, setDiscussionAlerts] = useState(false);
  const [theme, setTheme] = useState('Light Mode');
  const [language, setLanguage] = useState('English');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 700);
  };

  return (
    <div className="max-w-[860px] space-y-6">
      <PageHeading subtitle="Manage your account and preferences." title="Settings" />

      {/* Account Section */}
      <Card>
        <h3 className="mb-4 border-b border-[#e1e4f2] pb-3 text-[14px] font-semibold text-[#1d245d]">Account</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-[#e1e4f2] bg-[#f8f9fc] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Change Password</p>
              <p className="text-[10px] text-[#7a80a9]">Update your login password</p>
            </div>
            <LinkButton to="/instructor/settings/change-password" variant="secondary">
              Update
            </LinkButton>
          </div>

          <div className="flex items-center justify-between rounded-md border border-[#e1e4f2] bg-[#f8f9fc] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Email Address</p>
              <p className="text-[10px] text-[#7a80a9]">ads.okonkwo@truemails.com</p>
            </div>
            <LinkButton to="/instructor/settings/change-email" variant="secondary">
              Change
            </LinkButton>
          </div>
        </div>
      </Card>

      {/* Notifications Section - Instructor Specific */}
      <Card>
        <h3 className="mb-4 border-b border-[#e1e4f2] pb-3 text-[14px] font-semibold text-[#1d245d]">Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Assignment Reminders</p>
              <p className="text-[10px] text-[#7a80a9]">Get notified about student submissions</p>
            </div>
            <input
              checked={assignmentReminders}
              onChange={(e) => setAssignmentReminders(e.target.checked)}
              type="checkbox"
              className="h-5 w-5 accent-[#08107b]"
            />
          </label>

          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Announcements</p>
              <p className="text-[10px] text-[#7a80a9]">Updates from admin and admins</p>
            </div>
            <input
              checked={announcements}
              onChange={(e) => setAnnouncements(e.target.checked)}
              type="checkbox"
              className="h-5 w-5 accent-[#08107b]"
            />
          </label>

          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Submission Alerts</p>
              <p className="text-[10px] text-[#7a80a9]">When learners submit assignments</p>
            </div>
            <input
              checked={submissionNotifications}
              onChange={(e) => setSubmissionNotifications(e.target.checked)}
              type="checkbox"
              className="h-5 w-5 accent-[#08107b]"
            />
          </label>

          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Discussion Alerts</p>
              <p className="text-[10px] text-[#7a80a9]">New messages in course discussions</p>
            </div>
            <input
              checked={discussionAlerts}
              onChange={(e) => setDiscussionAlerts(e.target.checked)}
              type="checkbox"
              className="h-5 w-5 accent-[#08107b]"
            />
          </label>
        </div>
      </Card>

      {/* Appearance Section */}
      <Card>
        <h3 className="mb-4 border-b border-[#e1e4f2] pb-3 text-[14px] font-semibold text-[#1d245d]">Appearance</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <p className="mb-2 text-[11px] font-semibold text-[#1d245d]">Theme</p>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="h-9 w-full rounded-md border border-[#d8dcee] bg-white px-3 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#08107b]"
            >
              <option>Light Mode</option>
              <option>Dark Mode</option>
              <option>System Default</option>
            </select>
          </label>

          <label className="block">
            <p className="mb-2 text-[11px] font-semibold text-[#1d245d]">Language</p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-9 w-full rounded-md border border-[#d8dcee] bg-white px-3 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#08107b]"
            >
              <option>English</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
          </label>
        </div>
      </Card>

      {/* Danger Zone Section */}
      <Card>
        <h3 className="mb-4 border-b border-[#e1e4f2] pb-3 text-[14px] font-semibold text-[#1d245d]">Danger Zone</h3>
        <div className="flex items-center justify-between rounded-md border-2 border-[#f1d8d8] bg-[#fff6f6] px-4 py-3">
          <div>
            <p className="text-[12px] font-semibold text-[#7b1f1f]">Delete Account</p>
            <p className="text-[10px] text-[#a05b5b]">Permanently remove your account</p>
          </div>
          <ActionButton variant="danger">Delete</ActionButton>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2">
        <ActionButton loading={saving} onClick={handleSave} variant="primary">
          {saving ? 'Saving...' : 'Save Settings'}
        </ActionButton>
      </div>
    </div>
  );
}

export function InstructorChangeEmailPage() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-[600px] space-y-5">
      <PageHeading subtitle="Enter your new email and confirm your password" title="Change Email Address" />

      <Card className="space-y-3">
        <label className="block text-[11px] font-semibold text-[#2f356f]">
          Current Email
          <input
            className="mt-1 h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]"
            defaultValue="emeka@talentflow.io"
            type="email"
          />
        </label>

        <label className="block text-[11px] font-semibold text-[#2f356f]">
          New Email Address
          <input className="mt-1 h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" placeholder="Enter new email" type="email" />
          <p className="mt-1 text-[10px] text-[#8f94b2]">A verification link will be sent to this address.</p>
        </label>

        <label className="block text-[11px] font-semibold text-[#2f356f]">
          Confirm Password
          <input className="mt-1 h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" placeholder="Enter your current password" type="password" />
        </label>

        <div className="flex items-center gap-2">
          <ActionButton
            loading={saving}
            onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 900);
            }}
            variant="primary"
          >
            Save New Email
          </ActionButton>
          <LinkButton to="/instructor/settings" variant="secondary">
            Cancel
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}

export function InstructorChangePasswordPage() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-[600px] space-y-5">
      <PageHeading subtitle="Enter your current password, then choose a new one" title="Change Password" />

      <Card className="space-y-3">
        <label className="block text-[11px] font-semibold text-[#2f356f]">
          Current Password
          <input className="mt-1 h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" placeholder="Enter your current password" type="password" />
        </label>

        <label className="block text-[11px] font-semibold text-[#2f356f]">
          New Password
          <input className="mt-1 h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" placeholder="Enter a new password" type="password" />
          <p className="mt-1 text-[10px] text-[#8f94b2]">Min. 8 characters.</p>
        </label>

        <label className="block text-[11px] font-semibold text-[#2f356f]">
          Confirm New Password
          <input className="mt-1 h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" placeholder="Confirm your new password" type="password" />
        </label>

        <div className="flex items-center gap-2">
          <ActionButton
            loading={saving}
            onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 900);
            }}
            variant="primary"
          >
            Save New Password
          </ActionButton>
          <LinkButton to="/instructor/settings" variant="secondary">
            Cancel
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
