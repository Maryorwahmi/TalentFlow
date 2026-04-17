import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen, Video, Zap, CheckCircle, Clock, Users, Menu, X, Play } from 'lucide-react';
import { useAsyncResource, unwrapData } from '@/shared/api/live';
import { coursesAPI, learnerAPI } from '@/shared/api/client';
import { Card, ActionButton } from '@/shared/ui/talentFlow';

interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string;
  orderIndex: number;
}

interface Lesson {
  id: number;
  courseId: number;
  moduleId: number;
  title: string;
  content: string;
  contentType: 'text' | 'video' | 'quiz';
  videoUrl?: string;
  durationMinutes: number;
  orderIndex: number;
  isPreview?: boolean;
}

interface Quiz {
  id: number;
  courseId: number;
  moduleId: number;
  title: string;
  description: string;
  totalQuestions: number;
  passingScore: number;
  timeLimit: number;
}

interface QuizQuestion {
  id: number;
  quizId: number;
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  correctAnswer: string;
  explanation: string;
  orderIndex: number;
}

interface QuizAttemptResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
}

export function CourseStudyArea() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [quizState, setQuizState] = useState<'idle' | 'taking' | 'completed'>('idle');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<QuizAttemptResult | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [activeResourceTab, setActiveResourceTab] = useState<'notes' | 'slides' | 'reading' | 'code'>('notes');

  const { data: course } = useAsyncResource(
    () => (courseId ? coursesAPI.getCourseDetail(courseId).then(unwrapData) : Promise.resolve(null)),
    null
  );

  const { data: modules, loading: modulesLoading, error: modulesError } = useAsyncResource(
    () => (courseId ? coursesAPI.getModules(courseId).then((response: any) => unwrapData<Module[]>(response) || []) : Promise.resolve([])),
    []
  );

  const { data: lessons, loading: lessonsLoading, error: lessonsError } = useAsyncResource(
    () => (courseId ? coursesAPI.getLessons(courseId).then((response: any) => {
      console.log('Lessons loaded:', response);
      return unwrapData<Lesson[]>(response) || [];
    }) : Promise.resolve([])),
    []
  );

  // Set first lesson as default
  useEffect(() => {
    if (lessons.length > 0 && !currentLessonId) {
      console.log('Setting first lesson:', lessons[0]);
      setCurrentLessonId(lessons[0].id);
      setExpandedModuleId(lessons[0].moduleId);
    }
  }, [lessons, currentLessonId]);

  const currentLesson = lessons.find((lesson: Lesson) => lesson.id === currentLessonId);
  const currentModuleId = currentLesson?.moduleId;
  const currentModuleLessons = lessons.filter((lesson: Lesson) => lesson.moduleId === currentModuleId);
  const currentLessonIndex = currentModuleLessons.findIndex((lesson: Lesson) => lesson.id === currentLessonId);

  const nextLesson =
    currentLessonIndex < currentModuleLessons.length - 1
      ? currentModuleLessons[currentLessonIndex + 1]
      : null;

  const previousLesson = currentLessonIndex > 0 ? currentModuleLessons[currentLessonIndex - 1] : null;

  const handleLessonComplete = () => {
    if (currentLessonId) {
      const newCompleted = new Set(completedLessons);
      newCompleted.add(currentLessonId);
      setCompletedLessons(newCompleted);
      learnerAPI.updateLessonProgress(currentLessonId, true).catch(() => {});
    }
  };

  const handleStartQuiz = async (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setQuizState('taking');
    setQuizAnswers({});
    
    // Fetch quiz questions
    try {
      await coursesAPI.getQuizzes(courseId!);
      const questionsResponse = await fetch(`http://localhost:3000/api/v1/quizzes/${quiz.id}/questions`);
      const data = await questionsResponse.json();
      const questions = data.data?.questions || [];
      setQuizQuestions(questions);
    } catch (error) {
      console.error('Error loading quiz questions:', error);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    try {
      const response = await coursesAPI.submitQuizAttempt(currentQuiz.id, quizAnswers);
      const result = response?.data?.result;
      if (result) {
        setQuizResult(result);
        setQuizState('completed');
        if (result.passed) {
          handleLessonComplete();
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const progressPercent = Math.round((completedLessons.size / Math.max(lessons.length, 1)) * 100);

  // Show loading state
  if (lessonsLoading || modulesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9fafb]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#001d4c] mb-4"></div>
          <p className="text-[#7a80a9] font-semibold">Loading lesson content...</p>
          <p className="text-xs text-[#7a80a9] mt-1">Course ID: {courseId}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (lessonsError || modulesError) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9fafb]">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error loading lesson</p>
          <p className="text-[#7a80a9] text-sm mb-4">{lessonsError || modulesError || 'Unknown error'}</p>
          <ActionButton onClick={() => window.location.reload()} variant="primary">Retry</ActionButton>
        </div>
      </div>
    );
  }

  // Show empty state if no lessons
  if (!lessonsLoading && lessons.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9fafb]">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-[#7a80a9] mx-auto mb-4 opacity-50" />
          <p className="text-[#7a80a9] font-semibold">No lessons available</p>
          <p className="text-xs text-[#7a80a9] mt-1">This course doesn't have any lessons yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      {/* Left Sidebar - Module & Lesson Navigation */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } border-r border-[#e0e4ec] bg-white overflow-y-auto transition-all duration-300 hidden md:flex md:flex-col`}
      >
        <div className="p-4 border-b border-[#e0e4ec]">
          <h3 className="font-bold text-[#001d4c] truncate">{course?.title}</h3>
          <p className="text-xs text-[#7a80a9] mt-1">{course?.category}</p>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-[#e0e4ec] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#001d4c]">Progress</span>
            <span className="font-bold text-[#001d4c]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#e0e4ec] rounded-full h-2">
            <div
              className="bg-[#001d4c] h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Modules & Lessons */}
        <div className="flex-1 overflow-y-auto">
          {modules.map((module: Module) => (
            <div key={module.id} className="border-b border-[#e0e4ec]">
              <button
                onClick={() =>
                  setExpandedModuleId(expandedModuleId === module.id ? null : module.id)
                }
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f9fafb] transition text-left"
              >
                <div>
                  <p className="font-semibold text-[#001d4c] text-sm">{module.title}</p>
                  <p className="text-xs text-[#7a80a9]">
                    {lessons.filter((l: Lesson) => l.moduleId === module.id).length} lessons
                  </p>
                </div>
                {expandedModuleId === module.id ? (
                  <ChevronUp className="w-4 h-4 text-[#7a80a9]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#7a80a9]" />
                )}
              </button>

              {expandedModuleId === module.id && (
                <div className="bg-[#f9fafb]">
                  {lessons
                    .filter((l: Lesson) => l.moduleId === module.id)
                    .map((lesson: Lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLessonId(lesson.id)}
                        className={`w-full px-4 py-2.5 text-left flex items-center gap-2 transition hover:bg-[#f0f2f7] ${
                          currentLessonId === lesson.id ? 'bg-[#e9eef6]' : ''
                        }`}
                      >
                        {completedLessons.has(lesson.id) ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : lesson.contentType === 'video' ? (
                          <Video className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        ) : lesson.contentType === 'quiz' ? (
                          <Zap className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-[#7a80a9] flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold line-clamp-1 ${
                              currentLessonId === lesson.id
                                ? 'text-[#001d4c]'
                                : 'text-[#4f5b93]'
                            }`}
                          >
                            {lesson.title}
                          </p>
                          <p className="text-[10px] text-[#7a80a9]">
                            {lesson.durationMinutes} min
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-[#e0e4ec] bg-white px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-[#f9fafb] rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-[#001d4c]">{currentLesson?.title || 'Select a lesson'}</h2>
          </div>
          <button
            onClick={() => navigate(`/learner/courses/${courseId}`)}
            className="text-sm text-[#7a80a9] hover:text-[#001d4c]"
          >
            Exit
          </button>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-5xl mx-auto p-6 space-y-6">
              {currentLesson.contentType === 'video' && (
                <Card>
                  {currentLesson.videoUrl ? (
                    <div className="space-y-4">
                      <video
                        src={currentLesson.videoUrl}
                        controls
                        className="w-full rounded-lg bg-black"
                        style={{ maxHeight: '500px' }}
                      />
                      <div className="flex items-center gap-2 text-sm text-[#7a80a9]">
                        <Clock className="w-4 h-4" />
                        Duration: {currentLesson.durationMinutes} minutes
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black rounded-lg flex items-center justify-center h-96 mb-4">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-white mx-auto mb-2" />
                        <p className="text-white text-lg font-semibold">Video Lesson</p>
                        <p className="text-white text-sm mt-1">{currentLesson.durationMinutes} minutes</p>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {currentLesson.contentType === 'text' && (
                <Card>
                  <div className="prose max-w-none">
                    <div
                      className="text-[#4f5b93] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                    />
                  </div>
                </Card>
              )}

              {currentLesson.contentType === 'quiz' && (
                <Card>
                  {quizState === 'idle' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-500" />
                        <h3 className="font-bold text-[#001d4c] text-lg">Quiz</h3>
                      </div>
                      <p className="text-sm text-[#7a80a9]">
                        {currentLesson.content}
                      </p>
                      <ActionButton
                        onClick={() => handleStartQuiz({ 
                          id: 1, 
                          courseId: Number(courseId), 
                          moduleId: currentLesson.moduleId,
                          title: 'Quiz',
                          description: 'Test your knowledge',
                          totalQuestions: 5,
                          passingScore: 70,
                          timeLimit: 15
                        })}
                        variant="primary"
                      >
                        Start Quiz
                      </ActionButton>
                    </div>
                  )}

                  {quizState === 'taking' && quizQuestions.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-[#001d4c]">{currentQuiz?.title}</h3>
                        <span className="text-sm text-[#7a80a9]">
                          {Object.keys(quizAnswers).length} / {quizQuestions.length} answered
                        </span>
                      </div>

                      <div className="space-y-4">
                        {quizQuestions.map((q: QuizQuestion, idx: number) => (
                          <div key={q.id} className="border border-[#e0e4ec] rounded-lg p-4">
                            <p className="font-semibold text-[#001d4c] mb-3">
                              {idx + 1}. {q.question}
                            </p>
                            <div className="space-y-2">
                              {q.options.map((option: string) => (
                                <label key={option} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-[#f9fafb]">
                                  <input
                                    type="radio"
                                    name={`question-${q.id}`}
                                    value={option}
                                    checked={quizAnswers[q.id] === option}
                                    onChange={(e) =>
                                      setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })
                                    }
                                    className="w-4 h-4"
                                  />
                                  <span className="text-[#4f5b93]">{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <ActionButton
                        onClick={handleSubmitQuiz}
                        variant="primary"
                        className="w-full"
                      >
                        Submit Quiz
                      </ActionButton>
                    </div>
                  )}

                  {quizState === 'completed' && quizResult && (
                    <div className="space-y-6">
                      <div className={`p-4 rounded-lg ${quizResult.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className={`text-lg font-bold ${quizResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                          {quizResult.passed ? '✓ Quiz Passed!' : '✗ Quiz Not Passed'}
                        </p>
                        <p className={`text-sm ${quizResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                          Score: {quizResult.score}% ({quizResult.correctAnswers}/{quizResult.totalQuestions} correct)
                        </p>
                      </div>
                      <p className="text-sm text-[#7a80a9]">
                        {quizResult.passed 
                          ? 'Congratulations! You passed the quiz. Continue to the next lesson.' 
                          : `You need at least ${currentQuiz?.passingScore}% to pass. Feel free to review the content and try again.`}
                      </p>
                      <ActionButton
                        onClick={() => {
                          setQuizState('idle');
                          setQuizAnswers({});
                          setQuizResult(null);
                        }}
                        variant="secondary"
                        className="w-full"
                      >
                        {quizResult.passed ? 'Continue' : 'Retake Quiz'}
                      </ActionButton>
                    </div>
                  )}
                </Card>
              )}

              {/* Mark as Complete */}
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#001d4c] mb-1">
                      {completedLessons.has(currentLessonId!) ? '✓ Completed' : 'Mark as complete'}
                    </p>
                    <p className="text-xs text-[#7a80a9]">
                      {completedLessons.has(currentLessonId!)
                        ? 'You have completed this lesson'
                        : 'Mark this lesson as done when you finish'}
                    </p>
                  </div>
                  {!completedLessons.has(currentLessonId!) && (
                    <ActionButton onClick={handleLessonComplete} variant="primary">
                      Mark Complete
                    </ActionButton>
                  )}
                </div>
              </Card>

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                {previousLesson && (
                  <ActionButton
                    onClick={() => setCurrentLessonId(previousLesson.id)}
                    variant="secondary"
                    className="flex-1"
                  >
                    ← Previous
                  </ActionButton>
                )}
                {nextLesson && (
                  <ActionButton
                    onClick={() => setCurrentLessonId(nextLesson.id)}
                    variant="primary"
                    className="flex-1"
                  >
                    Next →
                  </ActionButton>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#7a80a9]">
              <p>Select a lesson to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Resources (Collapsible on mobile) */}
      <div className="hidden lg:flex lg:w-80 border-l border-[#e0e4ec] bg-white flex-col overflow-y-auto">
        <div className="p-4 border-b border-[#e0e4ec]">
          <h3 className="font-bold text-[#001d4c] mb-4">Resources</h3>

          {/* Course Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-[#7a80a9]" />
              <span className="text-[#7a80a9]">2,340 students</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#7a80a9]" />
              <span className="text-[#7a80a9]">{course?.duration}h total</span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="p-4 border-b border-[#e0e4ec]">
          <h4 className="font-bold text-[#001d4c] text-sm mb-3">Notes</h4>
          <textarea
            placeholder="Add notes for this lesson..."
            className="w-full h-24 p-2 border border-[#d8dcee] rounded-lg text-sm text-[#4f5b93] resize-none focus:outline-none focus:ring-2 focus:ring-[#001d4c]"
          />
        </div>

        {/* Resources Tabs */}
        <div className="p-4 space-y-3 border-b border-[#e0e4ec]">
          <h4 className="font-bold text-[#001d4c] text-sm mb-3">Course Materials</h4>
          {course?.pdfViewerUrl ? (
            <div className="rounded-lg border border-[#e0e4ec] p-3">
              <p className="text-xs font-semibold text-[#001d4c] mb-2">PDF Viewer</p>
              <iframe className="h-48 w-full rounded-lg border border-[#e0e4ec]" src={course.pdfViewerUrl} title="Course PDF Viewer" />
            </div>
          ) : null}
          {course?.liveSessionUrl ? (
            <div className="rounded-lg border border-[#e0e4ec] p-3">
              <p className="text-xs font-semibold text-[#001d4c] mb-2">Live Session</p>
              <a className="text-[11px] font-semibold text-[#F08A2C] hover:underline" href={course.liveSessionUrl} target="_blank" rel="noopener noreferrer">
                Join live session
              </a>
            </div>
          ) : null}
          {Array.isArray(course?.documentLinks) && course.documentLinks.length ? (
            <div className="rounded-lg border border-[#e0e4ec] p-3">
              <p className="text-xs font-semibold text-[#001d4c] mb-2">Documents</p>
              <div className="space-y-2">
                {course.documentLinks.map((link: string) => (
                  <a key={link} className="block text-[11px] font-semibold text-[#F08A2C] hover:underline" href={link} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveResourceTab('slides')}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition ${
                activeResourceTab === 'slides'
                  ? 'bg-[#001d4c] text-white'
                  : 'bg-[#f0f2f7] text-[#001d4c] hover:bg-[#e9eef6]'
              }`}
            >
              📄 Slides
            </button>
            <button
              onClick={() => setActiveResourceTab('reading')}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition ${
                activeResourceTab === 'reading'
                  ? 'bg-[#001d4c] text-white'
                  : 'bg-[#f0f2f7] text-[#001d4c] hover:bg-[#e9eef6]'
              }`}
            >
              📚 Reading
            </button>
            <button
              onClick={() => setActiveResourceTab('code')}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition ${
                activeResourceTab === 'code'
                  ? 'bg-[#001d4c] text-white'
                  : 'bg-[#f0f2f7] text-[#001d4c] hover:bg-[#e9eef6]'
              }`}
            >
              💻 Code
            </button>
          </div>

          {/* Lecture Slides */}
          {activeResourceTab === 'slides' && course?.resources?.lectureSlides && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {course.resources.lectureSlides.map((slide: any) => (
                <div key={slide.id} className="p-2.5 rounded-lg border border-[#e0e4ec] hover:bg-[#f9fafb] transition cursor-pointer">
                  <p className="text-xs font-semibold text-[#001d4c] mb-1">{slide.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#7a80a9]">{slide.pages} pages</span>
                    <a
                      href={slide.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold text-[#F08A2C] hover:underline"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reading Materials */}
          {activeResourceTab === 'reading' && course?.resources?.readingMaterials && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {course.resources.readingMaterials.map((material: any) => (
                <div key={material.id} className="p-2.5 rounded-lg border border-[#e0e4ec] hover:bg-[#f9fafb] transition">
                  <p className="text-xs font-semibold text-[#001d4c] mb-1">{material.title}</p>
                  <p className="text-[10px] text-[#7a80a9] mb-1 line-clamp-2">{material.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#4f5b93]">{material.estimatedReadTime}</span>
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold text-[#F08A2C] hover:underline"
                    >
                      Read
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Code Examples */}
          {activeResourceTab === 'code' && course?.resources?.codeExamples && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {course.resources.codeExamples.map((example: any) => (
                <div key={example.id} className="p-2.5 rounded-lg border border-[#e0e4ec] bg-[#f9fafb] hover:bg-white transition">
                  <p className="text-xs font-semibold text-[#001d4c] mb-1">{example.title}</p>
                  <p className="text-[10px] text-[#7a80a9] mb-1.5 line-clamp-1">{example.description}</p>
                  <div className="bg-[#001d4c] text-[#e9eef6] p-1.5 rounded text-[10px] font-mono max-h-20 overflow-y-auto mb-1.5">
                    <code>{example.code}</code>
                  </div>
                  <span className="inline-block text-[9px] font-semibold px-1.5 py-0.5 bg-[#e9eef6] text-[#001d4c] rounded">
                    {example.language}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {((activeResourceTab === 'slides' && !course?.resources?.lectureSlides?.length) ||
            (activeResourceTab === 'reading' && !course?.resources?.readingMaterials?.length) ||
            (activeResourceTab === 'code' && !course?.resources?.codeExamples?.length)) && (
            <div className="text-center py-4 text-[#7a80a9] text-xs">
              No resources available for this section
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
