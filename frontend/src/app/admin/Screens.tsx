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
import { useGetAdminDashboard } from '@/shared/hooks/useAdminData';

const teams = [
  { id: 'uiux', code: 'AC KO BA', name: 'UI/UX Design Team', detail: '6 members, Mr. Emeka Lead' },
  { id: 'frontend', code: 'CH TO', name: 'Frontend Dev Team', detail: '5 members, Mr. Chidi Lead' },
  { id: 'pm', code: 'NG FU AM', name: 'Product Mgmt Team', detail: '8 members, Mr. Ngwu Lead' },
];

const userRows = [
  { id: 'ada-okonkwo', name: 'Ada Okonkwo', role: 'Learner', discipline: 'UI/UX Team', progress: 65, status: 'Active', initials: 'AO' },
  { id: 'temi-lawson', name: 'Temi Lawson', role: 'Learner', discipline: 'Social Media', progress: 75, status: 'Active', initials: 'TL' },
  { id: 'kolade-obi', name: 'Kolade Obi', role: 'Learner', discipline: 'UI/UX Team', progress: 90, status: 'Active', initials: 'KO' },
  { id: 'bayo-adeyemi', name: 'Bayo Adeyemi', role: 'Learner', discipline: 'UI/UX Team', progress: 45, status: 'Active', initials: 'BA' },
  { id: 'emeka-okafor', name: 'Mr. Emeka Okafor', role: 'Instructor', discipline: 'UI/UX Team', progress: 0, status: 'Active', initials: 'EO' },
];

const managedCourses = [
  {
    title: 'UI/UX Fundamentals',
    lessons: '8 lessons - 2.5 hrs',
    instructor: 'Mr. Emeka',
    enrolled: '22',
    progress: 75,
    status: 'Active',
  },
  {
    title: 'HTML/CSS Fundamentals',
    lessons: '7 lessons - 2.5 hrs',
    instructor: 'Mr. Chidi',
    enrolled: '18',
    progress: 62,
    status: 'Active',
  },
  {
    title: 'UX Research Methods',
    lessons: '6 lessons - drafts',
    instructor: 'Mr. Emeka',
    enrolled: '-',
    progress: 0,
    status: 'Draft',
  },
  {
    title: 'Social Media Strategy',
    lessons: '5 lessons - 1.5 hrs',
    instructor: 'Ms. Tolu',
    enrolled: '12',
    progress: 82,
    status: 'Active',
  },
];

const notifications = [
  {
    title: 'New Instructor Registered',
    message:
      'Ms. Tolu Adeyemi has completed onboarding and is now active as an instructor. Please assign her to the Social Media course.',
    age: '45 minutes ago',
    action: 'View',
    actionTone: 'secondary' as const,
  },
  {
    title: '4 Learners Unassigned to Teams',
    message: 'Zainab, Adams, Funke, Idris, Yemi, Seyi and one other still have not been assigned to a team.',
    age: '1 hour ago',
    action: 'Assign Now',
    actionTone: 'primary' as const,
  },
  {
    title: 'Course Pending Approval',
    message: 'Mr. Emeka submitted UX Research Methods for review. Please approve or request edits.',
    age: '3 hours ago',
    action: 'Approve',
    actionTone: 'success' as const,
  },
  {
    title: 'Certificates Issued - 14 Learners',
    message: '14 learners have now completed 100% of at least one course and have received digital certificates.',
    age: 'Yesterday, 3:20 PM',
    action: 'View',
    actionTone: 'secondary' as const,
  },
  {
    title: 'New Learner Sign Up - Temi Lawson',
    message: 'A new learner registered on the platform. Role: Learner. Discipline: Social Media.',
    age: 'Mar 26, 2026',
    action: 'View',
    actionTone: 'secondary' as const,
  },
];

const unassignedLearners = [
  { name: 'Zainab Adamu', status: 'Unassigned', initials: 'ZA' },
  { name: 'Emeka Bello', status: 'Unassigned', initials: 'EB' },
];

export function AdminDashboardPage() {
  const { data: dashboardData, loading, error } = useGetAdminDashboard();

  // Fallback metrics if API fails or loading
  const defaultMetrics = [
    { value: '0', title: 'Total Interns', tone: 'default' as const },
    { value: '0', title: 'Active Courses', tone: 'default' as const },
    { value: '0', title: 'Instructors', tone: 'default' as const },
    { value: '0', title: 'Teams Created', tone: 'default' as const },
  ];

  const metrics = dashboardData?.metrics || defaultMetrics;
  const teams_data = dashboardData?.teams || [];
  const recent_users = dashboardData?.recentUsers || [];

  return (
    <div className="space-y-5">
      <PageHeading
        action={
          <div className="flex items-center gap-2">
            <ActionButton variant="primary">+ Add User</ActionButton>
            <LinkButton to="/admin/team-allocation/create" variant="secondary">
              + Create Team
            </LinkButton>
          </div>
        }
        subtitle={dashboardData?.cohortInfo || 'Platform Overview'}
        title="Admin Dashboard"
      />

      {error && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item: any) => (
              <StatCard key={item.title} title={item.title} value={item.value} />
            ))}
          </div>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#1f2560]">Team Allocation</h3>
              <LinkButton to="/admin/team-allocation" variant="secondary">
                Manage +
              </LinkButton>
            </div>
            <div className="space-y-2">
              {teams_data.slice(0, 3).map((team: any) => (
                <div 
                  className="flex items-center justify-between rounded-md border border-[#eceff8] bg-[#f9faff] p-3" 
                  key={team.id || team.name}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[#ecf0ff] px-2 text-[10px] font-semibold text-[#2f356f]">
                      {team.code || 'N/A'}
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-[#2f356f]">{team.name}</p>
                      <p className="text-[10px] text-[#8d93b1]">{team.detail || 'No details'}</p>
                    </div>
                  </div>
                  <LinkButton to={`/admin/team-allocation/${team.id}/edit`} variant="secondary">
                    Edit
                  </LinkButton>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-x-auto p-0">
            <div className="flex items-center justify-between border-b border-[#eceff8] px-3 py-2">
              <h3 className="text-[18px] font-semibold text-[#1f2560]">Recent Users</h3>
              <LinkButton to="/admin/users" variant="secondary">
                View all +
              </LinkButton>
            </div>
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-[#f2f4fa] text-[10px] uppercase tracking-wide text-[#4e5582]">
                <tr>
                  <th className="px-3 py-2 font-semibold">User</th>
                  <th className="px-3 py-2 font-semibold">Discipline</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent_users.slice(0, 5).map((user: any) => (
                  <tr className="border-t border-[#eceff8] text-[11px] text-[#2f356f]" key={user.id || user.name}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <CircleAvatar initials={(user.name || 'N/A').slice(0, 2).toUpperCase()} />
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-[10px] text-[#8d93b1]">{user.role || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">{user.discipline || 'N/A'}</td>
                    <td className="px-3 py-2">
                      <StatusPill 
                        label={user.status || 'Inactive'} 
                        tone={user.status === 'Active' && user.status === 'active' ? 'primary' : 'neutral'} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}

export function AdminUsersPage() {
  const [disciplineTab, setDisciplineTab] = useState('all');

  const filteredUsers = useMemo(() => {
    if (disciplineTab === 'all') {
      return userRows;
    }
    if (disciplineTab === 'social') {
      return userRows.filter((row) => row.discipline.includes('Social'));
    }
    return userRows.filter((row) => row.discipline.toLowerCase().includes(disciplineTab));
  }, [disciplineTab]);

  return (
    <div className="space-y-5">
      <PageHeading
        action={
          <div className="flex items-center gap-2">
            <ActionButton variant="primary">+ Add User</ActionButton>
            <ActionButton variant="secondary">Import CSV</ActionButton>
          </div>
        }
        subtitle="58 users total - 52 learners - 6 instructors"
        title="User Management"
      />

      <div className="flex flex-wrap gap-2">
        <TabButton active={disciplineTab === 'all'} onClick={() => setDisciplineTab('all')}>
          All Disciplines
        </TabButton>
        <TabButton active={disciplineTab === 'uiux'} onClick={() => setDisciplineTab('uiux')}>
          UI/UX
        </TabButton>
        <TabButton active={disciplineTab === 'frontend'} onClick={() => setDisciplineTab('frontend')}>
          Frontend
        </TabButton>
        <TabButton active={disciplineTab === 'backend'} onClick={() => setDisciplineTab('backend')}>
          Backend
        </TabButton>
        <TabButton active={disciplineTab === 'social'} onClick={() => setDisciplineTab('social')}>
          Social Media
        </TabButton>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[#f2f4fa] text-[10px] uppercase tracking-wide text-[#4e5582]">
            <tr>
              <th className="px-3 py-2 font-semibold">User</th>
              <th className="px-3 py-2 font-semibold">Role</th>
              <th className="px-3 py-2 font-semibold">Discipline</th>
              <th className="px-3 py-2 font-semibold">Progress</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr className="border-t border-[#eceff8] text-[11px] text-[#2f356f]" key={user.name}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CircleAvatar initials={user.initials} />
                    <p className="font-semibold">{user.name}</p>
                  </div>
                </td>
                <td className="px-3 py-2">{user.role}</td>
                <td className="px-3 py-2">{user.discipline}</td>
                <td className="px-3 py-2">
                  <div className="w-[170px]">
                    <ProgressBar value={user.progress} />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <StatusPill label={user.status} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <LinkButton to={`/admin/users/${user.id}/edit`} variant="primary">
                      Edit
                    </LinkButton>
                    <ActionButton variant="danger">Delete</ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function AdminUserEditPage() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-[760px] space-y-5">
      <PageHeading subtitle="58 users total - 52 learners - 6 instructors" title="Edit User Profile" />

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-[11px] font-semibold text-[#2f356f]">
          First Name
          <input className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]" defaultValue="Ada" type="text" />
        </label>
        <label className="text-[11px] font-semibold text-[#2f356f]">
          Last Name
          <input className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]" defaultValue="Okonkwo" type="text" />
        </label>
      </div>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Email Address
        <input className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]" defaultValue="ada@talentflow.io" type="email" />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-[11px] font-semibold text-[#2f356f]">
          Role
          <select className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]">
            <option>Learner</option>
            <option>Instructor</option>
            <option>Admin</option>
          </select>
        </label>
        <label className="text-[11px] font-semibold text-[#2f356f]">
          Status
          <select className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]">
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <ActionButton variant="danger">Deactivate User</ActionButton>
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
        <LinkButton to="/admin/users" variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </div>
  );
}

export function AdminCoursesPage() {
  return (
    <div className="space-y-5">
      <PageHeading
        action={<ActionButton variant="primary">+ Add Course</ActionButton>}
        subtitle="8 active courses across 6 disciplines"
        title="Course Management"
      />

      <div className="flex flex-wrap gap-2">
        <TabButton active>All (9)</TabButton>
        <TabButton>Active (8)</TabButton>
        <TabButton>Draft (1)</TabButton>
        <TabButton>UI/UX</TabButton>
        <TabButton>Frontend</TabButton>
        <TabButton>Social Media</TabButton>
        <TabButton>Backend</TabButton>
      </div>

      <Card className="space-y-3">
        {managedCourses.map((course) => (
          <Card className="space-y-2 p-3" key={course.title}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14px] font-semibold text-[#1f2560]">{course.title}</p>
                <p className="text-[11px] text-[#8d93b1]">{course.lessons}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-[#6f75a0]">Enrolled</p>
                <p className="text-[16px] font-semibold text-[#2f356f]">{course.enrolled}</p>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <p className="text-[10px] font-semibold text-[#6f75a0]">Instructor: {course.instructor}</p>
                <div className="mt-1 max-w-[220px]">
                  <ProgressBar value={course.progress} />
                </div>
              </div>
              <StatusPill label={course.status} tone={course.status === 'Draft' ? 'warning' : 'success'} />
              <div className="flex items-center gap-1">
                <ActionButton variant="secondary">Edit</ActionButton>
                <ActionButton variant={course.status === 'Draft' ? 'primary' : 'danger'}>
                  {course.status === 'Draft' ? 'Review' : 'Archive'}
                </ActionButton>
              </div>
            </div>
          </Card>
        ))}
      </Card>
    </div>
  );
}

export function AdminNotificationsPage() {
  return (
    <div className="space-y-5">
      <PageHeading action={<ActionButton variant="primary">Mark all read</ActionButton>} subtitle="June 2026" title="Notifications" />

      <Card className="space-y-2">
        {notifications.map((notification) => (
          <div className="flex items-start gap-3 rounded-md border border-[#eceff8] p-3" key={notification.title}>
            <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[#f08a2c]" />
            <CircleAvatar initials={notification.title.slice(0, 1)} tone="soft" />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-[#1f2560]">{notification.title}</p>
              <p className="mt-1 text-[11px] leading-4 text-[#66709c]">{notification.message}</p>
              <p className="mt-1 text-[10px] text-[#8d93b1]">{notification.age}</p>
            </div>
            <ActionButton variant={notification.actionTone}>{notification.action}</ActionButton>
          </div>
        ))}
      </Card>
    </div>
  );
}

export function AdminNotificationDetailsPage() {
  return (
    <div className="space-y-5">
      <PageHeading action={<ActionButton variant="primary">Mark all read</ActionButton>} title="Notifications Details" />

      <div className="mx-auto max-w-[340px]">
        <Card className="space-y-3">
          <h3 className="text-[14px] font-semibold text-[#1f2560]">Notification Details</h3>
          <p className="text-[12px] leading-5 text-[#4f5786]">
            Ms. Tolu Adeyemi has completed onboarding and is now active as an instructor. Please assign her to the Social
            Media course.
          </p>
          <div className="flex items-center gap-2">
            <ActionButton variant="secondary">Close</ActionButton>
            <ActionButton variant="primary">Approve now</ActionButton>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function AdminTeamAllocationPage() {
  return (
    <div className="max-w-[760px] space-y-5">
      <PageHeading
        action={<LinkButton to="/admin/team-allocation/create" variant="primary">+ Create Team</LinkButton>}
        subtitle="Manage project groups"
        title="Team Allocation"
      />

      <div>
        <h3 className="mb-2 text-[12px] font-semibold text-[#2f356f]">All Teams</h3>
        <div className="space-y-2">
          {teams.slice(0, 2).map((team) => (
            <Card className="flex items-center justify-between p-3" key={team.name}>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-[#f3f1df] px-2 text-[10px] font-semibold text-[#2f356f]">
                  {team.code.split(' ')[0]}
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-[#2f356f]">{team.name}</p>
                  <p className="text-[10px] text-[#8d93b1]">5 members</p>
                </div>
              </div>
              <LinkButton to={`/admin/team-allocation/${team.id}/edit`} variant="secondary">
                Edit
              </LinkButton>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-[12px] font-semibold text-[#2f356f]">Unassigned Learners</h3>
        <div className="space-y-2">
          {unassignedLearners.map((learner) => (
            <Card className="flex items-center justify-between p-3" key={learner.name}>
              <div className="flex items-center gap-2">
                <CircleAvatar initials={learner.initials} tone={learner.name === 'Emeka Bello' ? 'primary' : 'soft'} />
                <div>
                  <p className="text-[12px] font-semibold text-[#2f356f]">{learner.name}</p>
                  <p className="text-[10px] text-[#8d93b1]">{learner.status}</p>
                </div>
              </div>
              <LinkButton to="/admin/team-allocation/assign" variant="secondary">
                Assign
              </LinkButton>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminCreateTeamPage() {
  const [saving, setSaving] = useState(false);
  return (
    <div className="max-w-[640px] space-y-5">
      <PageHeading subtitle="58 users total - 52 learners - 6 instructors" title="Create Team Allocation" />

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Team Name
        <input className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]" defaultValue="UI/UX Design Team" type="text" />
      </label>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Discipline
        <select className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]">
          <option>UI/UX Design</option>
          <option>Frontend</option>
          <option>Backend</option>
          <option>Social Media</option>
        </select>
      </label>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Assign Instructor
        <select className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]">
          <option>Mr. Emeka (UI/UX)</option>
          <option>Mr. Chidi (Frontend)</option>
          <option>Ms. Tolu (Social Media)</option>
        </select>
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
          Save Team
        </ActionButton>
        <LinkButton to="/admin/team-allocation" variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </div>
  );
}

export function AdminEditTeamPage() {
  const [members, setMembers] = useState(['Ada Okonkwo', 'Bayo Adeyemi', 'Kolade Obi']);

  return (
    <div className="max-w-[640px] space-y-5">
      <PageHeading subtitle="58 users total - 52 learners - 6 instructors" title="Edit Team Allocation" />

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Team Name
        <input className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]" defaultValue="UI/UX Design Team" type="text" />
      </label>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Team Lead
        <select className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]">
          <option>Mr. Emeka (UI/UX)</option>
          <option>Mr. Chidi (Frontend)</option>
        </select>
      </label>

      <div>
        <p className="mb-2 text-[11px] font-semibold text-[#2f356f]">Members (Click to remove)</p>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <button
              className="inline-flex items-center gap-1 rounded-md border border-[#d8dcee] bg-[#f8f9ff] px-2 py-1 text-[10px] font-semibold text-[#2f356f]"
              key={member}
              onClick={() => setMembers((current) => current.filter((item) => item !== member))}
              type="button"
            >
              {member} x
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ActionButton variant="primary">Save Team</ActionButton>
        <LinkButton to="/admin/team-allocation" variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </div>
  );
}

export function AdminAssignLearnerPage() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="max-w-[640px] space-y-5">
      <PageHeading subtitle="Manage project groups" title="Assign Learner to Team" />

      <p className="text-[12px] font-semibold text-[#2f356f]">Zainab Adamu</p>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Select Destination Team
        <select className="mt-1 h-9 rounded-md border border-[#d8dcee] text-[11px]">
          <option>Choose a team...</option>
          <option>UI/UX Design Team</option>
          <option>Frontend Dev Team</option>
          <option>Product Mgmt Team</option>
        </select>
      </label>

      <div className="flex items-center gap-2">
        <LinkButton to="/admin/team-allocation" variant="secondary">
          Cancel
        </LinkButton>
        <ActionButton
          loading={loading}
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
          }}
          variant="primary"
        >
          Confirm Assignment
        </ActionButton>
      </div>
    </div>
  );
}

export function AdminAnalyticsPage() {
  return (
    <div className="space-y-5">
      <PageHeading
        action={<ActionButton variant="primary">Export Report</ActionButton>}
        subtitle="Phase 2 Cohort - March 17 to April 10, 2026"
        title="Platform Analytics"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Learners" value="30" />
        <StatCard title="Submissions this week" value="31" />
        <StatCard title="Platform Avg Progress" value="68%" />
        <StatCard title="Certificates Issued" value="14" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <h3 className="mb-3 text-[16px] font-semibold text-[#1f2560]">Engagement - Daily Active Learners</h3>
          <div className="flex h-40 items-end gap-2">
            {[52, 84, 66, 34, 30, 48, 58].map((height, index) => (
              <div className="flex-1" key={height}>
                <div className="rounded-t-md bg-[#07107b]" style={{ height: `${height}%` }} />
                <p className="mt-1 text-center text-[9px] text-[#8f94b2]">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-2">
          <h3 className="text-[16px] font-semibold text-[#1f2560]">Progress by Discipline</h3>
          {[
            ['UI/UX Design', 65],
            ['Frontend Dev', 45],
            ['Social Media', 75],
            ['Backend Dev', 80],
          ].map(([discipline, progress]) => (
            <div key={discipline}>
              <p className="text-[11px] font-semibold text-[#2f356f]">{discipline}</p>
              <ProgressBar value={Number(progress)} />
            </div>
          ))}
        </Card>
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="border-b border-[#eceff8] px-3 py-2">
          <h3 className="text-[16px] font-semibold text-[#1f2560]">Top Performers - This Week</h3>
        </div>
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[#f2f4fa] text-[10px] uppercase tracking-wide text-[#4e5582]">
            <tr>
              <th className="px-3 py-2 font-semibold">Learner</th>
              <th className="px-3 py-2 font-semibold">Discipline</th>
              <th className="px-3 py-2 font-semibold">Avg Score</th>
              <th className="px-3 py-2 font-semibold">Progress</th>
              <th className="px-3 py-2 font-semibold">Certificates</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Ngozi Eze', 'Product Mgmt', '92/100', 90, '2'],
              ['Ada Okonkwo', 'UI/UX', '88/100', 80, '1'],
              ['Funke Coker', 'UI/UX', '85/100', 85, '1'],
            ].map(([name, discipline, score, progress, cert]) => (
              <tr className="border-t border-[#eceff8] text-[11px] text-[#2f356f]" key={name}>
                <td className="px-3 py-2">{name}</td>
                <td className="px-3 py-2">{discipline}</td>
                <td className="px-3 py-2">{score}</td>
                <td className="px-3 py-2">
                  <div className="w-[160px]">
                    <ProgressBar value={Number(progress)} />
                  </div>
                </td>
                <td className="px-3 py-2">{cert}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

const adminAnnouncementRows = [
  {
    title: 'New cohort onboarding checklist',
    detail: 'All admins: please ensure team allocations and course assignments are completed before Monday.',
    date: 'Apr 9, 2026',
  },
  {
    title: 'Platform maintenance window',
    detail: 'Scheduled maintenance on Saturday 9:00 PM. Expect brief downtime.',
    date: 'Apr 7, 2026',
  },
];

export function AdminAnnouncementsPage() {
  return (
    <div className="max-w-[860px] space-y-5">
      <PageHeading
        action={
          <LinkButton to="/admin/announcements/new" variant="secondary">
            + Add Announcement
          </LinkButton>
        }
        subtitle="Post platform-wide updates"
        title="Announcements"
      />

      <div className="space-y-2">
        {adminAnnouncementRows.map((row) => (
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

export function AdminAddAnnouncementPage() {
  const [sending, setSending] = useState(false);

  return (
    <div className="max-w-[700px] space-y-5">
      <PageHeading subtitle="Compose and send a new announcement" title="Add Announcement" />

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Send To
        <select className="mt-1 h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]">
          <option>All Users</option>
          <option>Admins</option>
          <option>Instructors</option>
          <option>Learners</option>
        </select>
      </label>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Subject *
        <input className="mt-1 h-9 w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" placeholder="Announcement title..." type="text" />
      </label>

      <label className="block text-[11px] font-semibold text-[#2f356f]">
        Message *
        <textarea className="mt-1 min-h-[120px] w-full rounded-md border border-[#d8dcee] px-2 text-[11px]" placeholder="Write your announcement here..." />
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
        <LinkButton to="/admin/announcements" variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </div>
  );
}

export function AdminProfilePage() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-[860px] space-y-5">
      <PageHeading
        action={<ActionButton variant="secondary">Discard Changes</ActionButton>}
        subtitle="Manage your personal identity and avatar on the platform"
        title="Admin Profile"
      />

      <Card className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex items-center gap-6 border-b border-[#e4e7f3] pb-6">
          <div className="flex-shrink-0">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#08107b] text-4xl font-semibold text-white">
              AO
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-[#2f356f] mb-1">Profile picture</p>
            <p className="text-[10px] text-[#8f94b2] mb-3">JPG, GIF or PNG . Max size of 2MB</p>
            <div className="flex gap-2">
              <ActionButton variant="secondary">Upload Image</ActionButton>
              <ActionButton variant="danger">Remove</ActionButton>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-[11px] font-semibold text-[#2f356f]">
              First Name
              <input 
                className="mt-2 h-10 w-full rounded-md border border-[#d8dcee] px-3 text-[11px] placeholder:text-[#c0c5e0] focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1" 
                defaultValue="Admin" 
                type="text" 
              />
            </label>
            <label className="block text-[11px] font-semibold text-[#2f356f]">
              Last Name
              <input 
                className="mt-2 h-10 w-full rounded-md border border-[#d8dcee] px-3 text-[11px] placeholder:text-[#c0c5e0] focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1" 
                defaultValue="User" 
                type="text" 
              />
            </label>
          </div>

          <label className="block text-[11px] font-semibold text-[#2f356f]">
            Phone Number (Optional)
            <input 
              className="mt-2 h-10 w-full rounded-md border border-[#d8dcee] px-3 text-[11px] placeholder:text-[#c0c5e0] focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1" 
              placeholder="Phone number" 
              type="tel" 
            />
          </label>

          <label className="block text-[11px] font-semibold text-[#2f356f]">
            Email Address
            <input 
              className="mt-2 h-10 w-full rounded-md border border-[#d8dcee] px-3 text-[11px] placeholder:text-[#c0c5e0] focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1" 
              defaultValue="admin@talentflow.com" 
              type="email" 
            />
          </label>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-2 pt-4 border-t border-[#e4e7f3]">
          <ActionButton
            loading={saving}
            onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 900);
            }}
            variant="primary"
          >
            Save Changes
          </ActionButton>
        </div>
      </Card>
    </div>
  );
}

export function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [openSelfRegistration, setOpenSelfRegistration] = useState(true);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);
  const [certificatesAutoIssue, setCertificatesAutoIssue] = useState(true);
  const [weeklyProgressDigest, setWeeklyProgressDigest] = useState(true);
  const [newUserRegistrationAlerts, setNewUserRegistrationAlerts] = useState(true);
  const [learnerInactivityAlerts, setLearnerInactivityAlerts] = useState(true);
  const [theme, setTheme] = useState('Light Mode');
  const [language, setLanguage] = useState('English');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 700);
  };

  return (
    <div className="max-w-[860px] space-y-6">
      <PageHeading subtitle="Configure TalentFlow LMS for your cohort." title="Platform Settings" />

      <Card>
        <h3 className="mb-4 border-b border-[#e1e4f2] pb-3 text-[14px] font-semibold text-[#1d245d]">Account</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <LinkButton to="/admin/settings/change-email" variant="secondary">
            Change email address
          </LinkButton>
          <LinkButton to="/admin/settings/change-password" variant="secondary">
            Change password
          </LinkButton>
        </div>
      </Card>

      {/* Platform Information */}
      <Card>
        <h3 className="mb-4 flex items-center justify-between border-b border-[#e1e4f2] pb-3">
          <span className="text-[14px] font-semibold text-[#1d245d]">Platform Information</span>
          <ActionButton variant="secondary" className="text-[10px]">Save Settings</ActionButton>
        </h3>
        <div className="space-y-3">
          <label className="block">
            <p className="mb-2 text-[11px] font-semibold text-[#1d245d]">Platform Name</p>
            <input
              type="text"
              defaultValue="TalentFlow LMS"
              className="h-9 w-full rounded-md border border-[#d8dcee] px-3 text-[11px]"
            />
          </label>

          <label className="block">
            <p className="mb-2 text-[11px] font-semibold text-[#1d245d]">Organisation</p>
            <input
              type="text"
              defaultValue="Truemind Innovations Ltd"
              className="h-9 w-full rounded-md border border-[#d8dcee] px-3 text-[11px]"
            />
          </label>
        </div>
      </Card>

      {/* Enrollment & Access section */}
      <Card>
        <h3 className="mb-4 border-b border-[#e1e4f2] pb-3 text-[14px] font-semibold text-[#1d245d]">Enrollment & Access</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Open Self-Registration</p>
              <p className="text-[10px] text-[#7a80a9]">Allow learners to signup without an invite</p>
            </div>
            <input
              checked={openSelfRegistration}
              onChange={(e) => setOpenSelfRegistration(e.target.checked)}
              type="checkbox"
              className="h-5 w-5 accent-[#08107b]"
            />
          </label>

          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Email Verification Required</p>
              <p className="text-[10px] text-[#7a80a9]">Learners must verify email before accessing</p>
            </div>
            <input
              checked={emailVerificationRequired}
              onChange={(e) => setEmailVerificationRequired(e.target.checked)}
              type="checkbox"
              className="h-5 w-5 accent-[#08107b]"
            />
          </label>

          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Certificates Auto-Issue</p>
              <p className="text-[10px] text-[#7a80a9]">Auto-generate certificate when learner hits 100%</p>
            </div>
            <input
              checked={certificatesAutoIssue}
              onChange={(e) => setCertificatesAutoIssue(e.target.checked)}
              type="checkbox"
              className="h-5 w-5 accent-[#08107b]"
            />
          </label>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h3 className="mb-4 border-b border-[#e1e4f2] pb-3 text-[14px] font-semibold text-[#1d245d]">Notification Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Weekly Progress Digest</p>
              <p className="text-[10px] text-[#7a80a9]">Send weekly email digest to all admins</p>
            </div>
            <input
              checked={weeklyProgressDigest}
              onChange={(e) => setWeeklyProgressDigest(e.target.checked)}
              type="checkbox"
              className="h-5 w-5 accent-[#08107b]"
            />
          </label>

          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">New User Registration Alerts</p>
              <p className="text-[10px] text-[#7a80a9]">Notify admins when new users sign up</p>
            </div>
            <input
              checked={newUserRegistrationAlerts}
              onChange={(e) => setNewUserRegistrationAlerts(e.target.checked)}
              type="checkbox"
              className="h-5 w-5 accent-[#08107b]"
            />
          </label>

          <label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3">
            <div>
              <p className="text-[12px] font-medium text-[#1d245d]">Learner Inactivity Alerts</p>
              <p className="text-[10px] text-[#7a80a9]">Alert if a learner is inactive for 5+ days</p>
            </div>
            <input
              checked={learnerInactivityAlerts}
              onChange={(e) => setLearnerInactivityAlerts(e.target.checked)}
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

      {/* Save Button */}
      <div className="flex gap-2">
        <ActionButton loading={saving} onClick={handleSave} variant="primary">
          {saving ? 'Saving...' : 'Save Settings'}
        </ActionButton>
      </div>
    </div>
  );
}

export function AdminChangeEmailPage() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-[600px] space-y-5">
      <PageHeading subtitle="Enter your new email and confirm your password" title="Change Email Address" />

      <Card className="space-y-4 p-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Current Email
          </label>
          <input
            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1 text-sm"
            defaultValue="admin@talentflow.com"
            type="email"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            New Email Address
          </label>
          <input 
            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1 text-sm" 
            placeholder="Enter new email" 
            type="email" 
          />
          <p className="mt-2 text-xs text-gray-600">A verification link will be sent to this address.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Confirm Password
          </label>
          <input 
            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1 text-sm" 
            placeholder="Enter your current password" 
            type="password" 
          />
        </div>

        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 900);
            }}
            disabled={saving}
            className="px-6 py-2 bg-[#08107b] text-white font-medium rounded-lg hover:bg-[#060b59] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save New Email'}
          </button>
          <LinkButton to="/admin/settings" variant="secondary">
            Cancel
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}

export function AdminChangePasswordPage() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-[600px] space-y-5">
      <PageHeading subtitle="Enter your current password, then choose a new one" title="Change Password" />

      <Card className="space-y-4 p-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Current Password
          </label>
          <input 
            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1 text-sm" 
            placeholder="Enter your current password" 
            type="password" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            New Password
          </label>
          <input 
            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1 text-sm" 
            placeholder="Enter a new password" 
            type="password" 
          />
          <p className="mt-2 text-xs text-gray-600">Min. 8 characters.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Confirm New Password
          </label>
          <input 
            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1 text-sm" 
            placeholder="Confirm your new password" 
            type="password" 
          />
        </div>

        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 900);
            }}
            disabled={saving}
            className="px-6 py-2 bg-[#08107b] text-white font-medium rounded-lg hover:bg-[#060b59] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save New Password'}
          </button>
          <LinkButton to="/admin/settings" variant="secondary">
            Cancel
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
