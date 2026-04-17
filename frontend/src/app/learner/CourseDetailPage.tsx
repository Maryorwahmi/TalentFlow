import { useParams, useNavigate } from 'react-router-dom';
import { Star, Users, Clock, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { coursesAPI, learnerAPI } from '@/shared/api/client';
import { useAsyncResource, unwrapData } from '@/shared/api/live';
import { getCourseVisual } from '@/shared/utils/courseVisuals';
import { ActionButton, Card } from '@/shared/ui/talentFlow';

export function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  const { data: course } = useAsyncResource(
    async () => {
      if (!courseId) return null;
      const response = await coursesAPI.getCourseDetail(courseId);
      return unwrapData(response);
    },
    null
  );

  const { data: modules } = useAsyncResource(
    async () => {
      if (!courseId) return [];
      const response = await coursesAPI.getModules(courseId);
      return unwrapData<any[]>(response) || [];
    },
    []
  );

  const { data: reviews } = useAsyncResource(
    async () => {
      if (!courseId) return [];
      const response = await coursesAPI.getCourseReviews(courseId);
      return unwrapData<any[]>(response) || [];
    },
    []
  );

  const handleEnroll = async () => {
    if (!courseId) return;
    try {
      setEnrolling(true);
      await learnerAPI.enrollCourse(courseId);
      navigate(`/learner/courses/${courseId}/learn`);
    } catch (error) {
      console.error('Enroll failed:', error);
    } finally {
      setEnrolling(false);
    }
  };

  if (!course) {
    return <div className="text-center py-20">Loading course details...</div>;
  }

  const visual = getCourseVisual(course.category);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
          reviews.length).toFixed(1)
      : 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className={`${visual.bgColor} rounded-2xl p-8 md:p-12`}>
        <div className="grid gap-8 md:grid-cols-[1fr_300px] items-start">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#4f5b93] mb-2">
                {course.category}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-[#001d4c] mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-[#4f5b93] leading-relaxed max-w-2xl">
                {course.description}
              </p>
            </div>

            {/* Course Meta */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4f5b93]" />
                <div>
                  <p className="text-xs text-[#7a80a9] font-semibold">STUDENTS</p>
                  <p className="text-lg font-bold text-[#001d4c]">2,340+</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#4f5b93]" />
                <div>
                  <p className="text-xs text-[#7a80a9] font-semibold">DURATION</p>
                  <p className="text-lg font-bold text-[#001d4c]">{course.duration}h</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#4f5b93]" />
                <div>
                  <p className="text-xs text-[#7a80a9] font-semibold">LEVEL</p>
                  <p className="text-lg font-bold text-[#001d4c] capitalize">
                    {course.level}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3 pt-4 border-t border-[rgba(0,29,76,0.1)]">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl">
                👨‍🏫
              </div>
              <div>
                <p className="text-xs text-[#7a80a9] font-semibold">INSTRUCTOR</p>
                <p className="text-sm font-bold text-[#001d4c]">
                  {course.instructorName || 'TalentFlow Instructor'}
                </p>
              </div>
            </div>
          </div>

          {/* Icon & Enroll Box */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-2xl bg-white shadow-lg flex items-center justify-center text-6xl">
                {visual.icon}
              </div>
            </div>
            <ActionButton
              onClick={handleEnroll}
              variant="primary"
              loading={enrolling}
              className="w-full py-3"
            >
              Enroll Now
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* What You'll Learn */}
          <Card>
            <h2 className="text-2xl font-bold text-[#001d4c] mb-4">What You'll Learn</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {[
                'Understand core concepts and best practices',
                'Build real-world projects from scratch',
                'Master advanced techniques and tools',
                'Prepare for professional roles',
                'Collaborate in team environments',
                'Get certified upon completion',
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#4f5b93]">
                  <span className="text-lg">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Curriculum */}
          <Card>
            <h2 className="text-2xl font-bold text-[#001d4c] mb-4">Curriculum</h2>
            <div className="space-y-3">
              {modules.map((module: any) => (
                <div
                  key={module.id}
                  className="border border-[#e0e4ec] rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedModuleId(
                        expandedModuleId === module.id ? null : module.id
                      )
                    }
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f9fafb] transition"
                  >
                    <div className="text-left">
                      <p className="font-bold text-[#001d4c]">{module.title}</p>
                      <p className="text-xs text-[#7a80a9]">{module.description}</p>
                    </div>
                    {expandedModuleId === module.id ? (
                      <ChevronUp className="w-5 h-5 text-[#4f5b93]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#4f5b93]" />
                    )}
                  </button>

                  {expandedModuleId === module.id && (
                    <div className="bg-[#f9fafb] px-4 py-3 border-t border-[#e0e4ec] space-y-2">
                      {/* Lessons would be displayed here */}
                      <p className="text-sm text-[#7a80a9]">
                        {module.lessons || 3} lessons • {module.duration || 5} hours
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Reviews */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#001d4c]">Student Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(Number(avgRating))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-[#d8dcee]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-[#001d4c]">{avgRating}</span>
                <span className="text-sm text-[#7a80a9]">({reviews.length})</span>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="pb-4 border-b border-[#e0e4ec] last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-[#001d4c]">{review.title}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-[#d8dcee]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#6a7199] leading-relaxed">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="space-y-4 sticky top-6">
            <div>
              <p className="text-xs font-bold text-[#7a80a9] uppercase tracking-wide mb-1">
                COURSE INFO
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#7a80a9]">Status:</span>
                  <span className="font-bold text-green-600 capitalize">
                    {course.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a80a9]">Level:</span>
                  <span className="font-bold text-[#001d4c] capitalize">
                    {course.level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a80a9]">Duration:</span>
                  <span className="font-bold text-[#001d4c]">{course.duration}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a80a9]">Certificate:</span>
                  <span className="font-bold text-[#001d4c]">
                    {course.certificateEnabled ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>
            </div>
            <ActionButton
              onClick={handleEnroll}
              variant="primary"
              loading={enrolling}
              className="w-full"
            >
              Enroll Now
            </ActionButton>
          </Card>
        </div>
      </div>
    </div>
  );
}
