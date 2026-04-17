import { useState } from 'react';
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
import { courses as publicCourses } from '@/app/public/data/courses';
import { useAuthStore } from '@/shared/state/auth';

// ============================================================================
// LEARNER DASHBOARD PAGE
// ============================================================================

export function LearnerDashboardPage() {
  const learnerMetrics = [
    { value: '8', title: 'Active Courses', tone: 'blue' as const },
    { value: '12', title: 'Certificates Earned', tone: 'amber' as const },
    { value: '85%', title: 'Overall Progress', tone: 'default' as const },
    { value: '3', title: 'Pending Assignments', tone: 'rose' as const },
  ];

  const recentCourses = [
    { title: 'UI/UX Advanced', progress: 75, instructor: 'Mr. Chisom' },
    { title: 'Brand Identity 101', progress: 60, instructor: 'Mrs. Ade' },
    { title: 'Figma Mastery', progress: 45, instructor: 'Mr. Chisom' },
  ];

  return (
    <div className="max-w-full space-y-6">
      <PageHeading title="Welcome back!" subtitle="Here's what happening with your learning journey" />

      {/* Metrics Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {learnerMetrics.map((metric, idx) => (
          <StatCard key={idx} title={metric.title} tone={metric.tone} value={metric.value} />
        ))}
      </div>

      {/* Recent Courses */}
      <Card>
        <h2 className="mb-4 text-[14px] font-semibold text-[#1d245d]">Recent Courses</h2>
        <div className="space-y-3">
          {recentCourses.map((course, idx) => (
            <div key={idx} className="border-b border-[#e1e4f2] pb-3">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-medium text-[#1d245d]">{course.title}</p>
                  <p className="text-[10px] text-[#7a80a9]">Instructor: {course.instructor}</p>
                </div>
                <StatusPill label={`${course.progress}%`} tone="primary" />
              </div>
              <ProgressBar value={course.progress} />
            </div>
          ))}
        </div>
      </Card>

      {/* Pending Assignments */}
      <Card>
        <h2 className="mb-4 text-[14px] font-semibold text-[#1d245d]">Pending Assignments</h2>
        <div className="space-y-2 text-[11px]">
          <p className="text-[#7a80a9]">No pending assignments at the moment. Great work! 🎉</p>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// MY COURSES PAGE
// ============================================================================

export function MyCoursesPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>(
    'all'
  );

  const courses = [
    { title: 'UI/UX Advanced', instructor: 'Mr. Chisom', progress: 75, status: 'active', dueDate: '12 Apr 2026' },
    { title: 'Brand Identity 101', instructor: 'Mrs. Ade', progress: 60, status: 'active', dueDate: '20 Apr 2026' },
    { title: 'Figma Mastery', instructor: 'Mr. Chisom', progress: 45, status: 'active', dueDate: '30 Apr 2026' },
    { title: 'Design Systems', instructor: 'Ms. Tope', progress: 100, status: 'completed', dueDate: '05 Apr 2026' },
  ];

  const filteredCourses = filterStatus === 'all' ? courses : courses.filter(c => c.status === filterStatus);

  return (
    <div className="max-w-full space-y-6">
      <PageHeading
        title="My Courses"
        subtitle="Track your ongoing learning and completed courses"
        action={
          <div className="flex gap-2">
            <TabButton active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
              All
            </TabButton>
            <TabButton active={filterStatus === 'active'} onClick={() => setFilterStatus('active')}>
              Active
            </TabButton>
            <TabButton active={filterStatus === 'completed'} onClick={() => setFilterStatus('completed')}>
              Completed
            </TabButton>
            <TabButton active={filterStatus === 'archived'} onClick={() => setFilterStatus('archived')}>
              Archived
            </TabButton>
          </div>
        }
      />

      {/* Courses Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course, idx) => (
          <Card key={idx}>
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-[12px] font-semibold text-[#1d245d]">{course.title}</p>
                <p className="text-[10px] text-[#7a80a9]">{course.instructor}</p>
              </div>
              <StatusPill
                label={course.status === 'completed' ? 'Completed' : 'Active'}
                tone={course.status === 'completed' ? 'success' : 'primary'}
              />
            </div>
            <ProgressBar value={course.progress} />
            <p className="mt-3 text-[10px] text-[#7a80a9]">Due: {course.dueDate}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COURSE CATALOG PAGE
// ============================================================================

export function CourseCatalogPage() {
  const [filterDiscipline, setFilterDiscipline] = useState('all');

  const filteredCourses =
    filterDiscipline === 'all'
      ? publicCourses
      : publicCourses.filter(c => c.discipline === filterDiscipline);

  // Dynamically extract unique disciplines from courses
  const uniqueDisciplines = Array.from(
    new Set(publicCourses.map(c => c.discipline))
  ).sort();

  return (
    <div className="max-w-full space-y-6">
      <PageHeading title="Course Catalog" subtitle="Explore all available courses and enroll today" />

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <TabButton active={filterDiscipline === 'all'} onClick={() => setFilterDiscipline('all')}>
          All
        </TabButton>
        {uniqueDisciplines.map(discipline => (
          <TabButton 
            key={discipline} 
            active={filterDiscipline === discipline} 
            onClick={() => setFilterDiscipline(discipline)}
          >
            {discipline}
          </TabButton>
        ))}
      </div>

      {/* Courses */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course, idx) => (
          <Card key={idx}>
            <div className="mb-3">
              <p className="text-[12px] font-semibold text-[#1d245d]">{course.title}</p>
              <p className="text-[10px] text-[#7a80a9]">Instructor: {course.instructor}</p>
            </div>
            <div className="mb-3 flex gap-2">
              <StatusPill label={course.discipline} tone="neutral" />
              <StatusPill label={`${course.learners} enrolled`} tone="neutral" />
            </div>
            <ActionButton className="w-full" variant="primary" onClick={() => (window.location.href = '/signup')}>
              Enroll / Get Started
            </ActionButton>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COURSE DETAILS PAGE
// ============================================================================

export function CourseDetailsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'assignments' | 'learners'>(
    'overview'
  );

  return (
    <div className="max-w-full space-y-6">
      <PageHeading
        title="UI/UX Advanced"
        subtitle="Learn advanced UI/UX design principles and modern design trends"
        action={<LinkButton to="/learner/courses">← Back to Courses</LinkButton>}
      />

      {/* Course Header */}
      <Card>
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-[10px] text-[#7a80a9]">Instructor</p>
            <p className="text-[12px] font-semibold text-[#1d245d]">Mr. Chisom Ejiofor</p>
          </div>
          <div>
            <p className="text-[10px] text-[#7a80a9]">Duration</p>
            <p className="text-[12px] font-semibold text-[#1d245d]">8 Weeks</p>
          </div>
          <div>
            <p className="text-[10px] text-[#7a80a9]">Learners Enrolled</p>
            <p className="text-[12px] font-semibold text-[#1d245d]">245</p>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[#e1e4f2]">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          Overview
        </TabButton>
        <TabButton active={activeTab === 'lessons'} onClick={() => setActiveTab('lessons')}>
          Lessons
        </TabButton>
        <TabButton active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')}>
          Assignments
        </TabButton>
        <TabButton active={activeTab === 'learners'} onClick={() => setActiveTab('learners')}>
          Learners
        </TabButton>
      </div>

      {/* Content */}
      <Card>
        {activeTab === 'overview' && (
          <div className="space-y-3 text-[11px]">
            <p>
              This course covers advanced UI/UX design principles, modern design trends, and best practices.
            </p>
            <p>What you'll learn:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Advanced design systems</li>
              <li>User research methodologies</li>
              <li>Prototyping and testing</li>
              <li>Human-centered design</li>
            </ul>
          </div>
        )}
        {activeTab === 'lessons' && <p className="text-[11px] text-[#7a80a9]">8 lessons available</p>}
        {activeTab === 'assignments' && <p className="text-[11px] text-[#7a80a9]">4 assignments available</p>}
        {activeTab === 'learners' && <p className="text-[11px] text-[#7a80a9]">245 learners enrolled</p>}
      </Card>
    </div>
  );
}

// ============================================================================
// LESSON PAGE
// ============================================================================

export function LessonPage() {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="max-w-full space-y-6">
      <PageHeading
        title="Lesson 1: Introduction to Design Systems"
        subtitle="Part of UI/UX Advanced course"
        action={<LinkButton to="/learner/courses">← Back</LinkButton>}
      />

      {/* Lesson Content */}
      <Card>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[12px] font-semibold text-[#1d245d]">Learning Objectives</p>
            <ul className="list-inside list-disc space-y-1 text-[11px] text-[#5f6796]">
              <li>Understand design system fundamentals</li>
              <li>Learn component-driven architecture</li>
              <li>Explore real-world design system examples</li>
            </ul>
          </div>

          <div className="border-t border-[#e1e4f2] pt-4">
            <p className="mb-2 text-[12px] font-semibold text-[#1d245d]">Duration</p>
            <p className="text-[11px] text-[#5f6796]">45 minutes</p>
          </div>

          <div className="border-t border-[#e1e4f2] pt-4">
            <p className="mb-2 text-[12px] font-semibold text-[#1d245d]">Lesson Content</p>
            <p className="text-[11px] text-[#5f6796]">Video, readings, and interactive examples available</p>
          </div>
        </div>
      </Card>

      {/* Lesson Actions */}
      <div className="flex gap-2">
        <ActionButton variant="primary" onClick={() => setCompleted(!completed)}>
          {completed ? '✓ Mark as Incomplete' : 'Mark as Complete'}
        </ActionButton>
        <LinkButton to="/learner/courses" variant="secondary">
          Continue Later
        </LinkButton>
      </div>

      {completed && <p className="text-[11px] text-green-600">Great! You've completed this lesson.</p>}
    </div>
  );
}

// ============================================================================
// PROGRESS PAGE
// ============================================================================

export function ProgressPage() {
  const courseProgress = [
    { course: 'UI/UX Advanced', progress: 75 },
    { course: 'Brand Identity 101', progress: 60 },
    { course: 'Figma Mastery', progress: 45 },
    { course: 'Design Systems', progress: 100 },
  ];

  return (
    <div className="max-w-full space-y-6">
      <PageHeading title="Overall Progress" subtitle="Track your learning milestones and achievements" />

      {/* Progress Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Courses Active" tone="blue" value="3" />
        <StatCard title="Courses Completed" tone="amber" value="1" />
        <StatCard title="Overall Score" tone="default" value="70%" />
      </div>

      {/* Course Progress Details */}
      <Card>
        <h2 className="mb-4 text-[14px] font-semibold text-[#1d245d]">Per-Course Progress</h2>
        <div className="space-y-4">
          {courseProgress.map((item, idx) => (
            <div key={idx}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#1d245d]">{item.course}</span>
                <span className="text-[10px] text-[#7a80a9]">{item.progress}%</span>
              </div>
              <ProgressBar value={item.progress} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// ASSIGNMENTS PAGES (3 VARIANTS)
// ============================================================================

export function AssignmentsPage() {
  const assignments = [
    { title: 'Design System Audit', course: 'UI/UX Advanced', dueDate: '12 Apr 2026', status: 'pending' },
    { title: 'Brand Moodboard', course: 'Brand Identity 101', dueDate: '15 Apr 2026', status: 'pending' },
    { title: 'Component Documentation', course: 'UI/UX Advanced', dueDate: '20 Apr 2026', status: 'submitted' },
  ];

  return (
    <div className="max-w-full space-y-6">
      <PageHeading title="Assignments" subtitle="View and submit your coursework" />

      <div className="space-y-3">
        {assignments.map((assignment, idx) => (
          <Card key={idx}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-[#1d245d]">{assignment.title}</p>
                <p className="text-[10px] text-[#7a80a9]">{assignment.course}</p>
                <p className="mt-1 text-[10px] text-[#7a80a9]">Due: {assignment.dueDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill label={assignment.status === 'pending' ? 'Pending' : 'Submitted'} tone={assignment.status === 'pending' ? 'warning' : 'success'} />
                <LinkButton to={`/learner/assignments/${idx}`} variant="primary">
                  View
                </LinkButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AssignmentsSubmissionPage() {
  const [file] = useState<string | null>(null);

  return (
    <div className="max-w-full space-y-6">
      <PageHeading
        title="Design System Audit"
        subtitle="From: UI/UX Advanced | Due: 12 Apr 2026"
        action={<LinkButton to="/learner/assignments">← Back</LinkButton>}
      />

      {/* Instructions */}
      <Card>
        <h2 className="mb-3 text-[12px] font-semibold text-[#1d245d]">Instructions</h2>
        <p className="text-[11px] text-[#5f6796]">
          Audit a public design system of your choice. Document its components, spacing rules, color palette, and typography system.
        </p>
      </Card>

      {/* File Upload */}
      <Card>
        <h2 className="mb-3 text-[12px] font-semibold text-[#1d245d]">Submit Your Work</h2>
        <div className="space-y-3">
          <div className="rounded-md border-2 border-dashed border-[#d7dbef] bg-[#f8f9fc] p-6 text-center">
            <p className="text-[11px] text-[#5f6796]">Drag and drop your file here or click to browse</p>
            {file && <p className="mt-2 text-[10px] font-medium text-[#1d245d]">📄 {file}</p>}
          </div>
          <ActionButton className="w-full" variant="primary">
            {file ? 'Change File' : 'Select File'}
          </ActionButton>
        </div>
      </Card>

      {/* Submit Button */}
      {file && (
        <div className="flex gap-2">
          <ActionButton className="flex-1" variant="primary">
            Submit Assignment
          </ActionButton>
          <ActionButton className="flex-1" variant="secondary">
            Save Draft
          </ActionButton>
        </div>
      )}
    </div>
  );
}

export function AssignmentsGradedPage() {
  return (
    <div className="max-w-full space-y-6">
      <PageHeading
        title="Component Documentation"
        subtitle="From: UI/UX Advanced | Submitted on: 18 Apr 2026"
        action={<LinkButton to="/learner/assignments">← Back</LinkButton>}
      />

      {/* Grade Card */}
      <Card className="border-2 border-[#9cd4ae] bg-[#e7f8eb] p-6">
        <div className="text-center">
          <p className="text-[11px] text-[#1f7b3a]">Your Score</p>
          <p className="text-[32px] font-bold text-[#1f7b3a]">92%</p>
          <StatusPill label="Excellent Work!" tone="success" />
        </div>
      </Card>

      {/* Feedback */}
      <Card>
        <h2 className="mb-3 text-[12px] font-semibold text-[#1d245d]">Instructor Feedback</h2>
        <p className="text-[11px] text-[#5f6796]">
          Great job documenting the component structure. Your organization and clarity are excellent. Consider adding more examples in future submissions.
        </p>
      </Card>
    </div>
  );
}

// ============================================================================
// CERTIFICATE PAGE
// ============================================================================

export function CertificatePage() {
  const certificates = [
    { course: 'Design Systems Fundamentals', earnedDate: '05 Apr 2026', credentialId: 'DSC-2026-001' },
    { course: 'Research Methodology', earnedDate: '28 Mar 2026', credentialId: 'RM-2026-001' },
  ];

  return (
    <div className="max-w-full space-y-6">
      <PageHeading title="Certificates" subtitle="Your earned certificates and credentials" />

      {/* Display Certificate Design Image */}
      <Card className="flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f08a2c] to-[#ff6b35] p-0">
        <img src="/images/certificate-display.png" alt="Certificate Design" className="w-full object-cover" />
      </Card>

      {/* Certificate List */}
      <div className="grid gap-4 md:grid-cols-2">
        {certificates.map((cert, idx) => (
          <Card key={idx} className="border-2 border-[#f08a2c]">
            <div className="mb-3 text-center">
              <p className="text-[13px] font-bold text-[#f08a2c]">🏆 CERTIFICATE OF COMPLETION</p>
            </div>
            <div className="mb-3 border-t border-[#f08a2c] pt-3">
              <p className="text-center text-[11px] text-[#1d245d]">{cert.course}</p>
              <p className="mt-1 text-center text-[10px] text-[#7a80a9]">Earned: {cert.earnedDate}</p>
              <p className="mt-2 text-center text-[9px] text-[#7a80a9]">ID: {cert.credentialId}</p>
            </div>
            <ActionButton className="w-full" variant="secondary">
              Download
            </ActionButton>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// NOTIFICATION PAGE
// ============================================================================

export function NotificationPage() {
  const notifications = [
    { title: 'Assignment Due Tomorrow', message: 'Your Design System Audit is due on 12 Apr 2026', time: '2 hours ago', read: false },
    { title: 'New Course Announcement', message: 'UI/UX Advanced: New lesson available - Advanced Prototyping', time: '1 day ago', read: false },
    { title: 'Grade Posted', message: 'Your Component Documentation assignment has been graded: 92%', time: '3 days ago', read: true },
    { title: 'Course Reminder', message: 'Brand Identity 101: Complete by 30 Apr 2026', time: '5 days ago', read: true },
  ];

  return (
    <div className="max-w-full space-y-6">
      <PageHeading title="Notifications" subtitle="Stay updated with your learning journey" />

      <div className="space-y-2">
        {notifications.map((notif, idx) => (
          <Card key={idx} className={notif.read ? 'bg-white' : 'border-l-4 border-l-[#08107b] bg-[#f8f9fc]'}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-[#1d245d]">{notif.title}</p>
                <p className="text-[10px] text-[#5f6796]">{notif.message}</p>
                <p className="mt-1 text-[9px] text-[#7a80a9]">{notif.time}</p>
              </div>
              {!notif.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#08107b]" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DISCUSSION PAGE (LEARNER SIDE)
// ============================================================================

export function DiscussionPage() {
  const courses = [
    { name: 'UI/UX Advanced', messages: 45 },
    { name: 'Brand Identity 101', messages: 28 },
    { name: 'Figma Mastery', messages: 12 },
  ];

  return (
    <div className="max-w-full space-y-6">
      <PageHeading title="Course Discussions" subtitle="Join discussions and collaborate with peers" />

      <div className="space-y-3">
        {courses.map((course, idx) => (
          <Card key={idx}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold text-[#1d245d]">{course.name}</p>
                <p className="text-[10px] text-[#7a80a9]">{course.messages} messages</p>
              </div>
              <LinkButton to={`/learner/discussion/${idx}`} variant="primary">
                Open
              </LinkButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MY TEAM PAGE
// ============================================================================

export function MyTeamPage() {
  const [team] = useState({
    name: 'UI/UX Design Team',
    code: 'AC KO BA',
    membersCount: 6,
    lead: 'Ada Okonkwo',
    members: [
      { name: 'Ada Okonkwo', role: 'Team Lead', discipline: 'UI/UX', initials: 'AO' },
      { name: 'Kolade Obi', role: 'Designer', discipline: 'UI/UX', initials: 'KO' },
      { name: 'Bayo Adekunle', role: 'Designer', discipline: 'UI/UX', initials: 'BA' },
      { name: 'Chioma Ndu', role: 'Developer', discipline: 'Frontend', initials: 'CN' },
    ],
  });

  return (
    <div className="max-w-full space-y-6">
      <PageHeading title="My Team" subtitle={`${team.name} (${team.code})`} />

      {/* Team Info */}
      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-[10px] text-[#7a80a9]">Team Code</p>
            <p className="text-[12px] font-semibold text-[#1d245d]">{team.code}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#7a80a9]">Total Members</p>
            <p className="text-[12px] font-semibold text-[#1d245d]">{team.membersCount}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#7a80a9]">Team Lead</p>
            <p className="text-[12px] font-semibold text-[#1d245d]">{team.lead}</p>
          </div>
        </div>
      </Card>

      {/* Team Members */}
      <Card>
        <h2 className="mb-4 text-[14px] font-semibold text-[#1d245d]">Team Members</h2>
        <div className="space-y-3">
          {team.members.map((member, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-[#e1e4f2] pb-3">
              <div className="flex items-center gap-3">
                <CircleAvatar initials={member.initials} tone="primary" />
                <div>
                  <p className="text-[11px] font-semibold text-[#1d245d]">{member.name}</p>
                  <p className="text-[10px] text-[#7a80a9]">{member.role}</p>
                </div>
              </div>
              <StatusPill label={member.discipline} tone="neutral" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// TEAM ALLOCATION PAGE (LEARNER VIEW)
// ============================================================================

export function TeamAllocationPage() {
  const [assignedTeam, setAssignedTeam] = useState<string | null>(null);

  const availableTeams = [
    { code: 'AC KO BA', name: 'UI/UX Design Team', discipline: 'Design', members: 6, available: true },
    { code: 'CH TO', name: 'Frontend Dev Team', discipline: 'Frontend', members: 5, available: true },
    { code: 'NG FU AM', name: 'Product Mgmt Team', discipline: 'Product', members: 8, available: true },
  ];

  return (
    <div className="max-w-full space-y-6">
      <PageHeading title="Team Allocation" subtitle="Join a team or view your current team assignment" />

      {assignedTeam ? (
        <Card className="border-2 border-[#9cd4ae] bg-[#e7f8eb]">
          <p className="text-[11px] text-[#1f7b3a]">✓ You are assigned to:</p>
          <p className="text-[13px] font-bold text-[#1f7b3a]">{assignedTeam}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] text-[#7a80a9]">Available Teams:</p>
          {availableTeams.map((team, idx) => (
            <Card key={idx}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-[#1d245d]">{team.name}</p>
                  <p className="text-[10px] text-[#7a80a9]">{team.code}</p>
                  <div className="mt-2 flex gap-2">
                    <StatusPill label={team.discipline} tone="neutral" />
                    <StatusPill label={`${team.members} members`} tone="neutral" />
                  </div>
                </div>
                <ActionButton variant="primary" onClick={() => setAssignedTeam(team.name)}>
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

// ============================================================================
// LEARNER PROFILE & SETTINGS (FROM DESIGNS/)
// ============================================================================

export function LearnerProfilePage() {
  const [activeTab, setActiveTab] = useState<'about' | 'courses' | 'certificates'>('about');
  const { user } = useAuthStore();

  const skillTags = ['Figma', 'User Research', 'Wireframing'];

  const initials = `${user?.firstName?.[0] || 'U'}${user?.lastName?.[0] || ''}`.toUpperCase();
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Your Profile';
  const headline = user ? `${user.role}` : 'learner';

  return (
    <div className="max-w-[960px] space-y-5">
      <div className="overflow-hidden rounded-xl border border-[#eceff8] bg-white">
        <div className="bg-gradient-to-r from-[#07107b] to-[#000033] px-6 py-7 text-center text-white">
          <p className="text-[11px] opacity-90">This User is a</p>
          <p className="text-[22px] font-bold tracking-wide">{headline}</p>
        </div>

        <div className="flex items-start gap-3 px-5 py-4">
          <CircleAvatar initials={initials} tone="primary" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#1f2560]">{fullName}</p>
            <p className="text-[11px] text-[#646b95]">{user?.email || 'Signed in user'}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LinkButton to="/learner/settings" variant="secondary">
              Settings
            </LinkButton>
          </div>
        </div>

        <div className="px-5 pb-5">
          <Card className="h-[88px]">
            <div />
          </Card>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#e1e4f2]">
        <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')}>
          About
        </TabButton>
        <TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}>
          My Courses
        </TabButton>
        <TabButton active={activeTab === 'certificates'} onClick={() => setActiveTab('certificates')}>
          Certificates
        </TabButton>
      </div>

      {activeTab === 'about' && (
        <div className="space-y-3">
          <Card className="space-y-2">
            <p className="text-[12px] font-semibold text-[#2f356f]">Skills</p>
            <div className="flex flex-wrap gap-2">
              {skillTags.map((tag) => (
                <StatusPill key={tag} label={tag} tone="neutral" />
              ))}
            </div>
          </Card>

          <Card className="space-y-2">
            <p className="text-[12px] font-semibold text-[#2f356f]">About</p>
            <p className="text-[11px] leading-5 text-[#646b95]">
              {user?.bio ||
                'Add a short bio in your profile settings. This section will reflect your saved profile details.'}
            </p>
          </Card>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-2">
          {[
            ['UI/UX Fundamentals', 'Active'],
            ['Figma Advanced', 'Active'],
            ['Brand Identity 101', 'Completed'],
          ].map(([title, status]) => (
            <Card className="flex items-center justify-between" key={title}>
              <div>
                <p className="text-[12px] font-semibold text-[#2f356f]">{title}</p>
                <p className="text-[10px] text-[#8f94b2]">{status}</p>
              </div>
              <StatusPill label={status} tone={status === 'Completed' ? 'success' : 'primary'} />
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="space-y-2">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[#2f356f]">UI/UX Fundamentals</p>
              <p className="text-[10px] text-[#8f94b2]">Issued Apr 1, 2026</p>
            </div>
            <ActionButton variant="secondary">Download</ActionButton>
          </Card>
        </div>
      )}
    </div>
  );
}

export function LearnerSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [announcements, setAnnouncements] = useState(true);
  const [teamMentions, setTeamMentions] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [theme, setTheme] = useState('Light Mode');
  const [language, setLanguage] = useState('English');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 700);
  };

  return (
    <div className="max-w-[960px] space-y-6">
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
            <LinkButton to="/learner/settings/change-password" variant="secondary">
              Update
            </LinkButton>
          </div>

          <div className="flex items-center justify-between rounded-md border border-[#e1e4f2] bg-[#f8f9fc] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Email Address</p>
              <p className="text-[10px] text-[#7a80a9]">ads.okonkwo@truemails.com</p>
            </div>
            <LinkButton to="/learner/settings/change-email" variant="secondary">
              Change
            </LinkButton>
          </div>
        </div>
      </Card>

      {/* Notifications Section */}
      <Card>
        <h3 className="mb-4 border-b border-[#e1e4f2] pb-3 text-[14px] font-semibold text-[#1d245d]">Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Assignment Reminders</p>
              <p className="text-[10px] text-[#7a80a9]">Get notified before due dates</p>
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
              <p className="text-[10px] text-[#7a80a9]">Updates from admin and instructors</p>
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
              <p className="text-[12px] font-medium text-[#1d245d]">Team Chat Mentions</p>
              <p className="text-[10px] text-[#7a80a9]">When someone mentions you</p>
            </div>
            <input
              checked={teamMentions}
              onChange={(e) => setTeamMentions(e.target.checked)}
              type="checkbox"
              className="h-5 w-5 accent-[#08107b]"
            />
          </label>

          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Email Notifications</p>
              <p className="text-[10px] text-[#7a80a9]">Receive a daily email summary</p>
            </div>
            <input
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
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

export function LearnerChangeEmailPage() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-[600px] space-y-5">
      <PageHeading subtitle="Enter your new email and confirm your password" title="Change Email Address" />

      <Card className="space-y-3">
        <label className="block text-[11px] font-semibold text-[#2f356f]">
          Current Email
          <input
            className="mt-1 h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]"
            defaultValue="learner@talentflow.io"
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
          <LinkButton to="/learner/settings" variant="secondary">
            Cancel
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}

export function LearnerChangePasswordPage() {
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
          <LinkButton to="/learner/settings" variant="secondary">
            Cancel
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
