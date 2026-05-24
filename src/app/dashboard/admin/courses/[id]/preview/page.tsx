"use client";

import React, { use, useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Play,
  Pause,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  Trophy,
  Loader2,
  RefreshCw,
  Volume2,
  Maximize,
  Clock,
  ShieldAlert,
  Award,
  Sparkles,
  AlertCircle,
  Check,
  X,
  Menu,
  HelpCircle
} from "lucide-react";
import { useAdmin } from "@/presentation/hooks/useAdmin";
import { HttpAdminRepository } from "@/infrastructure/repositories/HttpAdminRepository";
import { Lesson } from "@/domain/entities/Lesson";
import { Quiz } from "@/domain/entities/Quiz";
import { Question } from "@/domain/entities/Question";
import { cn } from "@/presentation/styles/utils";

const adminRepository = new HttpAdminRepository();

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

type ActiveItem =
  | { type: "lesson"; id: string; lesson: Lesson }
  | { type: "quiz"; id: string; quiz: Quiz }
  | null;

function parseMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = "";

  let currentParagraphLines: string[] = [];

  // Helper to parse inline styles (bold, italic, inline code, links)
  const parseInline = (lineText: string): React.ReactNode => {
    const tokens: React.ReactNode[] = [];
    let lastIndex = 0;

    // Regex matching bold, italic, code, links
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = regex.exec(lineText)) !== null) {
      const matchIndex = match.index;

      // Add plain text before match
      if (matchIndex > lastIndex) {
        tokens.push(lineText.substring(lastIndex, matchIndex));
      }

      if (match[1]) {
        tokens.push(<strong key={matchIndex} className="font-extrabold text-neutral-900 dark:text-neutral-50">{match[2]}</strong>);
      } else if (match[3]) {
        tokens.push(<em key={matchIndex} className="italic text-neutral-800 dark:text-neutral-200">{match[4]}</em>);
      } else if (match[5]) {
        tokens.push(<code key={matchIndex} className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/5 rounded text-xs font-mono text-pink-600 dark:text-pink-400">{match[5]}</code>);
      } else if (match[6]) {
        tokens.push(
          <a key={matchIndex} href={match[7]} target="_blank" rel="noopener noreferrer" className="text-[#A3D14B] hover:underline font-bold">
            {match[6]}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < lineText.length) {
      tokens.push(lineText.substring(lastIndex));
    }

    return <>{tokens}</>;
  };

  const flushParagraph = (key: string) => {
    if (currentParagraphLines.length > 0) {
      const parsedLines = currentParagraphLines.map((line, idx) => (
        <span key={idx}>
          {idx > 0 && <br />}
          {parseInline(line)}
        </span>
      ));
      elements.push(
        <p key={key} className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed my-3">
          {parsedLines}
        </p>
      );
      currentParagraphLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith("```")) {
      flushParagraph(`p-${i}`);
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="p-4 my-4 bg-neutral-900 text-neutral-100 rounded-xl overflow-x-auto text-xs font-mono border border-white/5">
            <code className={codeBlockLang ? `language-${codeBlockLang}` : ""}>
              {codeBlockLines.join("\n")}
            </code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        codeBlockLang = line.trim().substring(3).trim();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Unordered list item
    const listMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    if (listMatch) {
      flushParagraph(`p-${i}`);
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-sm md:text-base text-neutral-600 dark:text-neutral-400 mb-1">
          {parseInline(listMatch[2])}
        </li>
      );
      continue;
    } else if (inList) {
      elements.push(
        <ul key={`ul-${i}`} className="my-3 space-y-1">
          {listItems}
        </ul>
      );
      inList = false;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) {
      flushParagraph(`p-${i}`);
      const level = headerMatch[1].length;
      const content = parseInline(headerMatch[2]);
      const baseClass = "font-black tracking-tight text-neutral-900 dark:text-neutral-50 mt-6 mb-3";

      if (level === 1) {
        elements.push(<h1 key={`h-${i}`} className={`text-2xl md:text-3xl ${baseClass}`}>{content}</h1>);
      } else if (level === 2) {
        elements.push(<h2 key={`h-${i}`} className={`text-xl md:text-2xl ${baseClass}`}>{content}</h2>);
      } else if (level === 3) {
        elements.push(<h3 key={`h-${i}`} className={`text-lg md:text-xl ${baseClass}`}>{content}</h3>);
      } else {
        elements.push(<h4 key={`h-${i}`} className={`text-base md:text-lg ${baseClass}`}>{content}</h4>);
      }
      continue;
    }

    // Blockquote
    const quoteMatch = line.match(/^>\s+(.*)/);
    if (quoteMatch) {
      flushParagraph(`p-${i}`);
      elements.push(
        <blockquote key={`q-${i}`} className="pl-4 border-l-4 border-neutral-300 dark:border-neutral-700 italic text-neutral-500 my-4">
          {parseInline(quoteMatch[1])}
        </blockquote>
      );
      continue;
    }

    // Empty line (paragraph break)
    if (line.trim() === "") {
      flushParagraph(`p-${i}`);
      continue;
    }

    // Normal paragraph line
    currentParagraphLines.push(line);
  }

  // Flush remaining elements
  flushParagraph("p-final");
  if (inList) {
    elements.push(
      <ul key="ul-end" className="my-3 space-y-1">
        {listItems}
      </ul>
    );
  }
  if (inCodeBlock) {
    elements.push(
      <pre key="code-end" className="p-4 my-4 bg-neutral-900 text-neutral-100 rounded-xl overflow-x-auto text-xs font-mono border border-white/5">
        <code>{codeBlockLines.join("\n")}</code>
      </pre>
    );
  }

  return elements;
}

export default function CoursePreviewPage({ params }: PreviewPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const { useGetCourseById, useGetModulesByCourse, useGetQuizQuestions } = useAdmin();

  // Fetch Course
  const { data: course, isLoading: isCourseLoading, error: courseError } = useGetCourseById(courseId);

  // Fetch Modules
  const { data: modules = [], isLoading: isModulesLoading } = useGetModulesByCourse(courseId);

  // Fetch lessons for all modules in parallel
  const lessonsQueries = useQueries({
    queries: (modules || []).map((m) => ({
      queryKey: ["admin-lessons-preview", m.id],
      queryFn: () => adminRepository.getLessonsByModule(m.id),
      enabled: !!m.id,
    })),
  });

  const isLessonsLoading = lessonsQueries.some((q) => q.isLoading);

  // Fetch quizzes for both the course and all its modules
  const allTargets = useMemo(() => {
    return [
      { id: courseId, type: "course" },
      ...(modules || []).map((m) => ({ id: m.id, type: "module" }))
    ];
  }, [courseId, modules]);

  const quizzesQueries = useQueries({
    queries: allTargets.map((target) => ({
      queryKey: ["admin-quizzes-preview", target.id],
      queryFn: () => adminRepository.getQuizzesByTarget(target.id),
      enabled: !!target.id,
    })),
  });

  const isQuizzesLoading = quizzesQueries.some((q) => q.isLoading);

  const quizzes = useMemo(() => {
    return quizzesQueries.flatMap((q) => q.data || []);
  }, [quizzesQueries]);

  // Combine modules with their lessons and quizzes
  const modulesWithContent = useMemo(() => {
    return (modules || []).map((module, index) => {
      const lessons = lessonsQueries[index]?.data || [];
      const moduleQuizzes = quizzes.filter((q) => q.target_id === module.id);
      return {
        ...module,
        lessons: [...lessons].sort((a, b) => a.order - b.order),
        quizzes: moduleQuizzes,
      };
    });
  }, [modules, lessonsQueries, quizzes]);

  // Get Course Final Exam
  const courseQuizzes = useMemo(() => {
    return quizzes.filter((q) => q.target_id === courseId);
  }, [quizzes, courseId]);

  // State Management
  const [activeItem, setActiveItem] = useState<ActiveItem>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "faq">("overview");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openModuleIds, setOpenModuleIds] = useState<Set<string>>(new Set());

  // Initialize all modules as open on mount or modules load
  useEffect(() => {
    if (modules && modules.length > 0 && openModuleIds.size === 0) {
      setOpenModuleIds(new Set(modules.map((m) => m.id)));
    }
  }, [modules, openModuleIds]);

  const toggleModule = (moduleId: string) => {
    setOpenModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  // Mock Video Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [volume, setVolume] = useState(80);
  const videoInterval = useRef<NodeJS.Timeout | null>(null);

  // Quiz Attempt State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // Fetch Questions for Active Quiz
  const activeQuizId = activeItem?.type === "quiz" ? activeItem.id : "";
  const { data: questions = [], isLoading: isQuestionsLoading } = useGetQuizQuestions(activeQuizId);

  // Reset video state when switching lessons
  useEffect(() => {
    setIsPlaying(false);
    setVideoTime(0);
    if (videoInterval.current) {
      clearInterval(videoInterval.current);
    }
  }, [activeItem]);

  // Handle video mock timer ticks
  const videoDuration = activeItem?.type === "lesson" && activeItem.lesson.duration_seconds
    ? activeItem.lesson.duration_seconds
    : 180; // Default 3 mins fallback

  useEffect(() => {
    if (isPlaying) {
      videoInterval.current = setInterval(() => {
        setVideoTime((prev) => {
          if (prev >= videoDuration) {
            setIsPlaying(false);
            if (videoInterval.current) clearInterval(videoInterval.current);
            // Auto complete lesson
            if (activeItem?.type === "lesson") {
              handleMarkComplete(activeItem.id);
            }
            return videoDuration;
          }
          return prev + 1 * videoSpeed;
        });
      }, 1000);
    } else {
      if (videoInterval.current) {
        clearInterval(videoInterval.current);
      }
    }

    return () => {
      if (videoInterval.current) {
        clearInterval(videoInterval.current);
      }
    };
  }, [isPlaying, videoDuration, videoSpeed, activeItem]);

  // Quiz action resets
  useEffect(() => {
    if (activeItem?.type === "quiz") {
      setQuizStarted(false);
      setCurrentQuestionIndex(0);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(0);
      setQuizPassed(false);
      setReviewMode(false);
    }
  }, [activeItem]);

  // Total Course Stat Calculators
  const totalLessonsCount = useMemo(() => {
    return modulesWithContent.reduce((sum, mod) => sum + mod.lessons.length, 0);
  }, [modulesWithContent]);

  const totalDurationMinutes = useMemo(() => {
    const seconds = modulesWithContent.reduce((sum, mod) => {
      return sum + mod.lessons.reduce((lSum, les) => lSum + (les.duration_seconds || 180), 0);
    }, 0);
    return Math.ceil(seconds / 60);
  }, [modulesWithContent]);

  // Navigation Logic
  const allPlaylistItems = useMemo(() => {
    const playlist: Array<
      | { type: "lesson"; id: string; lesson: Lesson; moduleTitle: string }
      | { type: "quiz"; id: string; quiz: Quiz; moduleTitle: string }
    > = [];

    modulesWithContent.forEach((mod) => {
      mod.lessons.forEach((les) => {
        playlist.push({ type: "lesson", id: les.id, lesson: les, moduleTitle: mod.title });
      });
      mod.quizzes.forEach((qz) => {
        playlist.push({ type: "quiz", id: qz.id, quiz: qz, moduleTitle: mod.title });
      });
    });

    courseQuizzes.forEach((cq) => {
      playlist.push({ type: "quiz", id: cq.id, quiz: cq, moduleTitle: "Course Final Assessment" });
    });

    return playlist;
  }, [modulesWithContent, courseQuizzes]);

  const currentPlayIndex = useMemo(() => {
    if (!activeItem) return -1;
    return allPlaylistItems.findIndex(
      (item) => item.type === activeItem.type && item.id === activeItem.id
    );
  }, [activeItem, allPlaylistItems]);

  const handleNextItem = () => {
    if (currentPlayIndex < allPlaylistItems.length - 1) {
      const next = allPlaylistItems[currentPlayIndex + 1];
      if (next.type === "lesson") {
        setActiveItem({ type: "lesson", id: next.id, lesson: next.lesson });
      } else {
        setActiveItem({ type: "quiz", id: next.id, quiz: next.quiz });
      }
    } else {
      // Completed last item, return to course landing
      setActiveItem(null);
    }
  };

  const handlePrevItem = () => {
    if (currentPlayIndex > 0) {
      const prev = allPlaylistItems[currentPlayIndex - 1];
      if (prev.type === "lesson") {
        setActiveItem({ type: "lesson", id: prev.id, lesson: prev.lesson });
      } else {
        setActiveItem({ type: "quiz", id: prev.id, quiz: prev.quiz });
      }
    }
  };

  const handleMarkComplete = (id: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleStartLearning = () => {
    if (allPlaylistItems.length > 0) {
      const first = allPlaylistItems[0];
      if (first.type === "lesson") {
        setActiveItem({ type: "lesson", id: first.id, lesson: first.lesson });
      } else {
        setActiveItem({ type: "quiz", id: first.id, quiz: first.quiz });
      }
    }
  };

  // Formatter for video playback time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Quiz submission scorer
  const handleQuizSubmit = () => {
    if (questions.length === 0) return;

    let correctCount = 0;
    questions.forEach((q) => {
      const userAns = quizAnswers[q.id] || "";
      if (userAns.toLowerCase().trim() === q.correct_answer.toLowerCase().trim()) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const minPassing = activeItem?.type === "quiz" ? activeItem.quiz.min_passing_score || 70 : 70;
    const passed = score >= minPassing;

    setQuizScore(score);
    setQuizPassed(passed);
    setQuizSubmitted(true);

    if (passed && activeItem) {
      setCompletedItems((prev) => {
        const next = new Set(prev);
        next.add(activeItem.id);
        return next;
      });
    }
  };

  const handleSelectOption = (questionId: string, value: string) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Loading Screen
  const isDataLoading = isCourseLoading || isModulesLoading || isLessonsLoading || isQuizzesLoading;
  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white p-6">
        <Loader2 className="w-12 h-12 text-[#A3D14B] animate-spin mb-4" />
        <p className="text-sm font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-100">Loading Course Preview...</p>
        <span className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">Preparing course curriculum, videos, and quizzes</span>
      </div>
    );
  }

  // Error Screen
  if (courseError || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">Course Preview Unavailable</h2>
        <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2 max-w-md">
          We encountered an issue retrieving the details for this course. Please verify the URL or ensure the course is not deleted.
        </p>
        <Link
          href={`/dashboard/admin/courses/${courseId}`}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Settings</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans overflow-hidden">

      {/* Top Banner indicating Admin Preview Mode */}
      <div className="sticky top-0 z-50 w-full bg-black border-b border-[#A3D14B]/20 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-black tracking-widest text-[#A3D14B] uppercase flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Admin Preview Mode
          </span>
          <span className="hidden md:inline-block text-xs text-neutral-400 font-medium">
            &mdash; Viewing course curriculum as a student
          </span>
        </div>
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 hover:border-neutral-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Container */}
      {activeItem === null ? (

        /* ==================== STATE 1: COURSE OVERVIEW / LANDING PAGE ==================== */
        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

              {/* Left Content Area (Overview, Curriculum, details) */}
              <div className="lg:col-span-2">

                {/* Cover Banner Mockup */}
                <div className="relative mb-8 aspect-video rounded-3xl overflow-hidden bg-gradient-to-tr from-neutral-900 via-neutral-850 to-neutral-950 flex flex-col justify-between p-6 md:p-8">
                  {course.thumbnail_url ? (
                    <>
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#A3D14B]/20 via-neutral-950/20 to-neutral-950 opacity-80" />
                  )}

                  {/* Overlay Metadata */}
                  <div className="relative z-10">
                    <span className="px-3 py-1 bg-white/10 dark:bg-black/35 backdrop-blur-md rounded-full text-[9px] font-black text-white border border-white/10 uppercase tracking-widest">
                      {course.category}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                      {course.title}
                    </h1>
                    <p className="text-sm text-neutral-300 max-w-xl line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </div>

                {/* Course Navigation Tabs */}
                <div className="border-b mb-4 border-neutral-200 dark:border-white/5 flex gap-6">
                  {(["overview", "curriculum", "faq"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "pb-4 text-xs font-black uppercase tracking-wider relative transition-colors cursor-pointer",
                        activeTab === tab
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-450 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-350"
                      )}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A3D14B]"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div>
                  <AnimatePresence mode="wait">
                    {activeTab === "overview" && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-6"
                      >
                        <div className="prose dark:prose-invert max-w-none">
                          <h3 className="text-lg font-extrabold mb-3">About This Course</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                            {course.description}
                          </p>
                        </div>

                        <div className="bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-white/5 rounded-2xl p-5 space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">Course Syllabus Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-white dark:bg-neutral-950 p-4 rounded-xl border border-black/5 dark:border-white/5">
                              <span className="text-xl font-extrabold text-neutral-900 dark:text-white block">
                                {modules.length}
                              </span>
                              <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Modules</span>
                            </div>
                            <div className="bg-white dark:bg-neutral-950 p-4 rounded-xl border border-black/5 dark:border-white/5">
                              <span className="text-xl font-extrabold text-neutral-900 dark:text-white block">
                                {totalLessonsCount}
                              </span>
                              <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Lessons</span>
                            </div>
                            <div className="bg-white dark:bg-neutral-950 p-4 rounded-xl border border-black/5 dark:border-white/5">
                              <span className="text-xl font-extrabold text-neutral-900 dark:text-white block">
                                {totalDurationMinutes}m
                              </span>
                              <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Syllabus Time</span>
                            </div>
                            <div className="bg-white dark:bg-neutral-950 p-4 rounded-xl border border-black/5 dark:border-white/5">
                              <span className="text-xl font-extrabold text-[#A3D14B] block">
                                {quizzes.length}
                              </span>
                              <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Quizzes</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "curriculum" && (
                      <motion.div
                        key="curriculum"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-extrabold mb-3">Course Curriculum</h3>
                        {modulesWithContent.length === 0 ? (
                          <div className="text-center py-10 border border-dashed border-neutral-350 dark:border-white/10 rounded-2xl p-6">
                            <BookOpen className="w-10 h-10 text-neutral-350 dark:text-neutral-600 mx-auto mb-3" />
                            <h4 className="font-extrabold text-neutral-800 dark:text-neutral-250">No Modules Created</h4>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs mx-auto mt-1">
                              Go back to the Admin Dashboard and use the Curriculum Builder to add content sections.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {modulesWithContent.map((mod, idx) => (
                              <details
                                key={mod.id}
                                className="group border border-neutral-200 dark:border-white/5 bg-white dark:bg-neutral-950 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                                open={openModuleIds.has(mod.id)}
                              >
                                <summary
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleModule(mod.id);
                                  }}
                                  className="flex items-center justify-between p-5 cursor-pointer select-none hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors"
                                >
                                  <div className="flex items-center gap-3.5">
                                    <div className="w-7 h-7 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-neutral-800 dark:text-neutral-200 flex items-center justify-center text-xs font-black">
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200">
                                        {mod.title}
                                      </h4>
                                      <p className="text-[10px] text-neutral-400 dark:text-neutral-555 font-bold uppercase tracking-wider mt-0.5">
                                        {mod.lessons.length} Lessons &bull; {mod.quizzes.length} Quizzes
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-neutral-400 dark:text-neutral-555 group-open:rotate-180 transition-transform">
                                    <ChevronDown className="w-5 h-5" />
                                  </div>
                                </summary>

                                <div className="border-t border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-950/20 px-5 py-2 divide-y divide-neutral-100 dark:divide-white/5">
                                  {mod.lessons.length === 0 && mod.quizzes.length === 0 && (
                                    <div className="py-4 text-center text-xs text-neutral-450 dark:text-neutral-500">
                                      No content in this module.
                                    </div>
                                  )}

                                  {mod.lessons.map((les) => (
                                    <div
                                      key={les.id}
                                      onClick={() => setActiveItem({ type: "lesson", id: les.id, lesson: les })}
                                      className="py-3.5 flex items-center justify-between group/item cursor-pointer text-neutral-700 dark:text-neutral-300 hover:text-[#A3D14B]"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        {les.video_url ? (
                                          <Play className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
                                        ) : (
                                          <FileText className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
                                        )}
                                        <span className="text-xs font-bold truncate group-hover/item:underline">{les.title}</span>
                                      </div>
                                      <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500">
                                          {formatTime(les.duration_seconds || 180)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}

                                  {mod.quizzes.map((qz) => (
                                    <div
                                      key={qz.id}
                                      onClick={() => setActiveItem({ type: "quiz", id: qz.id, quiz: qz })}
                                      className="py-3.5 flex items-center justify-between group/item cursor-pointer text-neutral-700 dark:text-neutral-300 hover:text-[#A3D14B]"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <Trophy className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
                                        <span className="text-xs font-black truncate group-hover/item:underline uppercase tracking-wide">
                                          {qz.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2.5 shrink-0">
                                        <span className="text-[9px] font-black uppercase text-[#A3D14B] bg-[#A3D14B]/10 px-2 py-0.5 rounded border border-[#A3D14B]/20">
                                          {qz.min_passing_score}% Pass
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "faq" && (
                      <motion.div
                        key="faq"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-extrabold mb-3">Frequently Asked Questions</h3>
                        <div className="space-y-3">
                          {[
                            {
                              q: "Will I receive a completion certificate?",
                              a: "Yes! Once you finish all syllabus modules, lessons, and pass the final exam with the minimum passing score, a digital certificate will be unlocked."
                            },
                            {
                              q: "Is there a deadline for this course?",
                              a: "No, courses are completely self-paced. You can start, pause, and resume learning at any time from any device."
                            },
                            {
                              q: "What passing score is required for quizzes?",
                              a: "Each module assessment has a specific minimum passing score (typically 70% or 80%). You can retake the quiz as many times as necessary to pass."
                            }
                          ].map((faq, idx) => (
                            <div key={idx} className="bg-white dark:bg-neutral-950 p-5 border border-neutral-200 dark:border-white/5 rounded-2xl">
                              <h4 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200">{faq.q}</h4>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">{faq.a}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* Right Details Panel */}
              <div className="space-y-6">

                {/* Course Purchase / Progress Simulation Widget */}
                <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm sticky top-10 ">
                  <h3 className="font-extrabold text-neutral-800 dark:text-neutral-200 text-lg">Student Action Center</h3>
                  <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-1">
                    Preview how student CTAs look and act.
                  </p>

                  <div className="my-6 space-y-4">
                    <div className="flex items-center justify-between text-sm border-b border-neutral-100 dark:border-white/5 pb-2">
                      <span className="text-neutral-500 dark:text-neutral-450 font-medium">Estimated Price</span>
                      <span className="font-extrabold text-neutral-900 dark:text-white">
                        {course.price ? `$${course.price}` : "Free Course"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-b border-neutral-100 dark:border-white/5 pb-2">
                      <span className="text-neutral-500 dark:text-neutral-450 font-medium">Lectures</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{totalLessonsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-b border-neutral-100 dark:border-white/5 pb-2">
                      <span className="text-neutral-500 dark:text-neutral-450 font-medium">Total Duration</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{totalDurationMinutes} mins</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500 dark:text-neutral-450 font-medium">Access Type</span>
                      <span className="font-black text-[#A3D14B] uppercase text-[10px] tracking-wider bg-[#A3D14B]/10 border border-[#A3D14B]/20 px-2.5 py-0.5 rounded">
                        Lifetime
                      </span>
                    </div>
                  </div>

                  {allPlaylistItems.length > 0 ? (
                    <button
                      onClick={handleStartLearning}
                      className="w-full py-4 bg-[#A3D14B] hover:bg-[#A3D14B]/90 text-black font-black uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>Start Learning</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <span>Syllabus Empty</span>
                    </button>
                  )}

                  {/* Course Final Exam CTA */}
                  {courseQuizzes.length > 0 && (
                    <button
                      onClick={() => setActiveItem({ type: "quiz", id: courseQuizzes[0].id, quiz: courseQuizzes[0] })}
                      className="w-full mt-3 py-3.5 border border-neutral-200 dark:border-white/10 hover:border-[#A3D14B]/30 hover:bg-[#A3D14B]/5 text-neutral-850 dark:text-neutral-200 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Trophy className="w-4 h-4 text-[#A3D14B]" />
                      <span>Take Final Exam</span>
                    </button>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

      ) : (

        /* ==================== STATE 2: INTERACTIVE LEARNING PLAYER ==================== */
        <div className="flex-1 flex overflow-hidden relative">

          {/* Collapse sidebar toggle button (Desktop only) */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="hidden md:flex absolute bottom-5 left-5 z-40 w-10 h-10 bg-black text-white hover:bg-neutral-900 border border-neutral-800 rounded-full items-center justify-center shadow-2xl cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Sidebar Drawer for curriculum playlist */}
          <div
            className={cn(
              "bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-white/5 flex flex-col transition-all duration-300 z-30 shrink-0",
              sidebarExpanded ? "w-80" : "w-0 md:w-16 overflow-hidden",
              // Mobile behavior
              "fixed inset-y-0 left-0 pt-[57px] md:relative md:pt-0",
              mobileMenuOpen ? "translate-x-0 w-80" : "-translate-x-full md:translate-x-0"
            )}
          >
            {/* Header info in sidebar */}
            <div className="p-4 border-b border-neutral-200 dark:border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-neutral-850 dark:text-white mt-0.5">{course.title}</h4>
              </div>
            </div>

            {/* Scrolling Curriculum Playlist */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
              {modulesWithContent.map((mod, modIdx) => (
                <div key={mod.id} className="space-y-1.5">
                  {/* Module header */}
                  <div className="px-2 pt-1 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-550 tracking-wider">
                      Module {modIdx + 1}: {mod.title}
                    </span>
                  </div>

                  {/* Playlist items */}
                  <div className="space-y-1">
                    {mod.lessons.map((les) => {
                      const isCurrent = activeItem?.type === "lesson" && activeItem.id === les.id;
                      const isDone = completedItems.has(les.id);
                      return (
                        <button
                          key={les.id}
                          onClick={() => {
                            setActiveItem({ type: "lesson", id: les.id, lesson: les });
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all cursor-pointer group text-xs",
                            isCurrent
                              ? "bg-[#A3D14B]/10 border border-[#A3D14B]/20 text-[#A3D14B]"
                              : "border border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
                          )}
                        >
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkComplete(les.id);
                            }}
                            className={cn(
                              "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer",
                              isDone
                                ? "bg-[#A3D14B] border-[#A3D14B] text-black"
                                : "border-neutral-300 dark:border-white/10 group-hover:border-[#A3D14B]/40"
                            )}
                          >
                            {isDone && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold block truncate">{les.title}</span>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-semibold block mt-0.5">
                              {les.video_url ? "Video Lecture" : "Readings"} &bull; {formatTime(les.duration_seconds || 180)}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {mod.quizzes.map((qz) => {
                      const isCurrent = activeItem?.type === "quiz" && activeItem.id === qz.id;
                      const isDone = completedItems.has(qz.id);
                      return (
                        <button
                          key={qz.id}
                          onClick={() => {
                            setActiveItem({ type: "quiz", id: qz.id, quiz: qz });
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all cursor-pointer group text-xs",
                            isCurrent
                              ? "bg-[#A3D14B]/10 border border-[#A3D14B]/20 text-[#A3D14B]"
                              : "border border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                              isDone
                                ? "bg-[#A3D14B] border-[#A3D14B] text-black"
                                : "border-neutral-300 dark:border-white/10"
                            )}
                          >
                            {isDone && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-black block uppercase tracking-wider text-[#A3D14B]">
                              {qz.title}
                            </span>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-semibold block mt-0.5">
                              Assessment &bull; {qz.min_passing_score}% Pass Score
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Course Final Exams */}
              {courseQuizzes.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-neutral-200 dark:border-white/5">
                  <span className="text-[10px] font-black uppercase text-[#A3D14B] tracking-widest px-2">Final Certification</span>
                  {courseQuizzes.map((cq) => {
                    const isCurrent = activeItem?.type === "quiz" && activeItem.id === cq.id;
                    const isDone = completedItems.has(cq.id);
                    return (
                      <button
                        key={cq.id}
                        onClick={() => {
                          setActiveItem({ type: "quiz", id: cq.id, quiz: cq });
                          setMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all cursor-pointer group text-xs",
                          isCurrent
                            ? "bg-[#A3D14B]/10 border border-[#A3D14B]/20 text-[#A3D14B]"
                            : "border border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                            isDone
                              ? "bg-[#A3D14B] border-[#A3D14B] text-black"
                              : "border-neutral-300 dark:border-white/10"
                          )}
                        >
                          {isDone && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-black block truncate text-neutral-850 dark:text-white uppercase tracking-wider">
                            {cq.title}
                          </span>
                          <span className="text-[9px] text-[#A3D14B] font-bold block mt-0.5">
                            Exam &bull; {cq.min_passing_score}% Pass Score
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Background overlay for mobile drawer */}
          {mobileMenuOpen && (
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-20 md:hidden"
            />
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

            {/* Top Toolbar / Mobile Menu triggers */}
            <div className="px-4 md:hidden py-3 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-white/5 flex items-center justify-between md:justify-end gap-4 shrink-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex md:hidden items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <Menu className="w-4.5 h-4.5" />
                <span>Modules</span>
              </button>
            </div>

            {/* Core Player Interface */}
            <div className="flex-1 p-4 md:px-8 md:pb-8 md:pt-16 max-w-4xl mx-auto w-full space-y-6 font-sans">

              {activeItem.type === "lesson" && (

                /* ==================== CONTENT: LESSON VIEW ==================== */
                <div className="space-y-6">

                  {activeItem.lesson.video_url ? (

                    /* MOCK VIDEO PLAYER */
                    <div className="bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative aspect-video flex flex-col justify-between group">

                      {/* Video Simulated screen graphics */}
                      <div className="absolute inset-0 flex items-center justify-center select-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-neutral-950">
                        {isPlaying ? (
                          /* Visual animation of playing video */
                          <div className="flex items-center gap-1">
                            {[...Array(12)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 bg-[#A3D14B] rounded-full"
                                animate={{ height: [12, 40, 15, 30, 12] }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                  delay: i * 0.1,
                                  ease: "easeInOut",
                                }}
                                style={{ height: 20 }}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-[#A3D14B]/10 border border-[#A3D14B]/35 flex items-center justify-center text-[#A3D14B] hover:scale-110 active:scale-95 transition-transform duration-300 cursor-pointer" onClick={() => setIsPlaying(true)}>
                            <Play className="w-7 h-7 fill-[#A3D14B]" />
                          </div>
                        )}
                      </div>

                      {/* Video Player Bottom Controls Overlay */}
                      <div className="z-10 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-4 pb-6 opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end">

                        {/* Controls Panel */}
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="hover:text-[#A3D14B] transition-colors cursor-pointer"
                            >
                              {isPlaying ? (
                                <Pause className="w-5 h-5 fill-white" />
                              ) : (
                                <Play className="w-5 h-5 fill-white" />
                              )}
                            </button>

                            <div className="flex items-center gap-1.5">
                              <Volume2 className="w-4 h-4 text-neutral-400" />
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="w-16 h-1 bg-white/25 rounded-lg appearance-none accent-[#A3D14B]"
                              />
                            </div>

                            <span className="text-[10px] font-mono text-neutral-350">
                              {formatTime(videoTime)} / {formatTime(videoDuration)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-mono text-neutral-350">
                            {/* Playback speed control */}
                            <button
                              onClick={() => setVideoSpeed((prev) => (prev === 2 ? 1 : prev + 0.5))}
                              className="hover:text-white transition-colors cursor-pointer bg-white/10 px-2 py-0.5 rounded border border-white/5"
                            >
                              {videoSpeed}x
                            </button>
                            <Maximize className="w-4 h-4 hover:text-[#A3D14B] transition-colors cursor-pointer" />
                          </div>
                        </div>

                      </div>

                      {/* Scrub Bar at the bottom edge of the player with horizontal padding */}
                      <div className="absolute bottom-5 left-5 right-5 z-20 h-1.5 bg-white/15 hover:h-2 transition-all cursor-pointer" onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        setVideoTime(percent * videoDuration);
                      }}>
                        <div
                          className="absolute top-0 left-0 h-full bg-[#A3D14B]"
                          style={{ width: `${(videoTime / videoDuration) * 100}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#A3D14B] border border-white rounded-full shadow-md scale-100 transition-all duration-150"
                          style={{ left: `calc(${(videoTime / videoDuration) * 100}% - 7px)` }}
                        />
                      </div>

                    </div>

                  ) : (

                    /* MOCK DOCUMENT / READING LESSON PLACEHOLDER */
                    <div className="bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-white/5 rounded-2xl p-6 md:p-8 flex items-center gap-4 select-none">
                      <div className="w-12 h-12 rounded-xl bg-[#A3D14B]/10 border border-[#A3D14B]/20 text-[#A3D14B] flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold">Reading Resource File</h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {activeItem.lesson.pdf_url ? "Includes downloadable PDF file attachment" : "Text-based syllabus entry"}
                        </p>
                      </div>
                      {activeItem.lesson.pdf_url && (
                        <a
                          href={activeItem.lesson.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto px-4 py-2 border border-neutral-300 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/20 bg-white dark:bg-neutral-900 rounded-xl text-[10px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all shrink-0"
                        >
                          Download PDF
                        </a>
                      )}
                    </div>

                  )}

                  {/* Lesson Text Details */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-white/5 pb-4">
                      <div>
                        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                          {activeItem.lesson.title}
                        </h1>
                      </div>
                      <button
                        onClick={() => handleMarkComplete(activeItem.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all cursor-pointer",
                          completedItems.has(activeItem.id)
                            ? "bg-[#A3D14B]/15 text-[#A3D14B] border-[#A3D14B]/25"
                            : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-neutral-450 dark:hover:border-white/20"
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{completedItems.has(activeItem.id) ? "Completed" : "Mark as Complete"}</span>
                      </button>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                      {activeItem.lesson.body_text ? (
                        <div className="space-y-1">
                          {parseMarkdown(activeItem.lesson.body_text)}
                        </div>
                      ) : (
                        <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          This lesson does not contain supplementary reading materials. Please watch the lecture video above.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Navigation footer */}
                  <div className="pt-6 border-t border-neutral-200 dark:border-white/5 flex items-center justify-between gap-4">
                    <button
                      onClick={handlePrevItem}
                      disabled={currentPlayIndex === 0}
                      className="px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-white/10 hover:border-neutral-450 dark:hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer bg-transparent"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>

                    <button
                      onClick={handleNextItem}
                      className="px-5 py-3 bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer border border-transparent"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              )}

              {activeItem.type === "quiz" && (

                /* ==================== CONTENT: INTERACTIVE QUIZ ==================== */
                <div className="space-y-6">

                  {isQuestionsLoading ? (
                    <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                      <Loader2 className="w-10 h-10 text-[#A3D14B] animate-spin mb-4" />
                      <h4 className="text-sm font-bold">Fetching Quiz Questions</h4>
                      <p className="text-xs text-neutral-455 dark:text-neutral-500 mt-1">Resolving question templates and assessment structures</p>
                    </div>
                  ) : !quizStarted ? (

                    /* QUIZ START BANNER */
                    <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                      <div className="border-b border-neutral-100 dark:border-white/5 pb-5">
                        <div>
                          <h1 className="text-xl md:text-2xl font-extrabold text-neutral-900 dark:text-white mt-0.5">{activeItem.quiz.title}</h1>
                        </div>
                      </div>

                      <div className="prose dark:prose-invert max-w-none text-sm text-neutral-500 dark:text-neutral-400">
                        <p>{activeItem.quiz.description || "Take this assessment to review your comprehension of the syllabus material in this module. You must pass to proceed."}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                        <div className="p-4 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/40 dark:border-white/5">
                          <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block">Passing Threshold</span>
                          <span className="text-lg font-extrabold text-neutral-800 dark:text-neutral-200 mt-1 block">
                            {activeItem.quiz.min_passing_score || 70}% Passing Grade
                          </span>
                        </div>
                        <div className="p-4 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/40 dark:border-white/5">
                          <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block">Question Count</span>
                          <span className="text-lg font-extrabold text-neutral-800 dark:text-neutral-200 mt-1 block">
                            {questions.length} Quiz Questions
                          </span>
                        </div>
                        <div className="p-4 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/40 dark:border-white/5">
                          <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block">Max Grade Points</span>
                          <span className="text-lg font-extrabold text-neutral-800 dark:text-neutral-200 mt-1 block">
                            {questions.reduce((sum, q) => sum + (q.points || 1), 0)} Total Points
                          </span>
                        </div>
                      </div>

                      {questions.length === 0 ? (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-2xl text-xs flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">No questions configured.</span>
                            <span className="block mt-0.5">Please go back to the Assessment builder to add questions to this quiz before testing.</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setQuizStarted(true)}
                          className="w-full py-4 bg-[#A3D14B] hover:bg-[#A3D14B]/95 text-black font-black uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer border border-transparent"
                        >
                          <span>Begin Assessment</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                  ) : quizSubmitted ? (

                    /* QUIZ GRADING RESULTS SCREEN */
                    <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 space-y-6">

                      {quizPassed ? (
                        <div className="text-center space-y-3 py-6 relative">
                          {/* Success visuals */}
                          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-500 flex items-center justify-center mx-auto">
                            <Award className="w-8 h-8" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#A3D14B]">Assessment Cleared</span>
                          <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white">
                            Congratulations! You Passed
                          </h1>
                          <p className="text-xs text-neutral-500 dark:text-neutral-455 max-w-sm mx-auto">
                            You passed this module quiz. Your score has been updated in the course logs.
                          </p>
                        </div>
                      ) : (
                        <div className="text-center space-y-3 py-6">
                          <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/35 text-red-500 flex items-center justify-center mx-auto">
                            <ShieldAlert className="w-8 h-8" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Passing Score Not Reached</span>
                          <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white">
                            Syllabus Review Required
                          </h1>
                          <p className="text-xs text-neutral-500 dark:text-neutral-455 max-w-sm mx-auto">
                            Your score was below the required passing threshold. Review the lessons and try again.
                          </p>
                        </div>
                      )}

                      {/* Score display card */}
                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                        <div className="p-4 bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-white/5 rounded-2xl text-center">
                          <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Your Score</span>
                          <span className={cn(
                            "text-2xl font-black block mt-1",
                            quizPassed ? "text-emerald-500" : "text-red-500"
                          )}>
                            {quizScore}%
                          </span>
                        </div>
                        <div className="p-4 bg-neutral-100/50 dark:bg-neutral-900/50 border border-[#A3D14B]/10 rounded-2xl text-center">
                          <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Required Minimum</span>
                          <span className="text-2xl font-black text-neutral-800 dark:text-neutral-200 block mt-1">
                            {activeItem.quiz.min_passing_score || 70}%
                          </span>
                        </div>
                      </div>

                      {/* Quiz controls */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-100 dark:border-white/5">
                        <button
                          onClick={() => {
                            setQuizStarted(true);
                            setQuizSubmitted(false);
                            setQuizAnswers({});
                            setCurrentQuestionIndex(0);
                            setReviewMode(false);
                          }}
                          className="flex-1 py-3.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer text-neutral-800 dark:text-neutral-200"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Retake Quiz</span>
                        </button>

                        <button
                          onClick={() => {
                            setReviewMode(true);
                            setQuizSubmitted(false);
                          }}
                          className="flex-1 py-3.5 bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-transparent"
                        >
                          <span>Review Answers</span>
                        </button>
                      </div>

                    </div>

                  ) : reviewMode ? (

                    /* QUIZ REVIEW MODE */
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-5 md:p-6 flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-extrabold">Answer Key Review</h2>
                          <p className="text-xs text-neutral-450 dark:text-neutral-500">Check correct answers and explanations.</p>
                        </div>
                        <button
                          onClick={() => setQuizSubmitted(true)}
                          className="px-4 py-2 border border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Back to Results
                        </button>
                      </div>

                      <div className="space-y-4">
                        {questions.map((q, qIdx) => {
                          const userAns = quizAnswers[q.id] || "";
                          const isCorrect = userAns.toLowerCase().trim() === q.correct_answer.toLowerCase().trim();

                          return (
                            <div key={q.id} className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-5 md:p-6 space-y-4 font-sans">
                              <div className="flex items-start justify-between gap-3 border-b border-neutral-100 dark:border-white/5 pb-3">
                                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                  Question {qIdx + 1}: {q.text}
                                </span>
                                <span className={cn(
                                  "px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide shrink-0",
                                  isCorrect ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"
                                )}>
                                  {isCorrect ? "Correct" : "Incorrect"}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options && q.options.map((opt, optIdx) => {
                                  const letter = String.fromCharCode(65 + optIdx);
                                  const isSelected = userAns.toLowerCase().trim() === opt.toLowerCase().trim();
                                  const isCorrectOption = q.correct_answer.toLowerCase().trim() === opt.toLowerCase().trim();

                                  return (
                                    <div
                                      key={optIdx}
                                      className={cn(
                                        "p-3.5 rounded-xl border text-xs font-medium flex items-center gap-3",
                                        isCorrectOption
                                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                                          : isSelected
                                            ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
                                            : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200/50 dark:border-white/5 text-neutral-600 dark:text-neutral-455"
                                      )}
                                    >
                                      <div className={cn(
                                        "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0",
                                        isCorrectOption
                                          ? "bg-emerald-500 text-white"
                                          : isSelected
                                            ? "bg-red-500 text-white"
                                            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-350"
                                      )}>
                                        {letter}
                                      </div>
                                      <span>{opt}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  ) : (

                    /* ACTIVE QUIZ QUESTION RUNNER */
                    <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 space-y-6">

                      {/* Question progress and stats */}
                      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/5 pb-4 font-sans">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#A3D14B]">
                            Assessment Question
                          </span>
                          <h2 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mt-0.5">
                            Question {currentQuestionIndex + 1} of {questions.length}
                          </h2>
                        </div>
                        <span className="text-[10px] font-black uppercase text-[#A3D14B] bg-[#A3D14B]/10 px-2.5 py-0.5 rounded border border-[#A3D14B]/20">
                          {questions[currentQuestionIndex]?.points || 1} Points
                        </span>
                      </div>

                      {/* Question content */}
                      <div className="space-y-4">
                        <p className="text-sm md:text-base font-extrabold text-neutral-800 dark:text-neutral-100">
                          {questions[currentQuestionIndex]?.text}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {questions[currentQuestionIndex]?.options ? (
                            questions[currentQuestionIndex].options.map((opt, optIdx) => {
                              const letter = String.fromCharCode(65 + optIdx);
                              const isSelected = quizAnswers[questions[currentQuestionIndex].id] === opt;

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectOption(questions[currentQuestionIndex].id, opt)}
                                  className={cn(
                                    "p-4 rounded-2xl border text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
                                    isSelected
                                      ? "bg-[#A3D14B]/10 border-[#A3D14B] text-[#A3D14B]"
                                      : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200/80 dark:border-white/5 text-neutral-850 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-white/15"
                                  )}
                                >
                                  <div className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 transition-colors",
                                    isSelected
                                      ? "bg-[#A3D14B] text-black"
                                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-350"
                                  )}>
                                    {letter}
                                  </div>
                                  <span>{opt}</span>
                                </button>
                              );
                            })
                          ) : (
                            /* Text input fallback for short answer */
                            <div className="col-span-2 space-y-2">
                              <input
                                type="text"
                                placeholder="Type your answer here..."
                                value={quizAnswers[questions[currentQuestionIndex].id] || ""}
                                onChange={(e) => handleSelectOption(questions[currentQuestionIndex].id, e.target.value)}
                                className="w-full px-4 py-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:border-[#A3D14B] dark:text-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Question runner buttons */}
                      <div className="flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-white/5">
                        <button
                          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                          disabled={currentQuestionIndex === 0}
                          className="px-4 py-3 border border-neutral-300 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        {currentQuestionIndex < questions.length - 1 ? (
                          <button
                            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                            className="px-5 py-3 bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border border-transparent"
                          >
                            <span>Next</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={handleQuizSubmit}
                            className="px-6 py-3 bg-[#A3D14B] hover:bg-[#A3D14B]/90 text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border border-transparent"
                          >
                            <span>Submit Quiz</span>
                          </button>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Navigation footer fallback when quiz results/review are not loaded */}
                  {!quizStarted && (
                    <div className="pt-6 border-t border-neutral-200 dark:border-white/5 flex items-center justify-between gap-4">
                      <button
                        onClick={handlePrevItem}
                        disabled={currentPlayIndex === 0}
                        className="px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-white/10 hover:border-neutral-450 dark:hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer bg-transparent"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Prev</span>
                      </button>

                      <button
                        onClick={handleNextItem}
                        className="px-5 py-3 bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer border border-transparent"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                </div>

              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
