"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Trophy,
  HelpCircle,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  ListChecks,
  AlertCircle,
  HelpCircle as QuestionIcon,
  X,
  FileCheck2,
  ChevronDown
} from "lucide-react";
import { useAdmin } from "@/presentation/hooks/useAdmin";
import { Select } from "@/presentation/components/ui/Select";
import { Dialog } from "@/presentation/components/ui/Dialog";
import DashboardLayout from "@/presentation/components/DashboardLayout";

interface CreateQuizForm {
  title: string;
  description: string;
  min_passing_score: number;
}

interface AddQuestionForm {
  text: string;
  type: "multiple_choice" | "true_false";
  correct_answer: string;
  points: number;
}

export default function AssessmentBuilderPage() {
  const { id: courseId } = useParams() as { id: string };
  const {
    useGetCourseById,
    useGetModulesByCourse,
    useGetQuizzesByTarget,
    useGetQuizQuestions,
    createQuiz,
    isCreatingQuiz,
    deleteQuiz,
    isDeletingQuiz,
    addQuestion,
    isAddingQuestion,
    deleteQuestion,
    isDeletingQuestion
  } = useAdmin();

  // Selected Target state
  const [selectedTarget, setSelectedTarget] = useState<{ id: string; type: "course" | "module"; title: string } | null>(null);

  // Queries
  const { data: course, isLoading: loadingCourse } = useGetCourseById(courseId);
  const { data: modules, isLoading: loadingModules } = useGetModulesByCourse(courseId);

  // Once course loads, default to course target if none selected
  React.useEffect(() => {
    if (course && !selectedTarget) {
      setSelectedTarget({
        id: course.id,
        type: "course",
        title: `Course Exam: ${course.title}`
      });
    }
  }, [course, selectedTarget]);

  // Fetch quizzes for the selected target
  const targetId = selectedTarget?.id || "";
  const { data: quizzes, isLoading: loadingQuizzes } = useGetQuizzesByTarget(targetId);
  const activeQuiz = quizzes?.[0];

  // Fetch questions for active quiz
  const quizId = activeQuiz?.id || "";
  const { data: questions, isLoading: loadingQuestions } = useGetQuizQuestions(quizId);

  // Form states
  const { register: regQuiz, handleSubmit: handleQuizSubmit, reset: resetQuizForm, formState: { errors: quizErrors } } = useForm<CreateQuizForm>();
  const { register: regQuestion, handleSubmit: handleQuestionSubmit, setValue: setQuestionVal, watch: watchQuestion, reset: resetQuestionForm } = useForm<AddQuestionForm>({
    defaultValues: {
      type: "multiple_choice",
      points: 10
    }
  });

  const questionType = watchQuestion("type");
  const correctAnswer = watchQuestion("correct_answer");

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: "quiz" | "question";
    questionId?: string;
  }>({
    isOpen: false,
    type: "question",
  });

  // Options list state for multiple choice questions
  const [mcOptions, setMcOptions] = useState<string[]>([]);
  const [newOptionText, setNewOptionText] = useState("");

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOptionText.trim() && !mcOptions.includes(newOptionText.trim())) {
      const updated = [...mcOptions, newOptionText.trim()];
      setMcOptions(updated);
      setNewOptionText("");
      // Default correct answer to first option if not set
      if (updated.length === 1) {
        setQuestionVal("correct_answer", updated[0]);
      }
    }
  };

  const handleRemoveOption = (index: number) => {
    const updated = mcOptions.filter((_, i) => i !== index);
    setMcOptions(updated);
  };

  // Submit handlers
  const onCreateQuizSubmit = async (data: CreateQuizForm) => {
    if (!selectedTarget) return;
    try {
      await createQuiz({
        target_id: selectedTarget.id,
        target_type: selectedTarget.type,
        title: data.title,
        description: data.description,
        min_passing_score: Number(data.min_passing_score)
      });
      resetQuizForm();
    } catch (err) { }
  };

  const onAddQuestionSubmit = async (data: AddQuestionForm) => {
    if (!quizId) return;
    try {
      const payload = {
        text: data.text,
        type: data.type,
        points: Number(data.points),
        correct_answer: data.correct_answer,
        options: data.type === "multiple_choice" ? mcOptions : ["True", "False"]
      };

      await addQuestion({
        quizId,
        data: payload
      });

      resetQuestionForm({
        type: "multiple_choice",
        points: 10,
        text: "",
        correct_answer: ""
      });
      setMcOptions([]);
    } catch (err) { }
  };

  const handleDeleteQuiz = () => {
    if (!activeQuiz || !selectedTarget) return;
    setDeleteConfirmModal({
      isOpen: true,
      type: "quiz"
    });
  };

  const handleDeleteQuestion = (qId: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: "question",
      questionId: qId
    });
  };

  const executeDeleteAction = async () => {
    const { type, questionId } = deleteConfirmModal;
    try {
      if (type === "quiz") {
        if (!activeQuiz || !selectedTarget) return;
        await deleteQuiz({ quizId: activeQuiz.id, targetId: selectedTarget.id });
      } else if (type === "question" && questionId) {
        if (!quizId) return;
        await deleteQuestion({ questionId, quizId });
      }
    } catch (err) {
    } finally {
      setDeleteConfirmModal({ isOpen: false, type: "question" });
    }
  };

  const isLoadingWorkspace = loadingCourse || loadingModules;
  const isDeletePending = deleteConfirmModal.type === "quiz" ? isDeletingQuiz : isDeletingQuestion;

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

        {isLoadingWorkspace ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl shadow-xs">
            <Loader2 className="w-10 h-10 text-[#A3D14B] animate-spin" />
            <p className="mt-4 text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase text-xs">Loading Assessment Workspace...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="pb-2">
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-3">
                {course?.title || "Loading Course..."}
              </h1>
              <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-1">
                Design checkpoint quizzes, configure passing grades, and manage question banks.
              </p>
            </div>

            {/* Split Layout Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-8 items-start">

              {/* Left Column: Assessment Target Selector */}
              <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-1">
                <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                      <h3 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-md">Quiz Targets</h3>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-450 dark:text-neutral-500 mb-4 leading-relaxed">
                    Select a target element below to design its corresponding quiz requirements.
                  </p>

                  <div className="space-y-2.5">
                    {/* Course Level exam */}
                    <button
                      onClick={() => setSelectedTarget({
                        id: course?.id || "",
                        type: "course",
                        title: `Course Exam: ${course?.title}`
                      })}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${selectedTarget?.type === "course"
                        ? "border-[#A3D14B] ring-2 ring-[#A3D14B]/10 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        : "border-neutral-200/70 dark:border-white/5 bg-neutral-50/20 dark:bg-neutral-900/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                        }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Trophy className="w-4 h-4 shrink-0 text-[#A3D14B]" />
                        <span className="truncate text-sm">Final Course Exam</span>
                      </div>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                        Course
                      </span>
                    </button>

                    {/* Divider */}
                    <div className="h-[1px] bg-neutral-200 dark:bg-white/5 my-3" />

                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Module Quizzes</h4>

                    {modules && modules.length > 0 ? (
                      modules.map((mod) => (
                        <button
                          key={mod.id}
                          onClick={() => setSelectedTarget({
                            id: mod.id,
                            type: "module",
                            title: `Module Quiz: ${mod.title}`
                          })}
                          className={`w-full text-left p-3.5 rounded-lg border text-sm font-extrabold flex items-center justify-between transition-all cursor-pointer ${selectedTarget?.type === "module" && selectedTarget?.id === mod.id
                            ? "border-[#A3D14B] ring-2 ring-[#A3D14B]/10 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                            : "border-neutral-200/70 dark:border-white/5 bg-neutral-50/20 dark:bg-neutral-900/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                            }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileCheck2 className="w-4 h-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
                            <span className="truncate">{mod.title}</span>
                          </div>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                            Mod {mod.order}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-6 text-neutral-400 dark:text-neutral-500 font-bold uppercase text-[10px]">
                        No syllabus modules created yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Quiz details & Question editor workspace */}
              <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] scrollbar-hide lg:overflow-y-auto pr-1">

                {/* Loader when changing targets */}
                {loadingQuizzes ? (
                  <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-6 text-center shadow-xs">
                    <Loader2 className="w-8 h-8 text-[#A3D14B] animate-spin mx-auto" />
                    <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Syncing Assessment details...</p>
                  </div>
                ) : !activeQuiz ? (

                  /* EMPTY STATE: Create Quiz Shell Form */
                  <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-xs text-center">
                    <HelpCircle className="w-8 h-8 text-neutral-350 dark:text-neutral-650 mx-auto mb-2" />
                    <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">No Quiz Created Yet</h2>
                    <p className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold max-w-sm mx-auto mt-2 leading-relaxed">
                      There is no assessment shell currently configured for <strong className="text-neutral-700 dark:text-neutral-350">"{selectedTarget?.title}"</strong>. Click below to instantiate a new quiz.
                    </p>

                    <form onSubmit={handleQuizSubmit(onCreateQuizSubmit)} className="mt-6 text-left max-w-md mx-auto space-y-4 bg-neutral-50 dark:bg-neutral-900/40 border border-black/5 dark:border-white/5 p-4 rounded-lg">
                      <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-350">Configure Assessment Parameters</h4>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Quiz Title</label>
                        <input
                          type="text"
                          defaultValue={selectedTarget?.type === "course" ? "Final Examination" : "Checkpoint Assessment"}
                          {...regQuiz("title", { required: "Quiz title is required" })}
                          className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-sm font-medium focus:outline-none focus:bg-white dark:focus:bg-black transition-all ${quizErrors.title ? "border-red-300 focus:border-red-500" : "border-neutral-200/80 dark:border-white/5 focus:border-neutral-400"
                            } dark:text-white`}
                        />
                        {quizErrors.title && (
                          <p className="text-red-500 text-[10px] font-semibold">{quizErrors.title.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Short Description</label>
                        <textarea
                          rows={2}
                          placeholder="Provide custom details/grading instructions for students..."
                          {...regQuiz("description")}
                          className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-lg text-sm font-medium focus:outline-none focus:bg-white dark:focus:bg-black focus:border-neutral-400 dark:text-white resize-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-550">Min. Passing Grade (%)</label>
                          <span className="text-xs font-black text-[#A3D14B]">70%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          defaultValue="70"
                          {...regQuiz("min_passing_score", { required: true })}
                          className="w-full accent-[#A3D14B] bg-neutral-200 dark:bg-neutral-850 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isCreatingQuiz}
                        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-lg text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isCreatingQuiz ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Creating Assessment Shell...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" strokeWidth={3} />
                            <span>Create Assessment Shell</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (

                  /* ACTIVE WORKSPACE: Quiz Settings, Questions, Add Question Form */
                  <div className="space-y-4 md:space-y-8">

                    {/* Active Quiz Details Panel */}
                    <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <h2 className="text-lg lg:text-xl font-extrabold text-neutral-900 dark:text-white">{activeQuiz.title}</h2>
                          {activeQuiz.description && (
                            <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-1">{activeQuiz.description}</p>
                          )}
                        </div>
                        <button
                          onClick={handleDeleteQuiz}
                          disabled={isDeletingQuiz}
                          className="self-start sm:self-center px-4 py-2 border border-neutral-200 dark:border-white/10 text-red-500 hover:bg-red-500/10 font-extrabold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {isDeletingQuiz ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete Quiz</span>
                        </button>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-neutral-50 dark:bg-neutral-900/40 pb-3 pt-2 px-3 rounded-lg border border-black/5 dark:border-white/5">
                          <span className="text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Attached Target</span>
                          <p className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 mt-1 uppercase truncate">{activeQuiz.target_type}</p>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-900/40 pb-3 pt-2 px-3 rounded-lg border border-black/5 dark:border-white/5">
                          <span className="text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Passing Grade threshold</span>
                          <p className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">{activeQuiz.min_passing_score}% required</p>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-900/40 pb-3 pt-2 px-3 rounded-lg border border-black/5 dark:border-white/5">
                          <span className="text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Total Questions</span>
                          <p className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">{questions?.length || 0} questions</p>
                        </div>
                      </div>
                    </div>

                    {/* Add Question Panel */}
                    <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-4 mb-2">
                        <QuestionIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                        <h3 className="font-extrabold text-neutral-850 dark:text-neutral-100 text-md">Add a New Question</h3>
                      </div>

                      <form onSubmit={handleQuestionSubmit(onAddQuestionSubmit)} className="space-y-4">
                        {/* Question Text */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Question Content</label>
                          <textarea
                            rows={3}
                            placeholder="Enter the question text..."
                            {...regQuestion("text", { required: "Question content is required" })}
                            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-lg text-sm font-medium focus:outline-none focus:bg-white dark:focus:bg-black focus:border-neutral-400 dark:text-white resize-none transition-all"
                          />
                        </div>

                        {/* Format & Points split */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Question Format</label>
                            <input type="hidden" {...regQuestion("type", { required: true })} />
                            <Select
                              options={[
                                { value: "multiple_choice", label: "Multiple Choice (Options)" },
                                { value: "true_false", label: "True / False" }
                              ]}
                              value={questionType}
                              onChange={(val) => setQuestionVal("type", val as "multiple_choice" | "true_false")}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Points Worth</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              {...regQuestion("points", { required: true })}
                              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-lg text-sm font-extrabold focus:outline-none focus:bg-white dark:focus:bg-black focus:border-neutral-400 dark:text-white transition-all"
                            />
                          </div>
                        </div>

                        {/* Format-Specific Choice Fields */}
                        {questionType === "multiple_choice" ? (
                          <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-lg border border-neutral-200/70 dark:border-white/5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500 block">Multiple Choice Choices</label>

                            {/* Input to add */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Type answer choice..."
                                value={newOptionText}
                                onChange={(e) => setNewOptionText(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-white/5 rounded-lg text-sm font-medium focus:outline-none focus:border-neutral-400 dark:text-white transition-all"
                              />
                              <button
                                type="button"
                                onClick={handleAddOption}
                                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-lg text-xs hover:bg-opacity-90 transition-all cursor-pointer shrink-0"
                              >
                                Add Option
                              </button>
                            </div>

                            {/* Configured choices list */}
                            {mcOptions.length > 0 ? (
                              <div className="space-y-2 pt-2">
                                <span className="text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Configured choices (Select correct answer below):</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {mcOptions.map((opt, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200/80 dark:border-white/5 text-xs font-bold text-neutral-850 dark:text-neutral-255 truncate">
                                      <span className="truncate pr-2">{opt}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(i)}
                                        className="text-neutral-400 hover:text-red-500 p-0.5 rounded transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                <div className="space-y-2 mt-4 pt-2">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Correct Answer Selection</label>
                                  <input type="hidden" {...regQuestion("correct_answer", { required: questionType === "multiple_choice" })} />
                                  <Select
                                    options={mcOptions.map((opt) => ({ value: opt, label: opt }))}
                                    value={correctAnswer}
                                    onChange={(val) => setQuestionVal("correct_answer", val)}
                                    placeholder="Select correct option..."
                                    darkBg
                                  />
                                </div>
                              </div>
                            ) : (
                              <p className="text-neutral-450 dark:text-neutral-500 text-xs py-1">No options configured yet. Add at least two choices.</p>
                            )}
                          </div>
                        ) : (
                          /* True/False Radios */
                          <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-lg border border-neutral-200/70 dark:border-white/5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500 block">Select the Correct Response</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-white/5 rounded-lg text-sm font-black cursor-pointer hover:bg-neutral-105/50 dark:hover:bg-neutral-850 text-neutral-850 dark:text-neutral-255 transition-all">
                                <input
                                  type="radio"
                                  value="True"
                                  defaultChecked
                                  {...regQuestion("correct_answer", { required: questionType === "true_false" })}
                                  className="w-4 h-4 accent-[#A3D14B]"
                                />
                                <span>True</span>
                              </label>
                              <label className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-white/5 rounded-lg text-sm font-black cursor-pointer hover:bg-neutral-105/50 dark:hover:bg-neutral-850 text-neutral-850 dark:text-neutral-255 transition-all">
                                <input
                                  type="radio"
                                  value="False"
                                  {...regQuestion("correct_answer", { required: questionType === "true_false" })}
                                  className="w-4 h-4 accent-[#A3D14B]"
                                />
                                <span>False</span>
                              </label>
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isAddingQuestion || (questionType === "multiple_choice" && mcOptions.length < 2)}
                          className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-lg text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isAddingQuestion ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Adding Question...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" strokeWidth={3} />
                              <span>Append Question to Exam</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Question List Workspace */}
                    <div className="space-y-4">
                      <h3 className="font-extrabold text-neutral-800 dark:text-neutral-200 mt-8 text-sm uppercase tracking-wider">Quiz Questions List ({questions?.length || 0})</h3>

                      {loadingQuestions ? (
                        <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-6 text-center">
                          <Loader2 className="w-6 h-6 text-[#A3D14B] animate-spin mx-auto" />
                          <p className="mt-2 text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Syncing Question Bank...</p>
                        </div>
                      ) : questions && questions.length > 0 ? (
                        <div className="space-y-4">
                          {questions.map((q, idx) => (
                            <div key={q.id} className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xs flex gap-4">
                              <span className="w-7 h-7 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-black/5 dark:border-white/5 text-xs font-black text-neutral-700 dark:text-neutral-400 flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>

                              <div className="flex-1 min-w-0 space-y-3.5">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h4 className="text-sm font-black text-neutral-850 dark:text-neutral-200 leading-relaxed pr-2">{q.text}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-905 text-neutral-550 dark:text-neutral-900 border border-neutral-200/70 dark:border-white/5">
                                        {q.type.replace("_", " ")}
                                      </span>
                                      <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-[#A3D14B]/15 text-[#A3D14B] border border-[#A3D14B]/20">
                                        {q.points} Points
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    disabled={isDeletingQuestion}
                                    className="p-2 border border-neutral-200 dark:border-white/5 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Answers visual preview */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                  {q.options.map((opt, i) => {
                                    const isCorrect = opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                                    return (
                                      <div
                                        key={i}
                                        className={`p-3 rounded-lg border text-xs font-bold ${isCorrect
                                          ? "bg-[#A3D14B]/10 border-[#A3D14B]/35 text-[#A3D14B] font-extrabold"
                                          : "bg-neutral-50 dark:bg-neutral-900 border-black/5 dark:border-white/5 text-neutral-500 dark:text-neutral-450"
                                          }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="truncate pr-2">{opt}</span>
                                          {isCorrect && (
                                            <span className="text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 bg-[#A3D14B]/15 rounded shrink-0">Correct</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-6 text-center text-neutral-400 dark:text-neutral-500 font-bold uppercase text-[10px] tracking-wider leading-relaxed">
                          This assessment currently has no questions defined.<br />Use the builder above to append your first question!
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>

            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Action Dialog Modal */}
      <Dialog
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal(prev => ({ ...prev, isOpen: false }))}
      >
        <div className="space-y-6">
          {/* Header Indicator */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full flex-shrink-0 flex items-center justify-center bg-red-500/10 text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white leading-6">
                {deleteConfirmModal.type === "quiz"
                  ? "Delete Quiz Entirely?"
                  : "Delete Question?"}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                {deleteConfirmModal.type === "quiz" ? (
                  <>
                    Are you sure you want to delete this entire quiz shell and all its questions? This action is destructive and cannot be undone.
                  </>
                ) : (
                  <>
                    Are you sure you want to delete this question from the quiz? This action is destructive and cannot be undone.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              disabled={isDeletePending}
              onClick={() => setDeleteConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="px-4 py-3 border border-neutral-200 dark:border-white/5 rounded-lg text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={isDeletePending}
              onClick={executeDeleteAction}
              className="px-4 py-3 rounded-lg text-sm font-bold text-white transition-all shadow-md shadow-black/5 bg-red-500 hover:bg-red-650 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDeletePending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {deleteConfirmModal.type === "quiz"
                  ? (isDeletePending ? "Deleting Quiz..." : "Delete Quiz")
                  : (isDeletePending ? "Deleting Question..." : "Delete Question")}
              </span>
            </button>
          </div>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
