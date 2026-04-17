import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { accountAPI, adminAPI, analyticsAPI, announcementsAPI, coursesAPI, instructorAPI, teamsAPI } from '@/shared/api/client';
import { formatDate, unwrapData, useAsyncResource } from '@/shared/api/live';
import { useAuthStore } from '@/shared/state/auth';
import { useSearchContext } from '@/shared/state/search';
import { getCourseIcon } from '@/shared/utils/courseVisuals';
import { ActionButton, Card, CircleAvatar, LinkButton, PageHeading, ProgressBar, StatCard } from '@/shared/ui/talentFlow';
import { AdminAnnouncementForm } from './AdminAnnouncementForm';
import { TeamAllocationPage } from './TeamAllocationPage';
import { EnhancedAdminDashboard } from './EnhancedAdminDashboard';
import { ChevronRight, CheckCircle2, Lock, Play } from 'lucide-react';

const ErrorCard = ({ error }: { error: string | null }) => {
  if (!error) return null;
  
  // Detect if the error is likely a connection failure
  const isConnectionError = error.toLowerCase().includes('network error') || 
                             error.toLowerCase().includes('econnrefused') ||
                             error.toLowerCase().includes('504');

  return (
    <Card className="border-red-200 bg-red-50 text-sm text-red-700">
      <div className="font-bold">Error encountered:</div>
      <div>{error}</div>
      {isConnectionError && (
        <div className="mt-2 text-xs opacity-80 border-t border-red-200 pt-2">
          Tip: Check if the backend (BE-2) is running and MySQL service is active.
        </div>
      )}
    </Card>
  );
};

const EmptyCard = ({ text }: { text: string }) => <Card className="text-sm text-[#7a80a9]">{text}</Card>;

export function AdminDashboardPage() {
  return <EnhancedAdminDashboard />;
}

export function AdminUsersPage() {
  const { data, loading, error, refetch } = useAsyncResource(() => adminAPI.listUsers(), []);
  const { searchQuery } = useSearchContext();

  const filteredUsers = useMemo(() => {
    const users = unwrapData<any[]>(data as any) || data || [];
    if (!searchQuery) {
      return users;
    }

    return users.filter(
      (user: any) =>
        (user.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.role || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  return (
    <div className="space-y-5">
      <PageHeading title="User Management" subtitle="Live user administration" />
      <ErrorCard error={error} />
      {loading ? (
        <EmptyCard text="Loading users..." />
      ) : filteredUsers.length > 0 ? (
        <Card className="space-y-2">
          {filteredUsers.map((user: any) => (
            <div className="flex items-center gap-3 rounded-md border border-[#eceff8] px-3 py-2" key={user.id}>
              <CircleAvatar initials={`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'} />
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-[#2f356f]">{[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}</p>
                <p className="text-[10px] text-[#8d93b1]">{user.role}</p>
              </div>
              <div className="flex gap-2">
                <LinkButton to={`/admin/users/${user.id}/edit`} variant="secondary">Edit</LinkButton>
                <ActionButton
                  variant={user.isActive ? 'danger' : 'primary'}
                  onClick={async () => {
                    user.isActive ? await adminAPI.suspendUser(user.id, 'Admin action') : await adminAPI.activateUser(user.id);
                    await refetch();
                  }}
                >
                  {user.isActive ? 'Suspend' : 'Activate'}
                </ActionButton>
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyCard text={searchQuery ? "No users match your search." : "No users found."} />
      )}
    </div>
  );
}

export function AdminUserEditPage() {
  const { id } = useParams(); const { data, loading, error } = useAsyncResource(() => adminAPI.getUserDetail(id), null); const [saving, setSaving] = useState(false);
  return <div className="max-w-[760px] space-y-5"><PageHeading title="Edit User Profile" /><ErrorCard error={error} />{loading || !data ? <EmptyCard text="Loading user..." /> : <Card className="space-y-3"><p className="text-[12px] font-semibold text-[#2f356f]">{[data.firstName, data.lastName].filter(Boolean).join(' ')}</p><p className="text-[11px] text-[#8d93b1]">{data.email}</p><ActionButton loading={saving} variant={data.isActive ? 'danger' : 'primary'} onClick={async () => { setSaving(true); try { data.isActive ? await adminAPI.suspendUser(id, 'Admin action') : await adminAPI.activateUser(id); } finally { setSaving(false); } }}>{data.isActive ? 'Suspend User' : 'Activate User'}</ActionButton></Card>}</div>;
}

function OldAdminCoursesPage() {
  const { data, loading, error, refetch } = useAsyncResource(() => adminAPI.listCourses(), []);
  
  const courses = unwrapData<any[]>(data as any) || data || [];

  const [activeFilter, setActiveFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [learnersByCourse, setLearnersByCourse] = useState<Record<string, any[]>>({});
  const [newLearnerIdByCourse, setNewLearnerIdByCourse] = useState<Record<string, string>>({});

  // Calculate counts dynamically
  const allCourses = Array.isArray(courses) ? courses : [];
  const allCoursesCount = allCourses.length;
  const activeCoursesCount = allCourses.filter((c: any) => String(c.status).toLowerCase() === 'published' || String(c.status).toLowerCase() === 'active').length;
  const draftCoursesCount = allCourses.filter((c: any) => String(c.status).toLowerCase() === 'draft').length;

  const filterOptions = [
    { label: 'All', count: allCoursesCount }, 
    { label: 'Active', count: activeCoursesCount },
    { label: 'Draft', count: draftCoursesCount },
    { label: 'UI/UX' },
    { label: 'Frontend' },
    { label: 'Social Media' },
    { label: 'Backend' },
    { label: 'Data Science' },
    { label: 'Product Management' },
  ];

  async function handleCreate() {
    setCreating(true);
    try {
      const payload = { title, description, status: 'draft' };
      await instructorAPI.createCourse(payload);
      setTitle('');
      setDescription('');
      setShowCreate(false);
      await refetch();
    } catch (err) {
      console.error('Create course failed', err);
    } finally {
      setCreating(false);
    }
  }

  async function toggleLearners(courseId: string, forceReload = false) {
    if (!forceReload && expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }

    // load learners for course
    try {
      const resp = await instructorAPI.getCourseLearners(courseId);
      const list = resp?.data?.data || resp?.data || [];
      setLearnersByCourse((s) => ({ ...s, [courseId]: list }));
      setExpandedCourse(courseId);
    } catch (err) {
      console.error('Failed to load learners', err);
    }
  }

  const filteredCourses = allCourses.filter((course: any) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return ['published', 'active'].includes(String(course.status).toLowerCase());
    if (activeFilter === 'Draft') return String(course.status).toLowerCase() === 'draft';
    if (activeFilter === 'UI/UX') return String(course.category || '').toLowerCase().includes('ui');
    if (activeFilter === 'Frontend') return String(course.category || '').toLowerCase().includes('front');
    if (activeFilter === 'Social Media') return String(course.category || '').toLowerCase().includes('social');
    if (activeFilter === 'Backend') return String(course.category || '').toLowerCase().includes('back');
    if (activeFilter === 'Data Science') return String(course.category || '').toLowerCase().includes('data');
    if (activeFilter === 'Product Management') return String(course.category || '').toLowerCase().includes('product');
    return true;
  });

  // Using getCourseIcon from courseVisuals utility
  const getCategoryIcon = (category: string) => getCourseIcon(category);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Course Management"
        subtitle={`${activeCoursesCount} active courses across ${new Set(allCourses.filter((c: any) => c.category).map((c: any) => c.category)).size} disciplines`}
        action={<ActionButton variant="primary" onClick={() => setShowCreate((s) => !s)}>+ Add Course</ActionButton>}
      />
      <ErrorCard error={error} />
      <div className="flex flex-wrap gap-3 mb-6">
        {filterOptions.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setActiveFilter(opt.label)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeFilter === opt.label 
                ? 'bg-[#001D4C] text-white' 
                : 'bg-[#E9EEF6] text-[#001D4C] hover:bg-blue-100'
            }`}
          >
            {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
          </button>
        ))}
      </div>
      {showCreate && (
        <Card className="space-y-3">
          <input className="h-11 w-full rounded-lg border border-[#d8dcee] px-3 text-[12px]" placeholder="Course title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="min-h-[100px] w-full rounded-lg border border-[#d8dcee] px-3 py-3 text-[12px]" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2"><ActionButton loading={creating} variant="primary" onClick={handleCreate}>Create Course</ActionButton><ActionButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</ActionButton></div>
        </Card>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading Course Catalog...</div>
      ) : (
        <div className="bg-white border border-[#E0E4EC] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] border-b border-[#E0E4EC]">
              <tr>
                <th className="px-8 py-5 text-[12px] font-bold text-[#4E5566] uppercase tracking-wider w-[55%]">Course</th>
                <th className="px-6 py-5 text-[12px] font-bold text-[#4E5566] uppercase tracking-wider text-center">Enrolled</th>
                <th className="px-6 py-5 text-[12px] font-bold text-[#4E5566] uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-5 text-[12px] font-bold text-[#4E5566] uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
            {filteredCourses.length === 0 ? (
              <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400">No courses found matching your criteria.</td></tr>
            ) : filteredCourses.map((course: any) => {
              const courseKey = String(course.course_id || course.id);
              const enrolledCount = Number(course.enrolled ?? course.enrollmentCount ?? 0);
              const progressValue = Number(course.progress ?? course.averageProgress ?? 0);
              const instructorName = 
                [course.instructorFirstName, course.instructorLastName].filter(Boolean).join(' ') ||
                course.instructor?.name || // Assuming instructor might be an object with a name property
                course.instructor || // Fallback to direct instructor string
                'Not assigned';

              return (
                <React.Fragment key={courseKey}>
                  <tr className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-8 py-7">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-white border border-[#E0E4EC] rounded-xl flex items-center justify-center text-2xl shadow-sm">
                          {course.icon || getCategoryIcon(course.category || '')}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-bold text-[#001D4C] mb-1">{course.title}</h3>
                          <p className="text-sm text-[#4F5B93] font-medium">
                            {course.lessonCount || course.lessons || 0} lessons. ~{course.duration || '2 hrs'}
                          </p>
                          <div className="mt-3 text-[11px] text-[#8D93B1] uppercase font-bold tracking-tight">
                            INSTRUCTOR : <span className="text-[#001D4C]">:{instructorName}</span>
                          </div>
                          <div className="mt-3 flex items-center gap-4 w-[320px]">
                            <span className="text-[10px] uppercase font-bold text-[#8D93B1] whitespace-nowrap">Avg Progress</span>
                            {String(course.status || '').toLowerCase() !== 'draft' ? (
                              <>
                                <div className="w-full bg-[#E0E4EC] rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${progressValue > 70 ? 'bg-[#166534]' : 'bg-[#F97316]'}`}
                                    style={{ width: `${progressValue}%` }}
                                  ></div>
                                </div>
                                <span className="text-[11px] font-bold text-[#001D4C] w-10">{progressValue}%</span>
                              </>
                            ) : (
                              <span className="text-xs italic text-[#8D93B1]"> :Not Published</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center text-[22px] font-bold text-[#001D4C]">
                      {String(course.status || '').toLowerCase() !== 'draft' ? enrolledCount : <span className="text-[#4F5B93]">-</span>}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-5 py-1.5 rounded-lg text-xs font-bold border ${
                        ['published', 'active'].includes(String(course.status || '').toLowerCase())
                          ? 'bg-[#E6F4EA] text-[#1E7E34] border-[#C3E6CB]'
                          : 'bg-[#F0FDF4] text-[#22C55E] border-[#DCFCE7]' 
                      }`}>
                        {['published', 'active'].includes(String(course.status || '').toLowerCase()) ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-3">
                        {String(course.status || '').toLowerCase() === 'draft' ? (
                          <>
                            <button
                              className="px-6 py-1.5 text-[11px] font-bold border border-[#001D4C] text-[#001D4C] rounded-lg hover:bg-blue-50 transition-colors"
                              onClick={async () => { await adminAPI.approveCourse(courseKey); await refetch(); }}
                            >
                              Review
                            </button>
                            <button
                              className="px-6 py-1.5 text-[11px] font-bold border border-[#EF4444] text-[#EF4444] bg-[#FEF2F2] rounded-lg hover:bg-red-100 transition-colors"
                              onClick={async () => { /* No-op or specific approval flow */ }}
                            >
                              Approved
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="px-6 py-1.5 text-[11px] font-bold border border-[#001D4C] text-[#001D4C] rounded-lg hover:bg-blue-50 transition-colors"
                              onClick={() => toggleLearners(courseKey)}
                            >
                              Edit
                            </button>
                            <button
                              className="px-6 py-1.5 text-[11px] font-bold border border-[#EF4444] text-[#EF4444] bg-[#FEF2F2] rounded-lg hover:bg-red-100 transition-colors"
                              onClick={async () => { await adminAPI.archiveCourse(courseKey); await refetch(); }}
                            >
                              Archive
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {expandedCourse === courseKey && (
                    <Card className="mt-4 bg-[#fcfcff]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[12px] font-semibold text-[#1f2560]">Manage Students</p>
                        <span className="text-[10px] text-[#8d93b1]">Course ID: {courseKey}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <input
                          className="h-9 flex-1 rounded-md border border-[#d8dcee] px-3 text-[11px]"
                          placeholder="Enter learner user ID to enroll"
                          value={newLearnerIdByCourse[courseKey] || ''}
                          onChange={(e) =>
                            setNewLearnerIdByCourse((state) => ({
                              ...state,
                              [courseKey]: e.target.value,
                            }))
                          }
                        />
                        <ActionButton
                          variant="primary"
                          onClick={async () => {
                            const userId = newLearnerIdByCourse[courseKey]?.trim();
                            if (!userId) return;
                            await adminAPI.enrollUserInCourse(courseKey, userId);
                            await toggleLearners(courseKey, true);
                            await refetch();
                            setNewLearnerIdByCourse((state) => ({ ...state, [courseKey]: '' }));
                          }}
                        >
                          Add
                        </ActionButton>
                      </div>
                      <div className="mt-4 space-y-2">
                        {(learnersByCourse[courseKey] || []).map((row: any) => (
                          <div key={row.learner?.id || row.enrollment?.id} className="flex items-center justify-between rounded-md border border-[#eceff8] bg-white px-3 py-2">
                            <div>
                              <p className="text-[11px] font-medium text-[#2f356f]">{row.learner?.name || row.learner?.email}</p>
                              <p className="text-[10px] text-[#8d93b1]">{row.learner?.email}</p>
                            </div>
                            <div className="flex gap-2">
                              <ActionButton variant="secondary" onClick={() => { window.location.href = `/admin/users/${row.learner?.id}/edit`; }}>View</ActionButton>
                              <ActionButton
                                variant="danger"
                                onClick={async () => {
                                  await adminAPI.removeUserFromCourse(courseKey, row.learner?.id);
                                  await toggleLearners(courseKey, true);
                                  await refetch();
                                }}
                              >
                                Remove
                              </ActionButton>
                            </div>
                          </div>
                        ))}
                        {(learnersByCourse[courseKey] || []).length === 0 && <p className="text-sm text-[#7a80a9]">No learners enrolled.</p>}
                      </div>
                    </Card>
                  )}
                </React.Fragment>
              );
            })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
void OldAdminCoursesPage;

export function CourseCatalogPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, loading, error, refetch } = useAsyncResource(() => coursesAPI.listCourses(), []);
  const allCourses = unwrapData<any[]>(data as any) || data || [];
  const [activeFilter, setActiveFilter] = useState('All Courses');

  const rawCategories = Array.from(new Set(allCourses.filter((c: any) => c.category).map((c: any) => String(c.category))));
  const categories = ['All Courses', ...rawCategories.map(cat => {
    const count = allCourses.filter((course: any) => course.category === cat).length;
    return `${cat} (${count})`;
  })];
  
  const filteredCourses = allCourses.filter((c: any) => 
    (activeFilter === 'All Courses' || activeFilter.startsWith(String(c.category))) && String(c.status).toLowerCase() === 'published'
  );

  // Using getCourseIcon from courseVisuals utility
  const getCategoryIcon = (category: string) => getCourseIcon(category);

  async function handleEnroll(courseId: string) {
    if (!user?.id) return;
    try {
      await coursesAPI.enrollUserInCourse(courseId);
      await refetch();
    } catch (err) {
      console.error('Enrollment failed', err);
    }
  }

  // Mock identifying a "Featured" course (e.g., the first published one)
  const featured = allCourses.find((c: any) => c.status === 'published' || c.status === 'active');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-end justify-between">
        <PageHeading title="Course Catalog" subtitle="Browse all available courses and enroll." />
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[#8D93B1]">Sort:</span>
          <select className="rounded-lg border border-[#E0E4EC] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1f2560] outline-none">
            <option>Most Popular</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      <ErrorCard error={error} />

      {featured && (
        <div className="relative overflow-hidden rounded-2xl bg-[#F2F4F7] p-8 shadow-sm border border-[#E0E4EC]">
          <div className="relative z-10 flex gap-10">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-white text-4xl shadow-sm border border-[#E0E4EC] font-bold text-[#001D4C]">
              {getCategoryIcon(featured.category)}
            </div>
            <div className="flex-1 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4F5B93]">FEATURED COURSE</span>
              <h2 className="text-[28px] font-bold text-[#001D4C] tracking-tight">{featured.title}</h2>
              <p className="max-w-2xl text-sm text-[#4F5B93] leading-relaxed">
                {featured.description || 'Master professional skills with our comprehensive learning paths.'}
              </p>
              <div className="flex items-center gap-3 text-[11px] font-bold text-[#4F5B93]">
                <span>{featured.lessonCount || featured.lessons || 0} lessons</span>
                <span>•</span>
                <span>~{featured.duration || '2 hours'}</span>
                <span>•</span>
                <span>Certificate included</span>
              </div>
              <div className="pt-2">
                <button onClick={() => navigate(`/catalog/${featured.id}`)} className="flex items-center gap-2 rounded-lg bg-[#001D4C] px-8 py-2.5 text-xs font-bold text-white hover:bg-[#002d75] transition-all shadow-md">
                  ▶ Continue
                </button>
              </div>
            </div>
            <div className="hidden w-80 items-end pb-6 lg:flex">
               <div className="w-full space-y-2">
                  <div className="flex justify-end text-[11px] font-bold text-[#001D4C]">
                    <span>{Number(featured.progress || 65)}%</span>
                  </div>
                  <ProgressBar value={Number(featured.progress || 65)} />
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`rounded-lg px-5 py-2 text-[11px] font-bold transition-all ${
              activeFilter === cat ? 'bg-[#001D4C] text-white' : 'bg-[#E9EEF6] text-[#001D4C] hover:bg-blue-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-medium">Fetching catalog...</div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course: any) => {
            const progress = Number(course.progress || 0);
            const isEnrolled = !!course.enrolled;
            const isCompleted = progress >= 100;

            return (
              <div key={course.id} className="group flex flex-col overflow-hidden rounded-2xl border border-[#E0E4EC] bg-white transition-all hover:shadow-xl">
                <div className="flex h-48 items-center justify-center bg-[#F2F4F7] text-6xl group-hover:bg-[#E9EEF6] transition-colors relative cursor-pointer" onClick={() => navigate(`/catalog/${course.id}`)}>
                   <div className="bg-white p-4 rounded-lg shadow-sm border border-[#E0E4EC]">
                    {getCategoryIcon(course.category)}
                   </div>
                </div>
                <div className="flex flex-1 flex-col p-6 space-y-4">
                  <div className="flex gap-2">
                    <span className="rounded bg-[#F1F5F9] px-3 py-1 text-[10px] font-bold text-[#475569] uppercase tracking-wider">{course.category || 'Course'}</span>
                    <span className="rounded bg-[#001D4C] px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">{course.lessonCount || course.lessons || 0} lessons • {course.duration || '2 hrs'}</span>
                  </div>
                  <h4 className="text-[18px] font-bold text-[#001D4C] leading-tight group-hover:text-blue-800 transition-colors cursor-pointer" onClick={() => navigate(`/catalog/${course.id}`)}>{course.title}</h4>
                  <p className="text-[12px] font-medium text-[#8D93B1]">by {course.instructor || 'Mr. Emeka'} <span className="text-[#E0E4EC] mx-1">•</span> <span className="text-[#4F5B93]">{isEnrolled && progress > 0 ? `Last visited: ${course.lastVisited || 'Yesterday'}` : isCompleted ? `Completed: ${formatDate(course.completedAt || '2026-03-15')}` : ''}</span></p>
                  
                  <div className="mt-auto pt-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[11px] font-bold text-[#001D4C]">{isEnrolled ? (isCompleted ? 'Done' : `${progress}%`) : 'Not started'}</span>
                    </div>
                    <ProgressBar value={progress} />
                    <div className="flex items-center justify-between pt-2">
                       <span className="text-[10px] font-bold text-[#8D93B1] uppercase tracking-tight">{course.certificate_enabled || true ? 'Certificate included' : ''}</span>
                       <button 
                        onClick={() => !isEnrolled && handleEnroll(course.id)}
                        className={`rounded-lg px-6 py-2 text-[11px] font-bold transition-all shadow-sm ${
                          isCompleted ? 'bg-[#EAB308] text-white hover:bg-[#CA8A04]' : 
                          isEnrolled ? 'bg-[#001D4C] text-white hover:bg-[#002d75]' : 
                          'bg-[#F97316] text-white hover:bg-orange-600'
                        }`}>
                         {isCompleted ? 'View Certificate' : isEnrolled ? 'Resume' : '+ Enroll'}
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function InstructorCoursesPage() {
  const { data, loading, error } = useAsyncResource(() => instructorAPI.listCourses(), []);
  const [activeFilter, setActiveFilter] = useState('All');
  
  const allCourses = unwrapData<any[]>(data as any) || data || [];
  const filters = [
    { label: 'All', count: allCourses.length },
    { label: 'Active', count: allCourses.filter(c => String(c.status).toLowerCase() === 'published').length },
    { label: 'Draft', count: allCourses.filter(c => String(c.status).toLowerCase() === 'draft').length },
    { label: 'Archived', count: 0 },
  ];

  const filtered = allCourses.filter(c => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return String(c.status).toLowerCase() === 'published';
    if (activeFilter === 'Draft') return String(c.status).toLowerCase() === 'draft';
    return true;
  });

  // Using getCourseIcon from courseVisuals utility
  const getCategoryIcon = (category: string) => getCourseIcon(category);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#001D4C]">My courses</h1>
        <LinkButton to="/instructor/courses/create" variant="primary" className="bg-[#001D4C]">
          <span className="mr-2">📤</span> Create courses
        </LinkButton>
      </div>
      
      <div className="flex gap-8 border-b border-[#E0E4EC]">
        {filters.map(f => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(f.label)}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeFilter === f.label ? 'text-[#001D4C]' : 'text-[#8D93B1]'
            }`}
          >
            {f.label} ({f.count})
            {activeFilter === f.label && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#001D4C]" />}
          </button>
        ))}
      </div>

      <ErrorCard error={error} />

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course: any) => (
            <div key={course.id} className="rounded-2xl border border-[#E0E4EC] bg-white overflow-hidden shadow-sm">
              <div className="h-44 bg-[#F2F4F7] relative flex items-center justify-center text-5xl">
                 <img src={`https://picsum.photos/seed/${course.id}/400/200`} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="" />
                 <div className="bg-white p-3 rounded-lg shadow-sm z-10">{getCategoryIcon(course.category)}</div>
              </div>
              <div className="p-5 space-y-4">
                <span className="inline-block px-3 py-1 rounded bg-[#F1F5F9] text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                  {course.category || 'Course'}
                </span>
                <h3 className="text-lg font-bold text-[#001D4C]">{course.title}</h3>
                <p className="text-sm text-[#8D93B1] font-medium">
                  by {course.instructor || 'Mr. Emeka'} · {course.enrollmentCount || 0} Learners
                </p>
                <div className="flex gap-3 pt-2">
                  <button className="flex-1 py-2 rounded-lg border border-[#001D4C] text-[#001D4C] text-xs font-bold hover:bg-blue-50">
                    Edit
                  </button>
                  {String(course.status).toLowerCase() === 'draft' ? (
                    <button className="flex-1 py-2 rounded-lg bg-[#001D4C] text-white text-xs font-bold hover:bg-blue-900">
                      Publish
                    </button>
                  ) : (
                    <button className="flex-1 py-2 rounded-lg bg-[#001D4C] text-white text-xs font-bold hover:bg-blue-900">
                      Submissions
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminCoursesPage() {
  const { data, loading, error, refetch } = useAsyncResource(async () => {
    const courses = unwrapData<any[]>(await adminAPI.listCourses()) || [];
    const learnerCounts = await Promise.all(
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
      enrollmentCount: Number(Object.fromEntries(learnerCounts)[String(course.id)] || 0),
    }));
  }, []);

  const courses = Array.isArray(data) ? data : [];
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { searchQuery } = useSearchContext();

  const activeCoursesCount = courses.filter((course: any) => ['published', 'active'].includes(String(course.status).toLowerCase())).length;
  const draftCoursesCount = courses.filter((course: any) => String(course.status).toLowerCase() === 'draft').length;
  const disciplineCount = new Set(courses.filter((course: any) => course.category).map((course: any) => course.category)).size;
  const filterOptions = [
    { label: 'All', count: courses.length },
    { label: 'Active', count: activeCoursesCount },
    { label: 'Draft', count: draftCoursesCount },
    ...Array.from(new Set(courses.map((course: any) => String(course.category || '')).filter(Boolean))).map((category) => ({
      label: category,
      count: courses.filter((course: any) => String(course.category || '') === category).length,
    })),
  ];

  const filteredCourses = useMemo(() => {
    let filtered = courses.filter((course: any) => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Active') return ['published', 'active'].includes(String(course.status).toLowerCase());
      if (activeFilter === 'Draft') return String(course.status).toLowerCase() === 'draft';
      return String(course.category || '') === activeFilter;
    });

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course: any) =>
          (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [courses, activeFilter, searchQuery]);

  async function handleCreate() {
    setCreating(true);
    try {
      await instructorAPI.createCourse({ title, description, status: 'draft', category: 'General', catalogVisibility: 'public', assignments: [] });
      setTitle('');
      setDescription('');
      setShowCreate(false);
      await refetch();
    } catch (err) {
      console.error('Create course failed', err);
    } finally {
      setCreating(false);
    }
  }

  // Using getCourseIcon from courseVisuals utility
  function getCategoryIcon(category: string) {
    return getCourseIcon(category);
  }

  return (
    <div className="space-y-5">
      <PageHeading
        title="Course Management"
        subtitle={`${activeCoursesCount} active courses across ${disciplineCount} disciplines`}
        action={<ActionButton variant="primary" onClick={() => setShowCreate((value) => !value)}>+ Add Course</ActionButton>}
      />
      <ErrorCard error={error} />

      <div className="mb-6 flex flex-wrap gap-3">
        {filterOptions.map((option) => (
          <button
            key={option.label}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
              activeFilter === option.label ? 'bg-[#001D4C] text-white' : 'bg-[#E9EEF6] text-[#001D4C] hover:bg-blue-100'
            }`}
            onClick={() => setActiveFilter(option.label)}
            type="button"
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {showCreate && (
        <Card className="space-y-3">
          <input className="h-10 w-full rounded-md border border-[#d8dcee] px-3 text-[11px]" placeholder="Course title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="min-h-[80px] w-full rounded-md border border-[#d8dcee] px-3 py-2 text-[11px]" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2">
            <ActionButton loading={creating} variant="primary" onClick={handleCreate}>Create Course</ActionButton>
            <ActionButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</ActionButton>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading Course Catalog...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E0E4EC] bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="border-b border-[#E0E4EC] bg-[#F8FAFC]">
              <tr>
                <th className="w-[55%] px-8 py-5 text-[12px] font-bold uppercase tracking-wider text-[#4E5566]">Course</th>
                <th className="px-6 py-5 text-center text-[12px] font-bold uppercase tracking-wider text-[#4E5566]">Enrolled</th>
                <th className="px-6 py-5 text-center text-[12px] font-bold uppercase tracking-wider text-[#4E5566]">Status</th>
                <th className="px-6 py-5 text-center text-[12px] font-bold uppercase tracking-wider text-[#4E5566]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
              {filteredCourses.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400">{searchQuery ? "No courses match your search." : "No courses found matching your criteria."}</td></tr>
              ) : filteredCourses.map((course: any) => {
                const courseKey = String(course.course_id || course.id);
                const enrolledCount = Number(course.enrollmentCount || 0);
                const progressValue = String(course.status).toLowerCase() === 'draft' ? 0 : Math.min(100, 40 + enrolledCount * 5);
                const instructorName = [course.instructorFirstName, course.instructorLastName].filter(Boolean).join(' ') || course.instructor?.name || course.instructor || 'Not assigned';

                return (
                  <tr className="transition-colors hover:bg-[#F9FAFB]" key={courseKey}>
                    <td className="px-8 py-7">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#E0E4EC] bg-white text-2xl shadow-sm">
                          {getCategoryIcon(course.category || '')}
                        </div>
                        <div className="min-w-0">
                          <h3 className="mb-1 text-[15px] font-bold text-[#001D4C]">{course.title}</h3>
                          <p className="text-sm font-medium text-[#4F5B93]">
                            {course.lessonCount || course.lessons || 0} lessons. ~{course.duration || '2 hrs'}
                          </p>
                          <div className="mt-3 text-[11px] font-bold uppercase tracking-tight text-[#8D93B1]">
                            Instructor : <span className="text-[#001D4C]"> :{instructorName}</span>
                          </div>
                          <div className="mt-3 flex w-[320px] items-center gap-4">
                            <span className="whitespace-nowrap text-[10px] font-bold uppercase text-[#8D93B1]">Avg Progress</span>
                            {String(course.status).toLowerCase() === 'draft' ? (
                              <span className="text-xs italic text-[#8D93B1]"> :Not Published</span>
                            ) : (
                              <>
                                <div className="h-2 w-full rounded-full bg-[#E0E4EC]">
                                  <div className={`h-2 rounded-full ${progressValue > 70 ? 'bg-[#166534]' : 'bg-[#F97316]'}`} style={{ width: `${progressValue}%` }} />
                                </div>
                                <span className="w-10 text-[11px] font-bold text-[#001D4C]">{progressValue}%</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center text-[22px] font-bold text-[#001D4C]">
                      {String(course.status).toLowerCase() === 'draft' ? <span className="text-[#4F5B93]">-</span> : enrolledCount}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`rounded-lg border px-5 py-1.5 text-xs font-bold ${
                        ['published', 'active'].includes(String(course.status).toLowerCase())
                          ? 'border-[#C3E6CB] bg-[#E6F4EA] text-[#1E7E34]'
                          : 'border-[#DCFCE7] bg-[#F0FDF4] text-[#22C55E]'
                      }`}>
                        {['published', 'active'].includes(String(course.status).toLowerCase()) ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-3">
                        {String(course.status).toLowerCase() === 'draft' ? (
                          <>
                            <button
                              className="rounded-lg border border-[#001D4C] px-6 py-1.5 text-[11px] font-bold text-[#001D4C] transition-colors hover:bg-blue-50"
                              onClick={async () => { await adminAPI.approveCourse(courseKey); await refetch(); }}
                              type="button"
                            >
                              Publish
                            </button>
                            <button className="rounded-lg border border-[#EF4444] bg-[#FEF2F2] px-6 py-1.5 text-[11px] font-bold text-[#EF4444]" onClick={async () => { await adminAPI.rejectCourse(courseKey, 'Admin review'); await refetch(); }} type="button">
                              Keep Draft
                            </button>
                          </>
                        ) : (
                          <>
                            <LinkButton className="px-6 py-1.5" to={`/catalog/${courseKey}`} variant="secondary">Open</LinkButton>
                            <button
                              className="rounded-lg border border-[#EF4444] bg-[#FEF2F2] px-6 py-1.5 text-[11px] font-bold text-[#EF4444] transition-colors hover:bg-red-100"
                              onClick={async () => { await adminAPI.archiveCourse(courseKey); await refetch(); }}
                              type="button"
                            >
                              Archive
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function CourseDetailsPage() {
  const { id } = useParams();
  const { data: course, loading, error } = useAsyncResource(() => coursesAPI.getCourseDetail(id), null);

  if (loading) return <div className="py-20 text-center text-gray-400">Loading details...</div>;
  if (!course) return <ErrorCard error={error || "Course not found"} />;

  const progress = Number(course.progress || 65);
  const modules = course.modules || [
    { title: "Intro to UI/UX Design", duration: "08:14", status: "Done" },
    { title: "Design Thinking Process", duration: "11:40", status: "Done" },
    { title: "User Flows", duration: "14:32", status: "In Progress" },
    { title: "Wireframing", duration: "18:00", status: "Locked" },
    { title: "Prototyping in Figma", duration: "16:55", status: "Locked" },
    { title: "Usability Testing", duration: "12:30", status: "Locked" },
  ];

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-2 text-[11px] font-bold text-[#8D93B1] uppercase tracking-wider">
        <Link to="/catalog" className="hover:text-[#001D4C]">Course Catalog</Link>
        <ChevronRight size={14} />
        <span className="text-[#001D4C]">{course.title}</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[#E0E4EC] bg-white">
        <div className="h-64 bg-[#F2F4F7] flex items-center justify-center text-8xl">
          <span className="absolute top-6 left-6 rounded bg-[#4F5B93] px-3 py-1 text-[10px] font-bold text-white uppercase">{course.category}</span>
          🏢
        </div>
        <div className="p-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-[#001D4C] tracking-tight">{course.title}</h1>
            <p className="text-sm text-[#4F5B93] leading-relaxed max-w-3xl">{course.description || "Master the foundations of UI/UX design — from user research and wireframing to high-fi prototyping. This course covers everything you need to confidently design digital products."}</p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-[#E0E4EC] p-4 max-w-sm">
            <div className="h-10 w-10 bg-[#001D4C] text-white flex items-center justify-center rounded-lg font-bold text-xs">ME</div>
            <div>
              <p className="text-[13px] font-bold text-[#001D4C]">{course.instructor || "Mr. Emeka"}</p>
              <p className="text-[11px] text-[#8D93B1] font-medium">Instructor · UI/UX Lead</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[15px] font-bold text-[#001D4C]">What you'll learn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["User research methods and personas", "Wireframing and prototyping in Figma", "Design systems and components", "Usability testing and iteration"].map(item => (
                <div key={item} className="flex items-center gap-3 text-[13px] text-[#4F5B93] font-medium">
                  <CheckCircle2 size={18} className="text-[#166534]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-[15px] font-bold text-[#001D4C]">Syllabus</h3>
            <div className="rounded-xl border border-[#E0E4EC] overflow-hidden">
              {modules.map((m: any, idx: number) => (
                <div key={idx} className={`flex items-center justify-between px-6 py-4 border-b border-[#E0E4EC] last:border-0 ${m.status === 'In Progress' ? 'bg-[#F2F4F7]' : 'bg-white'}`}>
                  <div className="flex items-center gap-6">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E0E4EC] text-[12px] font-bold text-[#001D4C]">{idx + 1}</span>
                    <p className="text-[14px] font-bold text-[#001D4C]">{m.title}</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-[13px] font-medium text-[#4F5B93]">{m.duration}</span>
                    <span className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      m.status === 'Done' ? 'bg-[#F97316] text-white' : 
                      m.status === 'In Progress' ? 'bg-[#001D4C] text-white' : 
                      'bg-[#F2F4F7] text-[#8D93B1]'
                    }`}>
                      {m.status} {m.status === 'Locked' && <Lock size={10} className="inline ml-1 mb-0.5" />}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-[#E0E4EC] flex flex-col items-center gap-6">
            <div className="w-full max-w-md space-y-2 text-center">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-bold text-[#8D93B1]">Lesson 3 of 8 lessons completed</span>
                <span className="text-[14px] font-bold text-[#001D4C]">{progress}% Complete</span>
              </div>
              <ProgressBar value={progress} />
            </div>

            <div className="flex flex-col gap-3 w-full max-w-md">
              <button className="rounded-lg bg-[#001D4C] py-3 font-bold text-white shadow-lg hover:bg-blue-900 transition-all flex items-center justify-center gap-2">
                <Play size={16} fill="currentColor" /> Continue Learning
              </button>
              <button disabled={progress < 100} className="rounded-lg border border-[#EAB308] bg-[#EAB308]/10 py-3 font-bold text-[#CA8A04] disabled:opacity-50 disabled:border-[#E0E4EC] disabled:text-[#8D93B1] transition-all">
                View Certificate (after 100%)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminNotificationsPage() {
  const { data, loading, error } = useAsyncResource(() => adminAPI.listNotifications(), []);
  const items = unwrapData<any[]>(data as any) || data || [];
  return <div className="space-y-5"><PageHeading title="Notifications" subtitle="Live system notifications" /><ErrorCard error={error} />{loading ? <EmptyCard text="Loading notifications..." /> : <Card className="space-y-2">{items.map((item: any) => <div className="rounded-md border border-[#eceff8] p-3" key={item.id}><p className="text-[15px] font-semibold text-[#1f2560]">{item.title}</p><p className="mt-1 text-[11px] text-[#66709c]">{item.message}</p><p className="mt-1 text-[10px] text-[#8d93b1]">{formatDate(item.createdAt)}</p></div>)}</Card>}</div>;
}

export function AdminNotificationDetailsPage() { return <AdminNotificationsPage />; }

export function AdminTeamAllocationPage() {
  return <TeamAllocationPage />;
}

// Re-export for direct import
export { TeamAllocationPage } from './TeamAllocationPage';

export function AdminCreateTeamPage() {
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [saving, setSaving] = useState(false); const navigate = useNavigate();
  return <div className="max-w-[760px] space-y-5"><PageHeading title="Create Team" /><Card className="space-y-3"><input className="h-10 rounded-md border border-[#d8dcee] px-3 text-[11px]" value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" /><textarea className="min-h-[100px] rounded-md border border-[#d8dcee] px-3 py-2 text-[11px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Team description" /><ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await teamsAPI.createTeam({ name, description }); navigate('/admin/team-allocation'); } finally { setSaving(false); } }}>Create Team</ActionButton></Card></div>;
}

export function AdminEditTeamPage() {
  const { id } = useParams(); const { data, loading } = useAsyncResource(() => teamsAPI.getTeamDetail(id), null); const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { setName(data?.name || ''); setDescription(data?.description || ''); }, [data]);
  return <div className="max-w-[760px] space-y-5"><PageHeading title="Edit Team" />{loading || !data ? <EmptyCard text="Loading team..." /> : <Card className="space-y-3"><input className="h-10 rounded-md border border-[#d8dcee] px-3 text-[11px]" value={name} onChange={(e) => setName(e.target.value)} /><textarea className="min-h-[100px] rounded-md border border-[#d8dcee] px-3 py-2 text-[11px]" value={description} onChange={(e) => setDescription(e.target.value)} /><ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await teamsAPI.updateTeam(id, { name, description }); } finally { setSaving(false); } }}>Save Team</ActionButton></Card>}</div>;
}

export function AdminAssignLearnerPage() { return <AdminTeamAllocationPage />; }

export function AdminAnalyticsPage() {
  const { data: platformData, loading, error } = useAsyncResource(
    () => analyticsAPI.getPlatformMetrics(),
    null
  );

  const metrics = platformData || {};

  // Sample data for engagement chart (Daily Active Learners)
  const engagementData = [
    { day: 'Mon', value: 120 },
    { day: 'Tue', value: 140 },
    { day: 'Wed', value: 100 },
    { day: 'Thu', value: 160 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 110 },
    { day: 'Sun', value: 130 },
  ];

  // Sample data for progress by discipline
  const disciplineProgress = [
    { discipline: 'UI/UX Design', progress: 65 },
    { discipline: 'Frontend Dev', progress: 45 },
    { discipline: 'Social Media', progress: 75 },
    { discipline: 'Backend Dev', progress: 90 },
  ];

  // Sample top performers
  const topPerformers = [
    { name: 'Ngozi Eze', discipline: 'Product Mgmt', avgScore: '92/100', progress: 90, certificates: 2 },
    { name: 'Ada Okonkwo', discipline: 'UI/UX', avgScore: '88/100', progress: 80, certificates: 1 },
    { name: 'Funke Coker', discipline: 'UI/UX', avgScore: '85/100', progress: 85, certificates: 1 },
  ];

  const maxEngagementValue = Math.max(...engagementData.map((d) => d.value), 100);

  return (
    <div className="space-y-6">
      <PageHeading title="Platform Analytics" subtitle={`Phase 2 Cohort — March 17 to April 10, 2026`} />
      <ErrorCard error={error} />

      {loading ? (
        <EmptyCard text="Loading analytics..." />
      ) : (
        <>
          {/* Top Metrics */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Learnings" value={String(metrics.totalLearnings || 30)} />
            <StatCard title="Submissions This Week" value={String(metrics.submissionsThisWeek || 31)} />
            <StatCard title="Platform Avg Progress" value={`${metrics.avgProgress || 68}%`} tone="blue" />
            <StatCard title="Certificates Issued" value={String(metrics.certificatesIssued || 14)} />
          </div>

          {/* Engagement Chart */}
          <Card>
            <h2 className="mb-4 text-[13px] font-semibold text-[#1d245d]">Engagement — Daily Active Learners</h2>
            <div className="flex items-end justify-center gap-2 h-48">
              {engagementData.map((data) => (
                <div
                  key={data.day}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div
                    className="w-full bg-[#0c1248] rounded-sm transition-all hover:bg-[#FF7A18]"
                    style={{
                      height: `${(data.value / maxEngagementValue) * 160}px`,
                    }}
                    title={`${data.day}: ${data.value} learners`}
                  />
                  <span className="text-[10px] text-[#8d93b1]">{data.day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Progress by Discipline */}
          <Card>
            <h2 className="mb-4 text-[13px] font-semibold text-[#1d245d]">Progress by Discipline</h2>
            <div className="space-y-4">
              {disciplineProgress.map((item) => (
                <div key={item.discipline} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#2f356f]">{item.discipline}</span>
                    <span className="text-[11px] font-semibold text-[#08107b]">{item.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#e1e4f2] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00d084] rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Performers Table */}
          <Card>
            <h2 className="mb-4 text-[13px] font-semibold text-[#1d245d]">Top Performers — This Week</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-[#eceff8]">
                    <th className="text-left py-2 px-2 text-[#2f356f] font-semibold">Learner</th>
                    <th className="text-left py-2 px-2 text-[#2f356f] font-semibold">Discipline</th>
                    <th className="text-center py-2 px-2 text-[#2f356f] font-semibold">Avg Score</th>
                    <th className="text-center py-2 px-2 text-[#2f356f] font-semibold">Progress</th>
                    <th className="text-center py-2 px-2 text-[#2f356f] font-semibold">Certificates</th>
                  </tr>
                </thead>
                <tbody>
                  {topPerformers.map((performer) => (
                    <tr key={performer.name} className="border-b border-[#eceff8] hover:bg-[#f8f9fc]">
                      <td className="py-2 px-2 text-[#2f356f] font-medium">{performer.name}</td>
                      <td className="py-2 px-2 text-[#8d93b1]">{performer.discipline}</td>
                      <td className="py-2 px-2 text-center text-[#0c1248] font-semibold">{performer.avgScore}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 h-1.5 bg-[#e1e4f2] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#00d084]"
                              style={{ width: `${performer.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#8d93b1]">{performer.progress}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center text-[#08107b] font-semibold">{performer.certificates}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export function AdminAnnouncementsPage() {
  const { data, loading, error } = useAsyncResource(() => announcementsAPI.listAnnouncements(), []);
  return <div className="max-w-[860px] space-y-5"><PageHeading title="Announcements" action={<LinkButton to="/admin/announcements/new" variant="secondary">+ Add Announcement</LinkButton>} /><ErrorCard error={error} />{loading ? <EmptyCard text="Loading announcements..." /> : <div className="space-y-2">{(data || []).map((row: any) => <Card key={row.id}><p className="text-[12px] font-semibold text-[#2f356f]">{row.title}</p><p className="mt-1 text-[11px] text-[#646b95]">{row.content}</p><p className="mt-1 text-[10px] text-[#a0a6c4]">{formatDate(row.createdAt)}</p></Card>)}</div>}</div>;
}

export function AdminAddAnnouncementPage() {
  return <AdminAnnouncementForm />;
}

export function AdminProfilePage() {
  const { user } = useAuthStore();
  return <div className="max-w-[860px] space-y-5"><PageHeading title="Admin Profile" /><Card className="space-y-4"><div className="flex items-center gap-4"><CircleAvatar initials={`${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'D'}`.toUpperCase()} tone="primary" /><div><p className="text-[14px] font-semibold text-[#2f356f]">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p><p className="text-[11px] text-[#8f94b2]">{user?.email}</p></div></div><p className="text-[11px] text-[#2f356f]">{user?.bio || 'Admin profile information is now live from the authenticated account.'}</p></Card></div>;
}

export function AdminSettingsPage() {
  const { data: settings, loading } = useAsyncResource(() => adminAPI.getSystemSettings(), {} as any); const [form, setForm] = useState<any>({}); const [saving, setSaving] = useState(false);
  useEffect(() => setForm(settings?.settings || settings || {}), [settings]);
  return <div className="max-w-[860px] space-y-6"><PageHeading title="Platform Settings" subtitle="Configure the live platform" />{loading ? <EmptyCard text="Loading settings..." /> : <Card className="space-y-3"><input className="h-10 w-full rounded-md border border-[#d8dcee] px-3 text-[11px]" placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /><label className="flex items-center justify-between rounded-md border border-[#e1e4f2] px-4 py-3"><span className="text-[12px] font-medium text-[#1d245d]">Maintenance mode</span><input checked={Boolean(form.maintenanceMode)} onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })} type="checkbox" className="h-5 w-5 accent-[#08107b]" /></label><ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await adminAPI.updateSystemSettings(form); } finally { setSaving(false); } }}>Save Settings</ActionButton></Card>}</div>;
}

export function AdminChangeEmailPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [saving, setSaving] = useState(false);
  return <div className="max-w-[600px] space-y-5"><PageHeading title="Change Email Address" /><Card className="space-y-4"><input className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter new email" type="email" /><input className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your current password" type="password" /><ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await accountAPI.changeEmail(email, password); } finally { setSaving(false); } }}>Save New Email</ActionButton></Card></div>;
}

export function AdminChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [saving, setSaving] = useState(false);
  return <div className="max-w-[600px] space-y-5"><PageHeading title="Change Password" /><Card className="space-y-4"><input className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter your current password" type="password" /><input className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter a new password" type="password" /><ActionButton loading={saving} variant="primary" onClick={async () => { setSaving(true); try { await accountAPI.changePassword(currentPassword, newPassword); } finally { setSaving(false); } }}>Save New Password</ActionButton></Card></div>;
}
