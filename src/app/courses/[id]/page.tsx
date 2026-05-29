"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  CheckCircle2,
  BookOpen,
  FileText,
  Trophy,
  HelpCircle,
  Send,
  MessageSquare,
  CornerDownRight,
  ChevronDown,
  ChevronRight,
  Lock,
  Award,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageCircle,
  User
} from "lucide-react";
import { useCourses } from "@/presentation/hooks/useCourses";
import { useLms } from "@/presentation/hooks/useLms";
import DashboardLayout from "@/presentation/components/DashboardLayout";
import Loader from "@/presentation/components/ui/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { Course, Module, Lesson } from "@/domain/entities/Course";
import { Quiz } from "@/domain/entities/Quiz";
import { Question } from "@/domain/entities/Question";
import { Comment } from "@/domain/entities/Comment";
import { parseMarkdown } from "@/presentation/utils/markdown";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Sidebar Course Syllabus Tree Sub-component
interface ModuleAccordionProps {
  module: Module;
  activeItemId: string;
  completedLessons: string[];
  completedQuizzes: string[];
  onSelectLesson: (lesson: Lesson, moduleTitle: string) => void;
  onSelectQuiz: (quiz: Quiz, moduleTitle: string) => void;
}

function ModuleAccordion({
  module,
  activeItemId,
  completedLessons,
  completedQuizzes,
  onSelectLesson,
  onSelectQuiz
}: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { useGetModuleLessons, useGetQuizzesByTarget } = useCourses();

  const { data: lessons = [], isLoading: lessonsLoading } = useGetModuleLessons(module.id);
  const { data: quizzes = [], isLoading: quizzesLoading } = useGetQuizzesByTarget(module.id);

  return (
    <div className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 font-black text-sm text-left hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
      >
        <span className="pr-2">{module.title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-neutral-50/30 dark:bg-neutral-900/10 px-2 pb-3 space-y-1"
          >
            {lessonsLoading || quizzesLoading ? (
              <div className="flex items-center gap-2 p-3 text-neutral-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Syncing curriculum...</span>
              </div>
            ) : (
              <>
                {lessons.map((lesson) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isActive = activeItemId === lesson.id;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson, module.title)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-xs font-bold transition-all cursor-pointer ${isActive
                        ? "bg-black dark:bg-[#A3D14B]/15 text-white dark:text-primary"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40"
                        }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : lesson.video_url ? (
                        <Play className={`w-4 h-4 shrink-0 ${isActive ? "text-[#A3D14B]" : "text-neutral-400"}`} />
                      ) : (
                        <FileText className={`w-4 h-4 shrink-0 ${isActive ? "text-[#A3D14B]" : "text-neutral-400"}`} />
                      )}
                      <span>{lesson.title}</span>
                    </button>
                  );
                })}

                {quizzes.map((quiz) => {
                  const isCompleted = completedQuizzes.includes(quiz.id);
                  const isActive = activeItemId === quiz.id;

                  return (
                    <button
                      key={quiz.id}
                      onClick={() => onSelectQuiz(quiz, module.title)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-xs font-bold transition-all cursor-pointer ${isActive
                        ? "bg-black dark:bg-[#A3D14B]/15 text-white dark:text-primary"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40"
                        }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Trophy className={`w-4 h-4 shrink-0 ${isActive ? "text-[#A3D14B]" : "text-neutral-400"}`} />
                      )}
                      <span>{quiz.title}</span>
                    </button>
                  );
                })}

                {lessons.length === 0 && quizzes.length === 0 && (
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest p-3">
                    No modules published
                  </p>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Discussion Thread Sub-component
interface DiscussionsProps {
  targetId: string;
  targetType: "lesson" | "course";
}

function Discussions({ targetId, targetType }: DiscussionsProps) {
  const { useGetComments, postCommentMutation } = useCourses();
  const { data: comments = [], isLoading } = useGetComments(targetId);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Group comments by parent_id
  const { rootComments, repliesMap } = useMemo(() => {
    const roots: Comment[] = [];
    const replies: Record<string, Comment[]> = {};

    comments.forEach((c) => {
      if (!c.parent_id) {
        roots.push(c);
      } else {
        if (!replies[c.parent_id]) {
          replies[c.parent_id] = [];
        }
        replies[c.parent_id].push(c);
      }
    });

    // Sort roots and children by date descending (newest on top) or ascending
    roots.sort((a, b) => a.created_at - b.created_at);
    Object.keys(replies).forEach((k) => {
      replies[k].sort((a, b) => a.created_at - b.created_at);
    });

    return { rootComments: roots, repliesMap: replies };
  }, [comments]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    postCommentMutation.mutate(
      {
        targetId,
        targetType,
        text: commentText.trim()
      },
      {
        onSuccess: () => setCommentText("")
      }
    );
  };

  const handlePostReply = (parentId: string) => {
    if (!replyText.trim()) return;

    postCommentMutation.mutate(
      {
        targetId,
        targetType,
        text: replyText.trim(),
        parentId
      },
      {
        onSuccess: () => {
          setReplyText("");
          setActiveReplyId(null);
        }
      }
    );
  };

  return (
    <div className="space-y-6 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-2.5">
        <MessageCircle className="w-5 h-5 text-neutral-450 dark:text-neutral-500" />
        <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-base">Community Discussions</h3>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 text-neutral-500 font-bold">
          {comments.length} comments
        </span>
      </div>

      {/* New comment input */}
      <form onSubmit={handlePostComment} className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-black/5 dark:border-white/5 shrink-0">
          <User className="w-4 h-4 text-neutral-450" />
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Share your thoughts or ask a question..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white dark:focus:bg-black transition-all text-xs font-semibold"
          />
          <button
            type="submit"
            disabled={postCommentMutation.isPending || !commentText.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:scale-105 disabled:opacity-50 transition-all cursor-pointer"
          >
            {postCommentMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex items-center gap-2 py-6">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs font-bold text-neutral-450 uppercase tracking-widest">Loading discussions...</span>
        </div>
      ) : rootComments.length > 0 ? (
        <div className="space-y-4">
          {rootComments.map((comment) => {
            const replies = repliesMap[comment.id] || [];
            const isReplying = activeReplyId === comment.id;

            return (
              <div key={comment.id} className="space-y-3 shadow-xs p-4 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl">
                {/* Comment row */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-black/5 dark:border-white/5 shrink-0">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-black text-neutral-900 dark:text-neutral-100">
                        {comment.user_display_name}
                      </span>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                        {new Date(comment.created_at * 1000).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {comment.text}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => {
                          setActiveReplyId(isReplying ? null : comment.id);
                          setReplyText("");
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nested replies */}
                {replies.length > 0 && (
                  <div className="pl-6 border-l border-neutral-100 dark:border-neutral-800 space-y-3 mt-3">
                    {replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 mt-1 shrink-0" />
                        <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-black/5 dark:border-white/5 shrink-0">
                          <User className="w-3 h-3 text-neutral-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[11px] font-black text-neutral-900 dark:text-neutral-100">
                              {reply.user_display_name}
                            </span>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                              {new Date(reply.created_at * 1000).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {reply.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {isReplying && (
                  <div className="pl-10 flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-lg focus:outline-none focus:border-neutral-400 text-xs font-semibold"
                    />
                    <button
                      onClick={() => handlePostReply(comment.id)}
                      disabled={postCommentMutation.isPending || !replyText.trim()}
                      className="px-3 py-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg text-xs hover:scale-105 disabled:opacity-50 transition-all cursor-pointer shrink-0"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <MessageCircle className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2 stroke-1" />
          <h4 className="text-xs font-extrabold text-neutral-700 dark:text-neutral-300">No discussions yet</h4>
          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-550 uppercase tracking-widest mt-1">
            Be the first to share notes or ask questions!
          </p>
        </div>
      )}
    </div>
  );
}

// Active Quiz Sub-component
interface QuizPlayerProps {
  quiz: Quiz;
  isCompleted: boolean;
  onSubmitSuccess: () => void;
}

function QuizPlayer({ quiz, isCompleted, onSubmitSuccess }: QuizPlayerProps) {
  const { useGetQuizQuestions, submitQuizAttemptMutation } = useCourses();
  const { data: questions = [], isLoading } = useGetQuizQuestions(quiz.id);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(isCompleted);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(
    isCompleted ? { score: 100, passed: true } : null
  );

  useEffect(() => {
    setAnswers({});
    setSubmitted(isCompleted);
    setResult(isCompleted ? { score: 100, passed: true } : null);
  }, [quiz.id, isCompleted]);

  const handleSelectOption = (questionId: string, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    submitQuizAttemptMutation.mutate(
      {
        quizId: quiz.id,
        answers
      },
      {
        onSuccess: (data) => {
          setResult({
            score: data.score,
            passed: data.passed
          });
          setSubmitted(true);
          onSubmitSuccess();
        }
      }
    );
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest mt-3 text-neutral-450">Syncing Assessment Questions...</p>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-6 text-center space-y-6"
      >
        <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-full flex items-center justify-center mx-auto">
          {result.passed ? (
            <Award className="w-8 h-8 text-emerald-500" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-500" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black">
            {result.passed ? "Assessment Passed!" : "Assessment Failed"}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {result.passed
              ? "Awesome work! You met the passing requirements for this section."
              : "Don't worry, you can study the syllabus materials and try again."}
          </p>
        </div>

        {/* Score Ring */}
        <div className="flex flex-col items-center justify-center w-36 h-36 mx-auto rounded-full bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 relative">
          <span className="text-3xl font-black text-neutral-800 dark:text-neutral-100">{result.score}%</span>
          <p className="text-[9px] font-black uppercase tracking-wider text-neutral-400 mt-1">Passing: {quiz.min_passing_score}%</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleRetake}
            className="flex-1 py-3 justify-center mx-auto px-4 max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-extrabold uppercase tracking-wider text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
          >
            Retake Quiz
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
        <h4 className="font-extrabold text-sm text-yellow-600 dark:text-yellow-400">Section Quiz Criteria</h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Answer all questions carefully. You need at least <span className="font-black text-neutral-900 dark:text-white">{quiz.min_passing_score}%</span> to pass and earn XP rewards.
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-black dark:bg-white text-white dark:text-black font-black text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <p className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">{q.text}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 pl-9">
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(q.id, opt)}
                    className={`p-4 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${isSelected
                      ? "border-[#A3D14B] bg-[#A3D14B]/10 text-neutral-900 dark:text-white"
                      : "border-neutral-200/80 dark:border-white/5 hover:border-neutral-350 dark:hover:border-neutral-800"
                      }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmitQuiz}
          disabled={submitQuizAttemptMutation.isPending || Object.keys(answers).length < questions.length}
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 hover:scale-[1.01] transition-all cursor-pointer"
        >
          {submitQuizAttemptMutation.isPending ? "Evaluating Attempt..." : "Submit Answers"}
        </button>
      </div>
    </div>
  );
}

// Main Course Player component
export default function CoursePlayerPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const courseId = resolvedParams.id;

  const { useGetCourseById, useGetCourseModules, useGetModuleLessons, useGetQuizzesByTarget, completeLessonMutation } = useCourses();
  const { useGetEnrollments } = useLms();

  // Queries
  const { data: course, isLoading: courseLoading } = useGetCourseById(courseId);
  const { data: modules = [], isLoading: modulesLoading } = useGetCourseModules(courseId);
  const { data: enrollments = [], isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useGetEnrollments();

  // Find user's enrollment
  const enrollment = useMemo(() => {
    return enrollments.find((e) => e.course_id === courseId);
  }, [enrollments, courseId]);

  // Active item details state
  const [activeItem, setActiveItem] = useState<{
    type: "lesson" | "quiz";
    id: string;
    title: string;
    video_url?: string;
    pdf_url?: string;
    body_text?: string;
    description?: string;
    min_passing_score?: number;
    moduleTitle: string;
  } | null>(null);

  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);

  // Sync initial active item when course / modules load
  useEffect(() => {
    if (modules.length > 0 && !activeItem) {
      // Find the first module that has lessons
      const firstModWithLessons = modules.find((m) => m.id);
      if (firstModWithLessons) { }
    }
  }, [modules, activeItem]);

  const firstModuleId = modules[0]?.id || "";
  const { data: firstModuleLessons = [], isLoading: lessonsLoading } = useGetModuleLessons(firstModuleId);
  const { data: firstModuleQuizzes = [], isLoading: quizzesLoading } = useGetQuizzesByTarget(firstModuleId);

  useEffect(() => {
    if (firstModuleLessons.length > 0 && !activeItem) {
      const firstLesson = firstModuleLessons[0];
      setActiveItem({
        type: "lesson",
        id: firstLesson.id,
        title: firstLesson.title,
        video_url: firstLesson.video_url,
        pdf_url: firstLesson.pdf_url,
        body_text: firstLesson.body_text,
        moduleTitle: modules[0]?.title || "Getting Started"
      });
    }
  }, [firstModuleLessons, activeItem, modules]);

  // Helper selectors
  const completedLessons = useMemo(() => {
    return enrollment?.completed_lessons || [];
  }, [enrollment]);

  const completedQuizzes = useMemo(() => {
    return enrollment?.completed_quiz_ids || [];
  }, [enrollment]);

  const progressPercent = useMemo(() => {
    return enrollment?.progress_percent || 0;
  }, [enrollment]);

  const handleSelectLesson = (lesson: Lesson, moduleTitle: string) => {
    setActiveItem({
      type: "lesson",
      id: lesson.id,
      title: lesson.title,
      video_url: lesson.video_url,
      pdf_url: lesson.pdf_url,
      body_text: lesson.body_text,
      moduleTitle
    });
  };

  const handleSelectQuiz = (quiz: Quiz, moduleTitle: string) => {
    setActiveItem({
      type: "quiz",
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      min_passing_score: quiz.min_passing_score,
      moduleTitle
    });
  };

  const handleMarkComplete = () => {
    if (!activeItem || activeItem.type !== "lesson") return;

    completeLessonMutation.mutate(activeItem.id, {
      onSuccess: () => {
        refetchEnrollments();
      }
    });
  };

  const isCurrentCompleted = useMemo(() => {
    if (!activeItem || activeItem.type !== "lesson") return false;
    return completedLessons.includes(activeItem.id);
  }, [activeItem, completedLessons]);

  if (courseLoading || enrollmentsLoading || modulesLoading || lessonsLoading || quizzesLoading) {
    return (
      <DashboardLayout>
        <Loader fullScreen size={120} />
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold">Course Not Found</h2>
          <p className="text-xs text-neutral-500 mt-2">The course details could not be loaded.</p>
          <Link href="/dashboard" className="text-xs font-black uppercase tracking-wider text-primary hover:underline mt-4 inline-block">
            Return to dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // If user is not enrolled, show screen prompting enrollment
  const isEnrolled = !!enrollment;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Sticky Classroom Header (Mobile Only) */}
        <div className="sticky lg:static top-16 lg:top-auto z-30 lg:z-auto bg-white/90 dark:bg-neutral-950/90 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none py-4 lg:py-0 px-6 lg:px-0 -mx-6 lg:mx-0 -mt-8 lg:mt-0 border-b border-black/5 dark:border-white/5 lg:border-b-0 flex items-center justify-between transition-colors">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-450 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Leave Classroom</span>
          </Link>

          <button
            onClick={() => setIsSyllabusOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-lg text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all cursor-pointer animate-fade-in"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Syllabus</span>
          </button>
        </div>

        {!isEnrolled ? (
          <div className="max-w-md mx-auto p-8 text-center bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl space-y-4">
            <Lock className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h2 className="text-lg font-black">Enrollment Required</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-450 leading-relaxed">
              You are not registered for this course yet. Please visit the catalog on the explore page to enroll.
            </p>
            <Link
              href="/dashboard"
              className="inline-block py-3 px-6 bg-black dark:bg-white text-white dark:text-black font-extrabold uppercase tracking-wider text-xs rounded-xl hover:opacity-95"
            >
              Explore Course Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {/* Left Content Area - Player */}
            <div className="lg:col-span-2 space-y-6">
              {activeItem ? (
                <div className="space-y-6">
                  {/* Title & Module Breadcrumb */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#A3D14B]">
                      {activeItem.moduleTitle}
                    </span>
                    <h2 className="text-xl lg:text-2xl font-black text-neutral-900 dark:text-neutral-100">
                      {activeItem.title}
                    </h2>
                  </div>

                  {activeItem.type === "lesson" ? (
                    <>
                      {/* Video Player */}
                      {activeItem.video_url && (
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 shadow-xs group">
                          {activeItem.video_url.includes("youtube.com") || activeItem.video_url.includes("youtu.be") ? (
                            <iframe
                              src={
                                activeItem.video_url.includes("youtube.com/embed/")
                                  ? activeItem.video_url
                                  : activeItem.video_url.replace("watch?v=", "embed/")
                              }
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video src={activeItem.video_url} controls className="w-full h-full object-contain" />
                          )}
                        </div>
                      )}

                      {/* PDF Handouts / Handout download box */}
                      {activeItem.pdf_url && (
                        <div className="flex shadow-xs items-center justify-between p-4 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-neutral-800 dark:text-neutral-200">Lesson Material PDF</h4>
                              <p className="text-xs text-neutral-400 font-bold tracking-tight">Reference handbook & charts</p>
                            </div>
                          </div>
                          <a
                            href={activeItem.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-colors"
                          >
                            <span>Download</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Text content / reading body */}
                      {activeItem.body_text && (
                        <div className="bg-white shadow-xs dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-6">
                          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450 mb-3">Lecture Notes</h3>
                          <div className="space-y-1">
                            {parseMarkdown(activeItem.body_text)}
                          </div>
                        </div>
                      )}

                      {/* Action Completeness Row */}
                      <div className="flex flex-col md:flex-row md:items-center gap-4 shadow-xs justify-between p-5 bg-[#A3D14B]/10 border border-[#A3D14B]/10 rounded-2xl">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-black text-neutral-900 dark:text-white">XP Learning reward</h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Complete this lecture checklist to earn +10 XP</p>
                        </div>

                        {isCurrentCompleted ? (
                          <div className="flex w-fit items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed (+10 XP)
                          </div>
                        ) : (
                          <button
                            onClick={handleMarkComplete}
                            disabled={completeLessonMutation.isPending}
                            className="flex items-center w-fit gap-1.5 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-lg text-xs uppercase tracking-wider hover:scale-[1.01] transition-all cursor-pointer"
                          >
                            {completeLessonMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Mark as Complete
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Mobile Course Progress Bar */}
                      <div className="lg:hidden bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 space-y-3 shadow-xs">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-neutral-500">
                          <span>Progress</span>
                          <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-950 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[#A3D14B] to-emerald-400 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Discussions thread */}
                      <Discussions targetId={activeItem.id} targetType="lesson" />
                    </>
                  ) : (
                    <>
                      {/* Active Quiz Player */}
                      <QuizPlayer
                        quiz={activeItem as any}
                        isCompleted={completedQuizzes.includes(activeItem.id)}
                        onSubmitSuccess={() => refetchEnrollments()}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/10 p-6 text-center">
                  <BookOpen className="w-12 h-12 text-[#A3D14B] stroke-1 mb-3" />
                  <h3 className="font-extrabold text-lg">No syllabus selected</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-1 max-w-xs">
                    Please pick a lesson or quiz from the course syllabus sidebar to start learning.
                  </p>
                </div>
              )}
            </div>

            {/* Right Sidebar - Navigation & Syllabus tree */}
            <div className="hidden lg:block space-y-6">
              {/* Course Title & Overall progress bar */}
              <div className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-5 space-y-4 shadow-xs">
                <div>
                  <h2 className="font-black text-neutral-800 dark:text-neutral-200 truncate">{course.title}</h2>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-neutral-500">
                    <span>Progress</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#A3D14B] to-emerald-400 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Module Syllabus Accordion */}
              <div className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450">Syllabus Index</h3>
                </div>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {modules.map((mod) => (
                    <ModuleAccordion
                      key={mod.id}
                      module={mod}
                      activeItemId={activeItem?.id || ""}
                      completedLessons={completedLessons}
                      completedQuizzes={completedQuizzes}
                      onSelectLesson={handleSelectLesson}
                      onSelectQuiz={handleSelectQuiz}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Syllabus Drawer */}
      <AnimatePresence>
        {isSyllabusOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSyllabusOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden"
            />
            {/* Drawer Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[90%] bg-white dark:bg-black z-50 px-4 lg:hidden flex flex-col h-full"
            >
              <div className="flex items-center pt-6 justify-between flex-shrink-0 mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-450">Syllabus Index</h3>
                <button
                  onClick={() => setIsSyllabusOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable syllabus container */}
              <div className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-black/5 dark:border-white/10 shadow-xs rounded-2xl overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/10">
                  {modules.map((mod) => (
                    <ModuleAccordion
                      key={mod.id}
                      module={mod}
                      activeItemId={activeItem?.id || ""}
                      completedLessons={completedLessons}
                      completedQuizzes={completedQuizzes}
                      onSelectLesson={(lesson, moduleTitle) => {
                        handleSelectLesson(lesson, moduleTitle);
                        setIsSyllabusOpen(false);
                      }}
                      onSelectQuiz={(quiz, moduleTitle) => {
                        handleSelectQuiz(quiz, moduleTitle);
                        setIsSyllabusOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

