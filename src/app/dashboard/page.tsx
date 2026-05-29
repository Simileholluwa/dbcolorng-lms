"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/presentation/components/DashboardLayout";
import Loader from "@/presentation/components/ui/Loader";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { useLms } from "@/presentation/hooks/useLms";
import { useCourses } from "@/presentation/hooks/useCourses";
import { motion, AnimatePresence } from "framer-motion";
import { Course, Module } from "@/domain/entities/Course";
import {
  Search,
  BookOpen,
  Play,
  ArrowRight,
  Sparkles,
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Compass,
  GraduationCap,
  Layers
} from "lucide-react";

// Sub-component to load lessons dynamically for a curriculum module in the drawer
interface ModuleLessonsListProps {
  module: Module;
}

function ModuleLessonsList({ module }: ModuleLessonsListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { useGetModuleLessons } = useCourses();
  const { data: lessons = [], isLoading: lessonsLoading } = useGetModuleLessons(isOpen ? module.id : "");

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50/30 dark:bg-neutral-900/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 font-bold text-sm text-left hover:bg-neutral-100/50 dark:hover:bg-neutral-800/20 transition-colors cursor-pointer"
      >
        <span>{module.title}</span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-neutral-950 border-t border-neutral-200/50 dark:border-neutral-800/80 space-y-3">
          {lessonsLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                Syncing lessons...
              </span>
            </div>
          ) : lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-black/5 dark:border-white/5 text-[10px] font-black text-neutral-600 dark:text-neutral-400 flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {lesson.title}
                    </p>
                    {lesson.duration ? (
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                        {lesson.duration} min
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider py-1">
              No lessons defined yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Sub-component for the slide-out Course Curriculum Drawer
interface CourseSyllabusDrawerProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  isEnrolled: boolean;
  onEnroll: (courseId: string) => void;
  isEnrolling: boolean;
}

function CourseSyllabusDrawer({
  course,
  isOpen,
  onClose,
  isEnrolled,
  onEnroll,
  isEnrolling
}: CourseSyllabusDrawerProps) {
  const { useGetCourseModules } = useCourses();
  const { data: modules = [], isLoading: modulesLoading, isError: modulesError } = useGetCourseModules(isOpen ? course.id : "");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-500 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-lg h-full bg-white dark:bg-neutral-950 shadow-2xl flex flex-col z-10 border-l border-neutral-200/50 dark:border-neutral-800/80 animate-slide-in">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200/50 dark:border-neutral-800/80 flex-shrink-0">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              {course.category}
            </span>
            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 mt-2 line-clamp-1">
              {course.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {/* Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              About this course
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Curriculum */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Course Syllabus
            </h3>

            {modulesLoading ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800/80 space-y-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                  Syncing Curriculum...
                </p>
              </div>
            ) : modulesError ? (
              <div className="text-center py-8 rounded-2xl border border-dashed border-red-200 dark:border-red-900/50 text-red-500 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  Failed to load syllabus
                </p>
                <p className="text-[10px] text-neutral-500">
                  Please restart the backend server to apply updates.
                </p>
              </div>
            ) : modules.length > 0 ? (
              <div className="space-y-3">
                {modules.map((module) => (
                  <ModuleLessonsList key={module.id} module={module} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                  Syllabus is empty
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Action Bottom bar */}
        <div className="p-6 border-t border-neutral-200/50 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/20 flex-shrink-0">
          {isEnrolled ? (
            <Link
              href={`/courses/${course.id}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-black dark:text-white font-extrabold uppercase tracking-wider text-sm hover:scale-[1.01] transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Resume Learning
            </Link>
          ) : (
            <button
              onClick={() => onEnroll(course.id)}
              disabled={isEnrolling}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-extrabold uppercase tracking-wider text-sm hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  Enroll in Course
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const { useGetEnrollments } = useLms();
  const { useGetAllCourses, enrollInCourseMutation } = useCourses();

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useGetEnrollments();
  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses
  } = useGetAllCourses();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Selected course for the curriculum drawer
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  if (coursesLoading || enrollmentsLoading) {
    return (
      <DashboardLayout>
        <Loader fullScreen size={120} />
      </DashboardLayout>
    );
  }

  // Dynamic filter category pills derived from course list
  const categories = ["All", ...Array.from(new Set(courses.map((c) => c.category)))];

  // Filtering logic
  const filteredCourses = courses.filter((course) => {
    const matchesCategory = activeCategory === "All" || course.category === activeCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEnroll = (courseId: string) => {
    enrollInCourseMutation.mutate(courseId, {
      onSuccess: () => {
        // Keep drawer open but update CTA state to "Resume learning"
        refetchCourses();
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-8 animate-fade-in">

        {/* Top Header & Filter Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-8 pb-4 md:pb-0 items-stretch">

          {/* Hero Header Section */}
          <div className="lg:col-span-3 text-neutral-900 dark:text-neutral-100 overflow-hidden flex flex-col justify-center">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Explore Curated Courses
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                Discover self-paced color theory classes, design workshops, and space planning curricula tailored for professionals in interior design.
              </p>
            </div>
          </div>

          {/* Filter Toolbar (Search + Category Select) */}
          <div className="lg:col-span-2 flex flex-row items-center gap-3 relative z-30">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses by name or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-lg focus:outline-none focus:border-neutral-400 focus:bg-white dark:focus:bg-black transition-all text-neutral-800 dark:text-neutral-100 text-sm font-medium"
              />
            </div>

            {/* Category Select Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-lg text-neutral-600 dark:text-neutral-300 focus:outline-none flex items-center justify-center cursor-pointer transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 relative w-13 h-13"
                title="Filter by Category"
              >
                <Layers className="w-5 h-5" />
                {activeCategory !== "All" && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border border-white dark:border-neutral-900" />
                )}
              </button>

              <AnimatePresence>
                {isCategoryDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-xl shadow-xl py-1.5 z-50 focus:outline-none max-h-60 overflow-y-auto"
                    >
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all ${activeCategory === cat
                            ? "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white"
                            : "text-neutral-600 dark:text-neutral-450 hover:bg-neutral-50 dark:hover:bg-neutral-900/65"
                            }`}
                        >
                          {cat === "All" ? "All Categories" : cat}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Catalog Grid */}
        {coursesError ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-red-500/5 rounded-2xl border border-red-500/10 text-red-500 max-w-md mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 stroke-1" />
            <h3 className="font-extrabold text-lg">Failed to load courses</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We encountered a connection issue fetching the course catalog. Check if the server is responsive.
            </p>
            <button
              onClick={() => refetchCourses()}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const enrollment = enrollments.find((e) => e.course_id === course.id);
              const isEnrolled = !!enrollment;

              return (
                <div
                  key={course.id}
                  className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
                >
                  {/* Thumbnail / abstract banner */}
                  <div className="relative h-40 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                    {course.thumbnail_url ? (
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-neutral-900 to-neutral-950 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
                        <span className="text-xs font-extrabold uppercase tracking-widest text-white text-center">
                          {course.category}
                        </span>
                      </div>
                    )}

                    {/* Category overlay label */}
                    <span className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm border border-white/5">
                      {course.category}
                    </span>

                    {/* Enrollment Status indicator */}
                    {isEnrolled && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 bg-green-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-sm border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        Enrolled
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors line-clamp-1 text-base leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Actions block */}
                    <div className="flex items-center gap-3 mt-auto">

                      {/* View details (Curriculum) */}
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="flex-1 py-2.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer text-center"
                      >
                        Syllabus
                      </button>

                      {/* Primary CTA */}
                      {isEnrolled ? (
                        <Link
                          href={`/courses/${course.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-neutral-950 hover:bg-black dark:bg-neutral-800/40 dark:hover:bg-primary/10 dark:hover:text-primary text-white border border-black/10 dark:border-white/5 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Resume
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollInCourseMutation.isPending}
                          className="flex-1 py-2.5 px-3 rounded-lg bg-neutral-950 hover:bg-black dark:bg-neutral-800/40 dark:hover:bg-primary/10 dark:hover:text-primary text-white border border-black/10 dark:border-white/5 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          {enrollInCourseMutation.isPending ? "Enrolling..." : "Enroll"}
                        </button>
                      )}

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 max-w-sm mx-auto">
            <BookOpen className="w-12 h-12 text-neutral-300 dark:text-neutral-700 stroke-1" />
            <h3 className="font-extrabold text-neutral-800 dark:text-neutral-250">No courses match your query</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We couldn't find any design courses matching "{searchQuery}" or the active category pill. Try resetting your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="text-xs font-extrabold uppercase tracking-widest text-primary hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* Curriculum Preview Drawer (renders if selectedCourse is active) */}
      {selectedCourse && (
        <CourseSyllabusDrawer
          course={selectedCourse}
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          isEnrolled={enrollments.some((e) => e.course_id === selectedCourse.id)}
          onEnroll={handleEnroll}
          isEnrolling={enrollInCourseMutation.isPending}
        />
      )}
    </DashboardLayout>
  );
}
