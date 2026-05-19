"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Plus,
  Save,
  Trash2,
  PlayCircle,
  FileText,
  BookOpenCheck,
  ChevronRight,
  ChevronDown,
  Loader2,
  FolderOpen,
  Edit3,
  X
} from "lucide-react";
import { useAdmin } from "@/presentation/hooks/useAdmin";
import DashboardLayout from "@/presentation/components/DashboardLayout";
import { Module } from "@/domain/entities/Module";
import { Lesson } from "@/domain/entities/Lesson";
import { motion, AnimatePresence } from "framer-motion";

interface CurriculumPageProps {
  params: Promise<{ id: string }>;
}

type EditorMode =
  | { type: "idle" }
  | { type: "create-module" }
  | { type: "edit-module"; module: Module }
  | { type: "create-lesson"; moduleId: string }
  | { type: "edit-lesson"; lesson: Lesson; moduleId: string };

export default function CurriculumPage({ params }: CurriculumPageProps) {
  const router = useRouter();

  // Resolve params asynchronously for Next.js 15+
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const {
    useGetCourseById,
    useGetModulesByCourse,
    useGetLessonsByModule,
    createModule,
    isCreatingModule,
    updateModule,
    isUpdatingModule,
    deleteModule,
    isDeletingModule,
    createLesson,
    isCreatingLesson,
    updateLesson,
    isUpdatingLesson,
    deleteLesson,
    isDeletingLesson
  } = useAdmin();

  // Fetch course info
  const { data: course, isLoading: loadingCourse } = useGetCourseById(courseId);
  // Fetch modules
  const { data: modules = [], isLoading: loadingModules } = useGetModulesByCourse(courseId);

  // UI state for accordion (expanded module IDs)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  // Selected active item state in the editor pane
  const [editorMode, setEditorMode] = useState<EditorMode>({ type: "idle" });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (isMobile && editorMode.type !== "idle") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, editorMode]);

  const hasInitializedAccordion = useRef(false);

  // Keep the first accordion open by default when modules are loaded
  useEffect(() => {
    if (modules.length > 0 && !hasInitializedAccordion.current) {
      const sorted = [...modules].sort((a, b) => a.order - b.order);
      setExpandedModules({ [sorted[0].id]: true });
      hasInitializedAccordion.current = true;
    }
  }, [modules]);

  // Track lessons by module ID using a local state map
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({});

  // Sub-component to fetch lessons reactively for each expanded module
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Form input states
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleOrder, setModuleOrder] = useState(1);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonOrder, setLessonOrder] = useState(1);
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonPdfUrl, setLessonPdfUrl] = useState("");
  const [lessonBodyText, setLessonBodyText] = useState("");
  const [lessonDurationMinutes, setLessonDurationMinutes] = useState(10);

  // Sync inputs when editor mode changes
  useEffect(() => {
    if (editorMode.type === "edit-module") {
      setModuleTitle(editorMode.module.title);
      setModuleDescription(editorMode.module.description || "");
      setModuleOrder(editorMode.module.order);
    } else if (editorMode.type === "create-module") {
      setModuleTitle("");
      setModuleDescription("");
      // Suggest next order number
      const nextOrder = modules.length > 0 ? Math.max(...modules.map(m => m.order)) + 1 : 1;
      setModuleOrder(nextOrder);
    } else if (editorMode.type === "edit-lesson") {
      setLessonTitle(editorMode.lesson.title);
      setLessonOrder(editorMode.lesson.order);
      setLessonVideoUrl(editorMode.lesson.video_url || "");
      setLessonPdfUrl(editorMode.lesson.pdf_url || "");
      setLessonBodyText(editorMode.lesson.body_text || "");
      setLessonDurationMinutes(Math.round((editorMode.lesson.duration_seconds || 0) / 60) || 10);
    } else if (editorMode.type === "create-lesson") {
      setLessonTitle("");
      setLessonVideoUrl("");
      setLessonPdfUrl("");
      setLessonBodyText("");
      setLessonDurationMinutes(10);
      setLessonOrder(1);
    }
  }, [editorMode, modules]);

  // Handle Module Submission
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    const payload = {
      title: moduleTitle,
      order: Number(moduleOrder),
      description: moduleDescription || undefined,
    };

    try {
      if (editorMode.type === "create-module") {
        await createModule({ courseId, data: payload });
        setEditorMode({ type: "idle" });
      } else if (editorMode.type === "edit-module") {
        await updateModule({
          moduleId: editorMode.module.id,
          data: payload,
          courseId
        });
        setEditorMode({ type: "idle" });
      }
    } catch (err) {
    }
  };

  // Handle Module Delete
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module? This will also remove all nested lessons!")) return;
    try {
      await deleteModule({ moduleId, courseId });
      setEditorMode({ type: "idle" });
    } catch (err) {
    }
  };

  // Handle Lesson Submission
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    const payload = {
      title: lessonTitle,
      order: Number(lessonOrder),
      video_url: lessonVideoUrl || undefined,
      pdf_url: lessonPdfUrl || undefined,
      body_text: lessonBodyText || undefined,
      duration_seconds: Number(lessonDurationMinutes) * 60,
    };

    try {
      if (editorMode.type === "create-lesson") {
        await createLesson({ moduleId: editorMode.moduleId, data: payload });
        // Auto-expand module to see new lesson
        setExpandedModules(prev => ({ ...prev, [editorMode.moduleId]: true }));
        setEditorMode({ type: "idle" });
      } else if (editorMode.type === "edit-lesson") {
        await updateLesson({
          lessonId: editorMode.lesson.id,
          data: payload,
          moduleId: editorMode.moduleId
        });
        setEditorMode({ type: "idle" });
      }
    } catch (err) {
    }
  };

  // Handle Lesson Delete
  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await deleteLesson({ lessonId, moduleId });
      setEditorMode({ type: "idle" });
    } catch (err) {
    }
  };

  const renderFormContent = () => {
    return (
      <>
        {/* Form: Create or Edit Module */}
        {(editorMode.type === "create-module" || editorMode.type === "edit-module") && (
          <form onSubmit={handleSaveModule} className="space-y-4 flex-1 flex flex-col">
            {!isMobile && (
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-md">
                  {editorMode.type === "create-module" ? "Create Course Module" : "Edit Module Settings"}
                </h3>
                {editorMode.type === "edit-module" && (
                  <button
                    type="button"
                    onClick={() => handleDeleteModule(editorMode.module.id)}
                    disabled={isDeletingModule}
                    className="p-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center border border-red-200/20"
                    title="Delete Module"
                  >
                    {isDeletingModule ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4 pt-2 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Title */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Module Title</label>
                  <input
                    type="text"
                    required
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="e.g. Overview of Fundamentals"
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 focus:border-neutral-400 focus:bg-white dark:focus:bg-black rounded-lg focus:outline-none text-sm font-medium transition-all dark:text-white"
                  />
                </div>

                {/* Order & Custom Ordering */}
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={moduleOrder}
                    onChange={(e) => setModuleOrder(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 focus:border-neutral-400 focus:bg-white dark:focus:bg-black rounded-lg focus:outline-none text-sm font-medium transition-all dark:text-white"
                  />
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 -mt-2">Controls the sequence order in which this module is displayed to learners.</p>

                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Overview Summary</label>
                <textarea
                  rows={4}
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  placeholder="Brief summary of what this module covers..."
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 focus:border-neutral-400 focus:bg-white dark:focus:bg-black rounded-lg focus:outline-none text-sm font-medium transition-all resize-none dark:text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditorMode({ type: "idle" })}
                className="px-4 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-bold hover:text-black dark:hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingModule || isUpdatingModule}
                className="flex items-center gap-2 px-5 py-3 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-lg text-sm disabled:bg-opacity-50 transition-all cursor-pointer"
              >
                {(isCreatingModule || isUpdatingModule) ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Module Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* Form: Create or Edit Lesson */}
        {(editorMode.type === "create-lesson" || editorMode.type === "edit-lesson") && (
          <form onSubmit={handleSaveLesson} className="flex-1 flex flex-col">
            {!isMobile && (
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-md">
                  {editorMode.type === "create-lesson" ? "Add Lesson Resource" : "Edit Lesson Settings"}
                </h3>
                {editorMode.type === "edit-lesson" && (
                  <button
                    type="button"
                    onClick={() => handleDeleteLesson(editorMode.lesson.id, editorMode.moduleId)}
                    disabled={isDeletingLesson}
                    className="p-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center border border-red-200/20"
                    title="Delete Lesson"
                  >
                    {isDeletingLesson ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4 pt-2 md:pt-4 flex-1 overflow-y-auto max-h-[500px] scrollbar-hide">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Introduction to Variables"
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 focus:border-neutral-400 focus:bg-white dark:focus:bg-black rounded-lg focus:outline-none text-sm font-medium transition-all dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pb-2">
                {/* Order */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 focus:border-neutral-400 focus:bg-white dark:focus:bg-black rounded-lg focus:outline-none text-sm font-medium transition-all dark:text-white"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Estimated Duration (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={lessonDurationMinutes}
                    onChange={(e) => setLessonDurationMinutes(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 focus:border-neutral-400 focus:bg-white dark:focus:bg-black rounded-lg focus:outline-none text-sm font-medium transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Resources section */}
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200/60 dark:border-white/5 space-y-4">
                <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block border-b border-neutral-200/60 dark:border-white/5 pb-2">
                  Resource Delivery Options
                </span>

                {/* Video URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
                    <PlayCircle className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                    <span>Video Handout URL (Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="e.g. https://youtube.com/embed/..."
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 focus:outline-none focus:border-neutral-400 text-xs font-medium dark:text-white"
                  />
                </div>

                {/* PDF URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                    <span>PDF Reading Attachment (Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={lessonPdfUrl}
                    onChange={(e) => setLessonPdfUrl(e.target.value)}
                    placeholder="e.g. https://example.com/handouts/l1.pdf"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 focus:outline-none focus:border-neutral-400 text-xs font-medium dark:text-white"
                  />
                </div>
              </div>

              {/* Body Text */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Lesson Body & Notes Content</label>
                <textarea
                  rows={6}
                  value={lessonBodyText}
                  onChange={(e) => setLessonBodyText(e.target.value)}
                  placeholder="Write dynamic reading notes, code snippets, or additional text instructions here..."
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 focus:border-neutral-400 focus:bg-white dark:focus:bg-black rounded-lg focus:outline-none text-xs font-mono transition-all resize-none dark:text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setEditorMode({ type: "idle" })}
                className="px-4 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-bold hover:text-black dark:hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingLesson || isUpdatingLesson}
                className="flex items-center gap-2 px-5 py-3 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-lg text-sm disabled:bg-opacity-50 transition-all cursor-pointer"
              >
                {(isCreatingLesson || isUpdatingLesson) ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Lesson Settings</span>
              </button>
            </div>
          </form>
        )}
      </>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/admin/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Course Settings</span>
          </Link>
        </div>

        {/* Header Title */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-3">
            {course?.title || "Loading Course..."}
          </h1>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-1">
            Build and arrange modules, manage lesson resources, and design interactive reading elements.
          </p>
        </div>

        {/* Master Details Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* LEFT COLUMN: Modules & Syllabus Structure */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-lg p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-md">Course Structure</h3>
                </div>
                <button
                  onClick={() => setEditorMode({ type: "create-module" })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black font-extrabold rounded-full text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Module</span>
                </button>
              </div>

              {loadingModules ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#A3D14B] animate-spin" />
                  <p className="mt-2 text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Loading syllabus...</p>
                </div>
              ) : modules.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-neutral-100 dark:border-white/10 rounded-lg p-4">
                  <FolderOpen className="w-8 h-8 text-neutral-350 dark:text-neutral-650 mx-auto mb-2" />
                  <h4 className="text-base font-extrabold text-neutral-700 dark:text-neutral-300">Syllabus is Empty</h4>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1 mx-auto">
                    Get started by creating your first instructional module using the button above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {modules.map((mod) => (
                    <ModuleAccordionItem
                      key={mod.id}
                      module={mod}
                      isExpanded={!!expandedModules[mod.id]}
                      onToggle={() => toggleModule(mod.id)}
                      onSelectEdit={() => setEditorMode({ type: "edit-module", module: mod })}
                      onAddLesson={() => setEditorMode({ type: "create-lesson", moduleId: mod.id })}
                      onSelectLesson={(lesson) => setEditorMode({ type: "edit-lesson", lesson, moduleId: mod.id })}
                      activeEditorMode={editorMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Dynamic Workspace Context Form */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-lg p-4 shadow-xs min-h-[400px] flex flex-col">

              {editorMode.type === "idle" && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <Edit3 className="w-8 h-8 text-neutral-350 dark:text-neutral-650 mx-auto mb-2" />
                  <h3 className="text-base font-extrabold text-neutral-700 dark:text-neutral-300">Curriculum Workspace</h3>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-lg mt-1">
                    Select a module header or lesson card from your syllabus to edit details, or create new structures from the controls.
                  </p>
                </div>
              )}

              {editorMode.type !== "idle" && renderFormContent()}

            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobile && editorMode.type !== "idle" && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditorMode({ type: "idle" })}
              className="fixed inset-0 bg-black z-200 lg:hidden"
            />
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-x-0 bottom-0 max-h-[90vh] bg-white dark:bg-neutral-950 rounded-t-3xl border-t border-black/10 dark:border-white/10 shadow-2xl z-200 flex flex-col lg:hidden"
            >
              {/* Header Handle */}
              <div className="relative flex items-center justify-between pr-2 pl-4 pt-5 pb-3 border-b border-black/5 dark:border-white/5 shrink-0">
                <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-800 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
                <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-base mt-2">
                  {editorMode.type === "create-module" && "Create Course Module"}
                  {editorMode.type === "edit-module" && "Edit Module Settings"}
                  {editorMode.type === "create-lesson" && "Add Lesson Resource"}
                  {editorMode.type === "edit-lesson" && "Edit Lesson Settings"}
                </h3>
                <div className="flex items-center gap-2">
                  {editorMode.type === "edit-module" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(editorMode.module.id)}
                      disabled={isDeletingModule}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                      title="Delete Module"
                    >
                      {isDeletingModule ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  {editorMode.type === "edit-lesson" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(editorMode.lesson.id, editorMode.moduleId)}
                      disabled={isDeletingLesson}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                      title="Delete Lesson"
                    >
                      {isDeletingLesson ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditorMode({ type: "idle" })}
                    className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 pb-5 scrollbar-hide">
                {renderFormContent()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

/* 
  Subcomponent to render individual module accordion lists reactively
*/
interface ModuleAccordionItemProps {
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectEdit: () => void;
  onAddLesson: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  activeEditorMode: EditorMode;
}

function ModuleAccordionItem({
  module,
  isExpanded,
  onToggle,
  onSelectEdit,
  onAddLesson,
  onSelectLesson,
  activeEditorMode
}: ModuleAccordionItemProps) {
  const { useGetLessonsByModule } = useAdmin();
  const { data: lessons = [], isLoading: loadingLessons } = useGetLessonsByModule(module.id);

  // Determine if this specific module is actively selected in the editor
  const isModuleActiveInEditor =
    activeEditorMode.type === "edit-module" && activeEditorMode.module.id === module.id;

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${isModuleActiveInEditor
      ? "border-[#A3D14B] ring-2 ring-[#A3D14B]/10 bg-white dark:bg-neutral-950"
      : "border-neutral-200/70 dark:border-white/5 bg-neutral-50/20 dark:bg-neutral-900/10"
      }`}>
      {/* Module Title Accordion Bar */}
      <div className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
        <div className="flex items-center gap-2.5 flex-1 min-w-0" onClick={onToggle}>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-550 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-550 shrink-0" />
          )}
          <div className="min-w-0">
            <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
              Module {module.order}
            </span>
            <span className="font-extrabold text-neutral-800 dark:text-neutral-200 text-sm block mt-0.5">
              {module.title}
            </span>
          </div>
        </div>

        {/* Small configuration actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onSelectEdit}
            title="Edit module settings"
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 dark:text-neutral-550 hover:text-black dark:hover:text-white transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onAddLesson}
            title="Add lesson to module"
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-lg text-[#A3D14B] hover:bg-[#A3D14B]/10 transition-colors"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Expanded Lessons Area */}
      {isExpanded && (
        <div className="border-t border-neutral-100 dark:border-white/5 bg-white dark:bg-neutral-950 p-3 space-y-2">
          {loadingLessons ? (
            <div className="flex items-center gap-2 justify-center py-4">
              <Loader2 className="w-4 h-4 text-[#A3D14B] animate-spin" />
              <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Loading lessons...</span>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-4 text-neutral-400 dark:text-neutral-500 text-[10px] font-bold uppercase tracking-wider border border-dashed border-neutral-100 dark:border-white/5 rounded-xl">
              No lessons added yet.
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => {
                // Determine if this specific lesson is currently open in editor
                const isLessonActive =
                  activeEditorMode.type === "edit-lesson" && activeEditorMode.lesson.id === lesson.id;

                // Pick custom visual icon based on lesson fields
                let LessonIcon = BookOpenCheck;
                if (lesson.video_url) LessonIcon = PlayCircle;
                else if (lesson.pdf_url) LessonIcon = FileText;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer select-none transition-all ${isLessonActive
                      ? "bg-[#A3D14B]/10 dark:bg-[#A3D14B]/5 border-[#A3D14B] hover:bg-[#A3D14B]/15 dark:hover:bg-[#A3D14B]/10"
                      : "bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-100 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-neutral-950 hover:border-neutral-200 dark:hover:border-white/10"
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <LessonIcon className={`w-4 h-4 shrink-0 ${isLessonActive ? "text-[#A3D14B]" : "text-neutral-400 dark:text-neutral-500"
                        }`} />
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 truncate line-clamp-2">
                        {lesson.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                        {Math.round((lesson.duration_seconds || 0) / 60)}m
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
