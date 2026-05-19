"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  Layers,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  Trash2
} from "lucide-react";
import { useAdmin } from "@/presentation/hooks/useAdmin";
import DashboardLayout from "@/presentation/components/DashboardLayout";
import { Course } from "@/domain/entities/Course";
import { Button } from "@/presentation/components/ui/Button";
import { Dialog } from "@/presentation/components/ui/Dialog";

// Form Validation Schema using Zod
const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  category: z.string().min(2, "Category must be at least 2 characters long"),
  thumbnail_url: z.string().url("Must be a valid URL").or(z.literal("")),
  status: z.enum(["draft", "published"]),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    useGetCourses,
    createCourse,
    updateCourse,
    isCreating,
    deleteCourse,
    isDeletingCourse,
    isUpdating
  } = useAdmin();

  // React Query fetch
  const { data, isLoading, error } = useGetCourses();
  const courses = data?.items || [];

  // State Management
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "delete" | "publish" | "unpublish";
    course: Course | null;
  }>({
    isOpen: false,
    type: "delete",
    course: null,
  });

  const isActionPending = confirmModal.type === "delete" ? isDeletingCourse : isUpdating;

  // React Hook Form Configuration
  const {
    register,
    handleSubmit,
    reset,
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

  // Unique categories for filtering
  const categories = useMemo(() => {
    const cats = courses.map((c) => c.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [courses]);

  // Statistics Calculations
  const stats = useMemo(() => {
    return {
      total: courses.length,
      published: courses.filter((c) => c.status === "published").length,
      drafts: courses.filter((c) => c.status === "draft").length,
    };
  }, [courses]);

  // Filtered & Searched Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || course.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || course.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [courses, searchQuery, statusFilter, categoryFilter]);

  // Form Submission for New Course
  const onSubmit = async (values: CourseFormValues) => {
    try {
      const payload = {
        ...values,
        thumbnail_url: values.thumbnail_url || undefined,
      };
      await createCourse(payload);
      setIsDrawerOpen(false);
      reset();
    } catch (err) {
    }
  };

  // Action Request Handlers
  const requestDeleteCourse = (course: Course) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      course,
    });
  };

  const requestTogglePublish = (course: Course) => {
    setConfirmModal({
      isOpen: true,
      type: course.status === "published" ? "unpublish" : "publish",
      course,
    });
  };

  const executeConfirmAction = async () => {
    const { type, course } = confirmModal;
    if (!course) return;

    try {
      if (type === "delete") {
        await deleteCourse(course.id);
      } else {
        const newStatus = type === "publish" ? "published" : "draft";
        await updateCourse({
          id: course.id,
          data: { status: newStatus },
        });
      }
    } catch (err) {
    } finally {
      setConfirmModal({ isOpen: false, type: "delete", course: null });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Admin Control Center
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
              Manage courses, build custom curriculum modules, and administer LMS assessments.
            </p>
          </div>

          <Button
            onClick={() => {
              reset();
              setIsDrawerOpen(true);
            }}
            size="lg"
            className="w-full cursor-pointer md:w-auto dark:bg-white dark:text-black h-15 px-8 text-base font-bold shrink-0"
          >
            Create New Course
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-row gap-4 items-center justify-between w-full">
          {/* Search Input */}
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

          {/* Quick Filters */}
          <div className="flex items-center gap-3 relative z-30 shrink-0">
            {/* Status Select */}
            <div className="relative w-auto">
              {/* Desktop Button */}
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="hidden sm:flex px-4 py-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 focus:outline-none focus:border-neutral-400 items-center gap-2 cursor-pointer transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 whitespace-nowrap"
              >
                <span>
                  {statusFilter === "all"
                    ? `All Courses (${stats.total})`
                    : statusFilter === "published"
                      ? `Published (${stats.published})`
                      : `Drafts (${stats.drafts})`}
                </span>
                <ChevronDown className="w-4 h-4 text-neutral-400 transition-transform duration-200" style={{ transform: isStatusDropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* Mobile Icon Button */}
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="sm:hidden p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-lg text-neutral-600 dark:text-neutral-300 focus:outline-none flex items-center justify-center cursor-pointer transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 relative w-13 h-13"
                title="Filter by Status"
              >
                <SlidersHorizontal className="w-5 h-5" />
                {statusFilter !== "all" && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#A3D14B] rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {isStatusDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsStatusDropdownOpen(false)}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-xl shadow-xl py-1.5 z-50 focus:outline-none"
                    >
                      <button
                        onClick={() => {
                          setStatusFilter("all");
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between ${statusFilter === "all"
                          ? "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/65"
                          }`}
                      >
                        <span>All Courses</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-500 font-extrabold">{stats.total}</span>
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter("published");
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between ${statusFilter === "published"
                          ? "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white"
                          : "text-neutral-600 dark:text-neutral-450 hover:bg-neutral-50 dark:hover:bg-neutral-900/65"
                          }`}
                      >
                        <span>Published</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#A3D14B]/15 text-[#A3D14B] font-extrabold">{stats.published}</span>
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter("draft");
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between ${statusFilter === "draft"
                          ? "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/65"
                          }`}
                      >
                        <span>Drafts</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-500 font-extrabold">{stats.drafts}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Category Select */}
            <div className="relative w-auto">
              {/* Desktop Button */}
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="hidden sm:flex px-4 py-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 focus:outline-none focus:border-neutral-400 items-center gap-2 cursor-pointer transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 whitespace-nowrap"
              >
                <span>{categoryFilter === "all" ? "All Course Categories" : categoryFilter}</span>
                <ChevronDown className="w-4 h-4 text-neutral-400 transition-transform duration-200" style={{ transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* Mobile Icon Button */}
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="sm:hidden p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-lg text-neutral-600 dark:text-neutral-300 focus:outline-none flex items-center justify-center cursor-pointer transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 relative w-13 h-13"
                title="Filter by Category"
              >
                <Layers className="w-5 h-5" />
                {categoryFilter !== "all" && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#A3D14B] rounded-full" />
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
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-xl shadow-xl py-1.5 z-50 focus:outline-none"
                    >
                      <button
                        onClick={() => {
                          setCategoryFilter("all");
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-all ${categoryFilter === "all"
                          ? "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/65"
                          }`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setCategoryFilter(cat);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-all ${categoryFilter === cat
                            ? "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white"
                            : "text-neutral-655 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/65"
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Main Courses Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-neutral-950 rounded-3xl border border-black/5 dark:border-white/5">
            <Loader2 className="w-10 h-10 text-[#A3D14B] animate-spin" />
            <p className="mt-4 text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase text-xs">Loading Courses...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/50">
            <XCircle className="w-12 h-12 text-red-500" />
            <h4 className="mt-4 font-bold text-red-900 dark:text-red-200 text-lg">Error Loading Data</h4>
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">Make sure the backend server is running.</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-neutral-950 rounded-3xl border border-black/5 dark:border-white/5 p-8 text-center">
            <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-full text-neutral-400 dark:text-neutral-500 mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-neutral-700 dark:text-neutral-300 text-lg">No Courses Found</h4>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm max-w-sm mt-1">
              {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search filters or status selection parameters."
                : "Get started by building your first premium Learning Course!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-lg overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900/50">
                    <th className="px-6 py-4.5 text-xs uppercase font-extrabold tracking-wider text-neutral-400 dark:text-neutral-500">Course</th>
                    <th className="px-6 py-4.5 text-xs uppercase font-extrabold tracking-wider text-neutral-400 dark:text-neutral-500">Category</th>
                    <th className="px-6 py-4.5 text-xs uppercase font-extrabold tracking-wider text-neutral-400 dark:text-neutral-500">Status</th>
                    <th className="px-6 py-4.5 text-xs uppercase font-extrabold tracking-wider text-neutral-400 dark:text-neutral-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg bg-neutral-100 dark:bg-neutral-900 overflow-hidden border border-black/5 dark:border-white/5 flex-shrink-0 flex items-center justify-center text-neutral-800 dark:text-white font-black">
                            {course.thumbnail_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover text-xs" />
                            ) : (
                              course.title.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-base hover:text-black dark:hover:text-white transition-colors">
                              <Link href={`/dashboard/admin/courses/${course.id}`}>{course.title}</Link>
                            </h4>
                            <p className="text-neutral-400 dark:text-neutral-550 text-sm mt-1 line-clamp-2 max-w-md">{course.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3.5 py-1 bg-neutral-200 dark:bg-neutral-900 rounded-full text-xs font-bold text-neutral-600 dark:text-neutral-300">
                          {course.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${course.status === "published" ? "bg-[#A3D14B]" : course.status === "draft" ? "bg-yellow-500" : "bg-gray-400"}`} />
                          <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-700 dark:text-neutral-300">
                            {course.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/admin/courses/${course.id}`)}
                            className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-all cursor-pointer"
                            title="Edit Syllabus & Content"
                          >
                            <SlidersHorizontal className="w-4.5 h-4.5" />
                          </button>

                          <button
                            onClick={() => requestTogglePublish(course)}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${course.status === "published"
                              ? "text-yellow-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
                              : "text-[#A3D14B] hover:bg-[#A3D14B]/10"
                              }`}
                            title={course.status === "published" ? "Unpublish Course" : "Publish Course"}
                          >
                            {course.status === "published" ? <XCircle className="w-4.5 h-4.5" /> : <CheckCircle2 className="w-4.5 h-4.5" />}
                          </button>

                          <button
                            onClick={() => requestDeleteCourse(course)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Grid Card View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-lg p-4 shadow-xs space-y-4 hover:border-neutral-300 dark:hover:border-neutral-800 transition-all">
                  <div className="flex items-end gap-3">
                    <div className="w-14 h-14 rounded-lg bg-neutral-100 dark:bg-neutral-900 overflow-hidden border border-black/5 dark:border-white/5 flex-shrink-0 flex items-center justify-center text-neutral-800 dark:text-white font-black">
                      {course.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        course.title.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
                      {/* Category */}
                      <span className="px-2.5 py-1 bg-neutral-200 dark:bg-neutral-900 rounded-full text-[9px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                        {course.category}
                      </span>

                      {/* Status */}
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${course.status === "published"
                        ? "bg-[#A3D14B]/15 text-[#A3D14B]"
                        : course.status === "draft"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-white/5"
                        }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-base line-clamp-1">
                      <Link href={`/dashboard/admin/courses/${course.id}`}>{course.title}</Link>
                    </h4>
                    <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-1 line-clamp-3">{course.description}</p>
                  </div>

                  <div className="border-t border-black/5 dark:border-white/5 pt-3 w-full">
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <button
                        onClick={() => router.push(`/dashboard/admin/courses/${course.id}`)}
                        className="flex items-center justify-center gap-1.5 py-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-neutral-100/70 dark:bg-neutral-900/60 hover:bg-neutral-200/80 dark:hover:bg-neutral-900 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer w-full"
                        title="Edit Syllabus & Content"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => requestTogglePublish(course)}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer w-full ${course.status === "published"
                          ? "text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100/70 dark:hover:bg-yellow-950/40"
                          : "text-[#A3D14B] bg-[#A3D14B]/15 hover:bg-[#A3D14B]/25"
                          }`}
                        title={course.status === "published" ? "Unpublish Course" : "Publish Course"}
                      >
                        {course.status === "published" ? (
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{course.status === "published" ? "Unpublish" : "Publish"}</span>
                      </button>
                      <button
                        onClick={() => requestDeleteCourse(course)}
                        className="flex items-center justify-center gap-1.5 py-2 text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/20 hover:bg-red-100/70 dark:hover:bg-red-950/40 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer w-full"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drawer Side Panel (Slide-over Course Creation form) */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 h-full bg-black z-200 backdrop-blur-sm cursor-pointer"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 180 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white dark:bg-neutral-950 shadow-2xl z-200 flex flex-col h-full border-l border-black/5 dark:border-white/5"
              >
                {/* Drawer Header */}
                <div className="flex items-center px-4 py-4 border-b border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900">
                  <div>
                    <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-lg">Create New Course Shell</h3>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Create a course shell before building the curriculum syllabus.</p>
                  </div>
                </div>

                {/* Drawer Body (Form) */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Field 1: Title */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Course Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Introduction to Figma UI/UX Design"
                      {...register("title")}
                      className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:outline-none focus:bg-white dark:focus:bg-black text-sm font-medium transition-all ${errors.title ? "border-red-300 focus:border-red-500" : "border-neutral-200/80 dark:border-white/5 focus:border-neutral-400"
                        } dark:text-white`}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs font-semibold">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Field 2: Category */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. UI/UX Design, Data Science, Web Development"
                      {...register("category")}
                      className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:outline-none focus:bg-white dark:focus:bg-black text-sm font-medium transition-all ${errors.category ? "border-red-300 focus:border-red-500" : "border-neutral-200/80 dark:border-white/5 focus:border-neutral-400"
                        } dark:text-white`}
                    />
                    {errors.category && (
                      <p className="text-red-500 text-xs font-semibold">{errors.category.message}</p>
                    )}
                  </div>

                  {/* Field 3: Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Course Description</label>
                    <textarea
                      placeholder="Enter a descriptive overview summarizing core learning objectives, outcomes, and syllabus scope..."
                      rows={5}
                      {...register("description")}
                      className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:outline-none focus:bg-white dark:focus:bg-black text-sm font-medium transition-all resize-none ${errors.description ? "border-red-300 focus:border-red-500" : "border-neutral-200/80 dark:border-white/5 focus:border-neutral-400"
                        } dark:text-white`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs font-semibold">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Field 4: Thumbnail URL */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Thumbnail Cover URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://domain.com/assets/image.jpg"
                      {...register("thumbnail_url")}
                      className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:outline-none focus:bg-white dark:focus:bg-black text-sm font-medium transition-all ${errors.thumbnail_url ? "border-red-300 focus:border-red-500" : "border-neutral-200/80 dark:border-white/5 focus:border-neutral-400"
                        } dark:text-white`}
                    />
                    {errors.thumbnail_url && (
                      <p className="text-red-500 text-xs font-semibold">{errors.thumbnail_url.message}</p>
                    )}
                  </div>

                  {/* Field 5: Status */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Publishing State</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200/80 dark:border-white/5 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 cursor-pointer select-none">
                        <div>
                          <span className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200">Draft</span>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">Visible only to admins</p>
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
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">Make available to students</p>
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
                </form>

                {/* Drawer Footer */}
                <div className="px-4 py-4 border-t border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 font-bold rounded-lg text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-4 py-3 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-lg text-sm disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Save Course</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Confirm Action Dialog Modal */}
        <Dialog
          isOpen={confirmModal.isOpen && !!confirmModal.course}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        >
          {confirmModal.course && (
            <div className="space-y-6">
              {/* Header Indicator */}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full flex-shrink-0 flex items-center justify-center ${confirmModal.type === "delete"
                  ? "bg-red-500/10 text-red-500"
                  : confirmModal.type === "publish"
                    ? "bg-[#A3D14B]/15 text-[#A3D14B]"
                    : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                  {confirmModal.type === "delete" ? (
                    <Trash2 className="w-6 h-6" />
                  ) : confirmModal.type === "publish" ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white leading-6">
                    {confirmModal.type === "delete"
                      ? "Delete Course Permanently?"
                      : confirmModal.type === "publish"
                        ? "Publish This Course?"
                        : "Unpublish This Course?"}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                    {confirmModal.type === "delete" && (
                      <>
                        You are about to permanently delete <span className="font-extrabold text-neutral-800 dark:text-neutral-200">{confirmModal.course.title}</span>. This will completely remove all nested curriculum modules, syllabus lessons, and quizzes. This action is destructive and cannot be undone.
                      </>
                    )}
                    {confirmModal.type === "publish" && (
                      <>
                        You are publishing <span className="font-extrabold text-neutral-800 dark:text-neutral-200">{confirmModal.course.title}</span>. Students will be able to enroll, view lessons, and take quizzes immediately.
                      </>
                    )}
                    {confirmModal.type === "unpublish" && (
                      <>
                        You are unpublishing <span className="font-extrabold text-neutral-800 dark:text-neutral-200">{confirmModal.course.title}</span>. Active student enrollments will be preserved, but new students will not be able to find or enroll in this course.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  disabled={isActionPending}
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-3 border border-neutral-200 dark:border-white/5 rounded-lg text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isActionPending}
                  onClick={executeConfirmAction}
                  className={`px-4 py-3 rounded-lg text-sm font-bold text-white transition-all shadow-md shadow-black/5 hover:brightness-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${confirmModal.type === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-black text-white"
                    }`}
                >
                  {isActionPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isActionPending
                      ? (confirmModal.type === "delete" ? "Deleting..." : confirmModal.type === "publish" ? "Publishing..." : "Unpublishing...")
                      : (confirmModal.type === "delete" ? "Delete Course" : confirmModal.type === "publish" ? "Publish" : "Unpublish")}
                  </span>
                </button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
