import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { coursesAPI, learnerAPI } from '@/shared/api/client';
import { formatDate, useAsyncResource } from '@/shared/api/live';
import { useAuthStore } from '@/shared/state/auth';

function formatDuration(hours?: number | null) {
  if (!hours) return 'Self-paced';
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
}

export const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [starting, setStarting] = useState(false);
  const { data: course, loading, error } = useAsyncResource(() => coursesAPI.getCourseDetail(id), null);

  const learnerRole = String(user?.role || '').toLowerCase() === 'learner';

  async function handleStart() {
    if (!course) return;

    if (!isAuthenticated || !learnerRole) {
      navigate('/login');
      return;
    }

    setStarting(true);
    try {
      if (!course.progress) {
        await learnerAPI.enrollCourse(course.id);
      }

      navigate(`/learner/courses/${course.id}/learn`);
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-sm text-gray-500">Loading course...</div>;
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-2xl font-bold text-[#001D4C]">Course not found</h2>
        <p className="mt-2 text-gray-600">{error || "The course you requested doesn't exist."}</p>
      </div>
    );
  }

  return (
    <div className="bg-[linear-gradient(180deg,#fffaf5_0%,#f8f5ff_42%,#ffffff_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-[#e9d8c4] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.3),_transparent_30%),linear-gradient(135deg,#081057_0%,#22308d_52%,#f08a2c_145%)] p-8 text-white shadow-[0_24px_80px_rgba(8,16,87,0.16)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd3aa]">{course.discipline || course.category || 'Course'}</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">{course.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#eef1ff]">{course.tagline || course.description}</p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold">
                <span className="rounded-full bg-white/14 px-4 py-2">{course.lessonCount || 0} lessons</span>
                <span className="rounded-full bg-white/14 px-4 py-2">{course.assignmentCount || 0} assignments</span>
                <span className="rounded-full bg-white/14 px-4 py-2">{formatDuration(course.duration)}</span>
                <span className="rounded-full bg-white/14 px-4 py-2">Certificate enabled</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  className="rounded-xl bg-[#F08A2C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e17a1a] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={starting}
                  onClick={handleStart}
                >
                  {starting
                    ? 'Opening course...'
                    : course.progress
                      ? 'Continue Course'
                      : isAuthenticated && learnerRole
                        ? 'Enroll & Start Course'
                        : 'Login to Start'}
                </button>
                <button
                  className="rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white/95 transition hover:bg-white/10"
                  onClick={() => navigate('/catalog')}
                >
                  Back to Catalog
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-[#ebe0d2] bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8f88aa]">Instructor</p>
                <p className="mt-2 text-lg font-semibold text-[#001D4C]">
                  {course.instructors?.[0]?.name || 'TalentFlow Instructor'}
                </p>
              </div>
              <div className="rounded-3xl border border-[#ebe0d2] bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8f88aa]">Learners Enrolled</p>
                <p className="mt-2 text-lg font-semibold text-[#001D4C]">{course.enrollmentCount || 0}</p>
              </div>
              <div className="rounded-3xl border border-[#ebe0d2] bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8f88aa]">Completion Rule</p>
                <p className="mt-2 text-sm font-medium leading-6 text-[#4F5B93]">
                  Complete all lessons and assignments before certification.
                </p>
              </div>
            </div>

            <section className="rounded-[28px] border border-[#ebe0d2] bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-[#001D4C]">Course Outline</h2>
              <p className="mt-2 text-sm leading-7 text-[#5f6796]">{course.description}</p>
              <div className="mt-6 space-y-4">
                {(course.modules || []).map((module: any, moduleIndex: number) => (
                  <div key={module.id} className="rounded-3xl border border-[#efe5d8] bg-[#fffaf5] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f08a2c]">
                          Section {moduleIndex + 1}
                        </p>
                        <h3 className="mt-2 text-xl font-bold text-[#001D4C]">{module.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-[#5f6796]">{module.description}</p>
                      </div>
                      <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-[11px] font-semibold text-[#2f356f]">
                        {module.lessons?.length || 0} lessons
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {(module.lessons || []).map((lesson: any, lessonIndex: number) => (
                        <div key={lesson.id} className="rounded-2xl border border-[#eadfd2] bg-white px-4 py-3">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-[#001D4C]">
                                {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                              </p>
                              <p className="mt-1 text-xs leading-6 text-[#6b739d]">{lesson.content}</p>
                            </div>
                            <span className="whitespace-nowrap text-[11px] font-semibold text-[#f08a2c]">
                              {lesson.durationMinutes || 0} mins
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-[#ebe0d2] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Branches</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(course.branches || []).map((branch: string) => (
                  <span key={branch} className="rounded-full border border-[#dbe0f2] bg-[#f6f8ff] px-3 py-2 text-xs font-semibold text-[#2f356f]">
                    {branch}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#ebe0d2] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Core Sections</p>
              <div className="mt-4 space-y-3">
                {(course.coreSections || []).map((section: string, index: number) => (
                  <div key={section} className="flex gap-3 rounded-2xl bg-[#fff8ef] px-4 py-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f08a2c] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium text-[#001D4C]">{section}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#ebe0d2] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Recommended Reading</p>
              <div className="mt-4 space-y-4">
                {(course.recommendedBooks || []).map((book: any) => (
                  <div key={book.title} className="rounded-2xl border border-[#f0e7da] bg-[#fcfaf7] p-4">
                    <p className="text-sm font-semibold text-[#001D4C]">{book.title}</p>
                    <p className="mt-1 text-xs font-medium text-[#f08a2c]">{book.author}</p>
                    <p className="mt-2 text-xs leading-6 text-[#5f6796]">{book.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#ebe0d2] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Learning Focus</p>
              <p className="mt-3 text-sm leading-7 text-[#5f6796]">{course.learningFocus}</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">What You Will Study</p>
              <ul className="mt-3 space-y-2">
                {(course.keyTopics || []).map((topic: string) => (
                  <li key={topic} className="rounded-2xl bg-[#f6f8ff] px-4 py-3 text-sm text-[#2f356f]">
                    {topic}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[28px] border border-[#ebe0d2] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f88aa]">Course Snapshot</p>
              <div className="mt-4 space-y-3 text-sm text-[#4F5B93]">
                <p>Published: {formatDate(course.createdAt)}</p>
                <p>Estimated guided reading: {course.estimatedReadingHours || 0} hours</p>
                <p>{course.completionRequirement}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
