"use client";

import React, { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Eye,
  BookOpen,
  Layers,
  Trophy,
  Save,
  Settings,
  HelpCircle,
  Play,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAdmin } from "@/presentation/hooks/useAdmin";
import DashboardLayout from "@/presentation/components/DashboardLayout";
import { useQueries } from "@tanstack/react-query";
import { HttpAdminRepository } from "@/infrastructure/repositories/HttpAdminRepository";

const adminRepository = new HttpAdminRepository();

// Zod Validation Schema
const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  category: z.string().min(2, "Category must be at least 2 characters long"),
  thumbnail_url: z.string().url("Must be a valid URL").or(z.literal("")),
  status: z.enum(["draft", "published"]),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  const router = useRouter();

  // Resolve params asynchronously for Next.js 15+
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const { useGetCourseById, updateCourse, isUpdating, useGetModulesByCourse } = useAdmin();

  // Fetch course details
  const { data: course, isLoading, error } = useGetCourseById(courseId);

  // Fetch modules list to display preview if available
  const { data: modules = [], isLoading: isModulesLoading } = useGetModulesByCourse(courseId);

  // Fetch quizzes for both the course and all its modules using parallel queries
  const allTargets = React.useMemo(() => {
    return [
      { id: courseId, title: "Course Final Exam" },
      ...(modules || []).map((m) => ({ id: m.id, title: m.title }))
    ];
  }, [courseId, modules]);

  const quizzesQueries = useQueries({
    queries: allTargets.map((target) => ({
      queryKey: ["admin-quizzes-preview", target.id],
      queryFn: () => adminRepository.getQuizzesByTarget(target.id),
      enabled: !!target.id,
    })),
  });

  const quizzes = React.useMemo(() => {
    return quizzesQueries.flatMap((q) => q.data || []);
  }, [quizzesQueries]);

  const isQuizzesLoading = React.useMemo(() => {
    return quizzesQueries.some((q) => q.isLoading);
  }, [quizzesQueries]);

  // React Hook Form Configuration
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      thumbnail_url: "",
      status: "draft",
    },
  });

  // Populate form values when course data is loaded
  useEffect(() => {
    if (course) {
      setValue("title", course.title);
      setValue("description", course.description);
      setValue("category", course.category);
      setValue("thumbnail_url", course.thumbnail_url || "");
      setValue("status", (course.status as "draft" | "published") || "draft");
    }
  }, [course, setValue]);

  // Form Submission
  const onSubmit = async (values: CourseFormValues) => {
    try {
      const payload = {
        ...values,
        thumbnail_url: values.thumbnail_url || undefined,
      };
      await updateCourse({
        id: courseId,
        data: payload,
      });
    } catch (err) {
      // Error notify handled in useAdmin hook
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg dark:bg-neutral-950 border border-black/5 dark:border-white/5">
            <Loader2 className="w-10 h-10 text-[#A3D14B] animate-spin" />
            <p className="mt-4 text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase text-xs">Loading course details...</p>
          </div>
        ) : error || !course ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/50 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h4 className="mt-4 font-bold text-red-900 dark:text-red-200 text-lg">Course Not Found</h4>
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 max-w-xs">
              The course you are trying to access does not exist or has been removed.
            </p>
            <Link
              href="/dashboard/admin"
              className="mt-6 px-6 py-2.5 bg-neutral-800 dark:bg-neutral-700 text-white font-bold rounded-xl text-xs hover:bg-black dark:hover:bg-neutral-600 transition-all"
            >
              Return to Control Panel
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header info */}
            <div className="pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-black/5 dark:border-white/5">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                  <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-900 rounded-full text-xs font-black text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/5 uppercase tracking-wider">
                    {course.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${course.status === "published"
                    ? "bg-[#A3D14B]/15 text-[#A3D14B] border border-[#A3D14B]/20"
                    : course.status === "draft" ? "bg-yellow-500/15 text-yellow-500 border border-yellow-500/20" :
                      "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-white/5"
                    }`}>
                    {course.status}
                  </span>
                </div>
              </div>

              <div>
                <Link
                  href={`/dashboard/admin/courses/${courseId}/preview`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-250 dark:border-white/10 hover:border-neutral-350 dark:hover:border-white/20 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Course</span>
                </Link>
              </div>
            </div>

            {/* Content Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: Form Editor */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                    <Settings className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                    <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-md">General Course Settings</h3>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Course Title</label>
                        <input
                          type="text"
                          {...register("title")}
                          className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:outline-none focus:bg-white dark:focus:bg-black text-sm font-medium transition-all ${errors.title ? "border-red-300 focus:border-red-500" : "border-neutral-200/80 dark:border-white/5 focus:border-neutral-400"
                            } dark:text-white`}
                        />
                        {errors.title && (
                          <p className="text-red-500 text-xs font-semibold">{errors.title.message}</p>
                        )}
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Category</label>
                        <input
                          type="text"
                          {...register("category")}
                          className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:outline-none focus:bg-white dark:focus:bg-black text-sm font-medium transition-all ${errors.category ? "border-red-300 focus:border-red-500" : "border-neutral-200/80 dark:border-white/5 focus:border-neutral-400"
                            } dark:text-white`}
                        />
                        {errors.category && (
                          <p className="text-red-500 text-xs font-semibold">{errors.category.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Course Description</label>
                      <textarea
                        rows={4}
                        {...register("description")}
                        className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:outline-none focus:bg-white dark:focus:bg-black text-sm font-medium transition-all resize-none ${errors.description ? "border-red-300 focus:border-red-500" : "border-neutral-200/80 dark:border-white/5 focus:border-neutral-400"
                          } dark:text-white`}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs font-semibold">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Cover Thumbnail URL</label>
                      <input
                        type="text"
                        {...register("thumbnail_url")}
                        className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:outline-none focus:bg-white dark:focus:bg-black text-sm font-medium transition-all ${errors.thumbnail_url ? "border-red-300 focus:border-red-500" : "border-neutral-200/80 dark:border-white/5 focus:border-neutral-400"
                          } dark:text-white`}
                      />
                      {errors.thumbnail_url && (
                        <p className="text-red-500 text-xs font-semibold">{errors.thumbnail_url.message}</p>
                      )}
                    </div>

                    {/* Status Toggle */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Publishing State</label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200/80 dark:border-white/5 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 cursor-pointer select-none">
                          <div>
                            <span className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200">Draft</span>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">Visible only to administrators</p>
                          </div>
                          <input
                            type="radio"
                            value="draft"
                            {...register("status")}
                            className="w-4 h-4 accent-[#A3D14B]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200/80 dark:border-white/5 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 cursor-pointer select-none">
                          <div>
                            <span className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200">Publish</span>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">Make available to learners</p>
                          </div>
                          <input
                            type="radio"
                            value="published"
                            {...register("status")}
                            className="w-4 h-4 accent-[#A3D14B]"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-6 py-4 bg-black text-white dark:bg-white dark:text-black font-extrabold rounded-lg text-sm disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Course Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Previews for Phase 2 & 3 */}
              <div className="space-y-4">
                {/* Phase 2: Curriculum Preview */}
                <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-lg p-4 shadow-xs group">
                  <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4">
                    <Layers className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                    <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-md">Course Syllabus</h3>
                  </div>

                  {isModulesLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 border border-neutral-100 dark:border-white/5 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
                      <Loader2 className="w-5 h-5 text-neutral-450 dark:text-neutral-500 animate-spin" />
                      <p className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest mt-2">Loading Syllabus Preview...</p>
                    </div>
                  ) : modules && modules.length > 0 ? (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pt-4 scrollbar-hide pr-1">
                      {modules.map((mod, idx) => (
                        <div
                          key={mod.id}
                          className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-white/5 rounded-xl hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 transition-all"
                        >
                          <div className="flex items-center justify-center w-6 h-6 bg-black dark:bg-white text-white dark:text-black font-black text-[10px] rounded-lg shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate">
                              {mod.title}
                            </h4>
                            {mod.description && (
                              <p className="text-xs text-neutral-400 dark:text-neutral-550 mt-0.5 line-clamp-2">
                                {mod.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 mt-4 text-center border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-lg p-4">
                      <BookOpen className="w-8 h-8 text-neutral-350 dark:text-neutral-650 mx-auto mb-2" />
                      <h4 className="text-base font-extrabold text-neutral-700 dark:text-neutral-300">Curriculum Builder</h4>
                      <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs mx-auto">
                        Build syllabus structure, create modules, and add video or reading lessons.
                      </p>
                    </div>
                  )}

                  <Link
                    href={`/dashboard/admin/courses/${courseId}/curriculum`}
                    className="w-full mt-4 py-4 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Open Curriculum Builder</span>
                  </Link>
                </div>

                {/* Phase 3: Quizzes Preview */}
                <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-lg p-4 shadow-xs group">
                  <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4">
                    <Trophy className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                    <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-md">Quizzes & Grading</h3>
                  </div>

                  {isQuizzesLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 border border-neutral-100 dark:border-white/5 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
                      <Loader2 className="w-5 h-5 text-neutral-450 dark:text-neutral-500 animate-spin" />
                      <p className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest mt-2">Loading Quizzes Preview...</p>
                    </div>
                  ) : quizzes && quizzes.length > 0 ? (
                    <div className="space-y-3 max-h-[350px] pt-4 overflow-y-auto pr-1 scrollbar-hide">
                      {quizzes.map((quiz, idx) => (
                        <div
                          key={quiz.id}
                          className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-white/5 rounded-xl hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 line-clamp-2">
                              {quiz.title}
                            </h4>
                            <p className="text-xs text-neutral-400 dark:text-neutral-550 mt-0.5 line-clamp-2">
                              {quiz.min_passing_score}% passing score. {quiz.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 mt-4 text-center border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-lg p-4">
                      <HelpCircle className="w-8 h-8 text-neutral-350 dark:text-neutral-650 mx-auto mb-2" />
                      <h4 className="text-base font-extrabold text-neutral-700 dark:text-neutral-300">Assessment Builder</h4>
                      <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs mx-auto">
                        Design multiple choice assessments, set passing grades, and issue graduation certificates.
                      </p>
                    </div>
                  )}

                  <Link
                    href={`/dashboard/admin/courses/${courseId}/assessment`}
                    className="w-full mt-4 py-4 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Open Assessment Builder</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
