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
  FileCheck2
} from "lucide-react";
import { useAdmin } from "@/presentation/hooks/useAdmin";
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
  const activeQuiz = quizzes?.[0]; // 1-to-1 mapping

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
    } catch (err) {}
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
    } catch (err) {}
  };

  const handleDeleteQuiz = async () => {
    if (!activeQuiz || !selectedTarget) return;
    if (window.confirm("Are you sure you want to delete this entire quiz shell and all its questions? This action is irreversible.")) {
      try {
        await deleteQuiz({ quizId: activeQuiz.id, targetId: selectedTarget.id });
      } catch (err) {}
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!quizId) return;
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion({ questionId: qId, quizId });
      } catch (err) {}
    }
  };

  const isLoadingWorkspace = loadingCourse || loadingModules;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href={`/dashboard/admin/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course Settings</span>
          </Link>
        </div>

        {isLoadingWorkspace ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl">
            <Loader2 className="w-10 h-10 text-[#A3D14B] animate-spin" />
            <p className="mt-4 text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase text-xs">Loading Assessment Workspace...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Page Header */}
            <div className="border-b border-black/5 dark:border-white/5 pb-6">
              <span className="px-3.5 py-1 bg-neutral-100 dark:bg-neutral-900 rounded-full text-xs font-black text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/5 uppercase tracking-wider">
                Phase 3 Module
              </span>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-3">
                Quizzes & Grading Builder
              </h1>
              <p className="text-neutral-450 dark:text-neutral-500 text-sm font-medium mt-1">
                Design custom exams and check-point quizzes, set grading policies, and build question banks for <strong className="text-neutral-700 dark:text-neutral-300 font-bold">"{course?.title}"</strong>.
              </p>
            </div>

            {/* Split Layout Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Assessment Target Selector */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                    <ListChecks className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                    <h3 className="font-extrabold text-neutral-850 dark:text-neutral-100 text-sm uppercase tracking-wider">Quiz Targets</h3>
                  </div>

                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4 leading-relaxed font-medium">
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
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                        selectedTarget?.type === "course"
                          ? "bg-black dark:bg-white text-white dark:text-black border-transparent shadow-md"
                          : "bg-neutral-50 dark:bg-neutral-900/40 border-black/5 dark:border-white/5 text-neutral-700 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-850"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Trophy className="w-4 h-4 shrink-0 text-[#A3D14B]" />
                        <span className="truncate">Final Course Exam</span>
                      </div>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-neutral-200/50 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-450">
                        Course
                      </span>
                    </button>

                    {/* Divider */}
                    <div className="h-[1px] bg-black/5 dark:bg-white/5 my-4" />

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
                          className={`w-full text-left p-4 rounded-2xl border text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                            selectedTarget?.type === "module" && selectedTarget?.id === mod.id
                              ? "bg-black dark:bg-white text-white dark:text-black border-transparent shadow-md"
                              : "bg-neutral-50 dark:bg-neutral-900/40 border-black/5 dark:border-white/5 text-neutral-700 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-850"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileCheck2 className="w-4 h-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
                            <span className="truncate">{mod.title}</span>
                          </div>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-neutral-200/50 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-450">
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
              <div className="lg:col-span-8 space-y-6">
                
                {/* Loader when changing targets */}
                {loadingQuizzes ? (
                  <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-12 text-center shadow-sm">
                    <Loader2 className="w-8 h-8 text-[#A3D14B] animate-spin mx-auto" />
                    <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Syncing Assessment details...</p>
                  </div>
                ) : !activeQuiz ? (
                  
                  /* EMPTY STATE: Create Quiz Shell Form */
                  <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-8 lg:p-12 shadow-sm text-center">
                    <HelpCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-750 mx-auto mb-4" />
                    <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">No Quiz Created Yet</h2>
                    <p className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold max-w-sm mx-auto mt-2 leading-relaxed">
                      There is no assessment shell currently configured for <strong className="text-neutral-700 dark:text-neutral-300">"{selectedTarget?.title}"</strong>. Click below to instantiate a new quiz.
                    </p>

                    <form onSubmit={handleQuizSubmit(onCreateQuizSubmit)} className="mt-8 text-left max-w-md mx-auto space-y-5 bg-neutral-50 dark:bg-neutral-900/40 border border-black/5 dark:border-white/5 p-6 rounded-3xl">
                      <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-350">Configure Assessment Parameters</h4>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Quiz Title</label>
                        <input
                          type="text"
                          defaultValue={selectedTarget?.type === "course" ? "Final Examination" : "Checkpoint Assessment"}
                          {...regQuiz("title", { required: "Quiz title is required" })}
                          className={`w-full px-4 py-3 bg-white dark:bg-neutral-950 border rounded-2xl text-xs font-medium focus:outline-none transition-all ${
                            quizErrors.title ? "border-red-300 focus:border-red-500" : "border-black/5 dark:border-white/5 focus:border-neutral-400"
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
                          className="w-full px-4 py-3 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl text-xs font-medium focus:outline-none focus:border-neutral-400 dark:text-white resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Min. Passing Grade (%)</label>
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
                        className="w-full py-3.5 bg-[#A3D14B] text-black font-extrabold rounded-2xl text-xs hover:bg-[#b5e05c] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#A3D14B]/10"
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
                  <div className="space-y-6">
                    
                    {/* Active Quiz Details Panel */}
                    <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-6 lg:p-8 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#A3D14B] bg-[#A3D14B]/10 px-3 py-1 rounded-full border border-[#A3D14B]/20">
                            Assessment Configured
                          </span>
                          <h2 className="text-lg lg:text-xl font-extrabold text-neutral-900 dark:text-white mt-3.5">{activeQuiz.title}</h2>
                          {activeQuiz.description && (
                            <p className="text-xs text-neutral-450 dark:text-neutral-500 font-semibold mt-1">{activeQuiz.description}</p>
                          )}
                        </div>
                        <button
                          onClick={handleDeleteQuiz}
                          disabled={isDeletingQuiz}
                          className="self-start sm:self-center px-4 py-2 border border-red-100 dark:border-red-950 text-red-500 hover:bg-red-500 hover:text-white font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                        <div className="bg-neutral-50 dark:bg-neutral-900/40 p-4.5 rounded-2xl border border-black/5 dark:border-white/5">
                          <span className="text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Attached Target</span>
                          <p className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 mt-1 uppercase truncate">{activeQuiz.target_type}</p>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-900/40 p-4.5 rounded-2xl border border-black/5 dark:border-white/5">
                          <span className="text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Passing Grade threshold</span>
                          <p className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">{activeQuiz.min_passing_score}% required</p>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-900/40 p-4.5 rounded-2xl border border-black/5 dark:border-white/5">
                          <span className="text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Total Questions</span>
                          <p className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">{questions?.length || 0} questions</p>
                        </div>
                      </div>
                    </div>

                    {/* Add Question Panel */}
                    <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-6 lg:p-8 shadow-sm">
                      <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4 mb-6">
                        <QuestionIcon className="w-5 h-5 text-neutral-450 dark:text-neutral-500" />
                        <h3 className="font-extrabold text-neutral-900 dark:text-white text-md">Add a New Question</h3>
                      </div>

                      <form onSubmit={handleQuestionSubmit(onAddQuestionSubmit)} className="space-y-6">
                        {/* Text */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Question Content</label>
                          <textarea
                            rows={3}
                            placeholder="Enter the question text..."
                            {...regQuestion("text", { required: "Question content is required" })}
                            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl text-xs font-medium focus:outline-none focus:border-neutral-400 dark:text-white resize-none"
                          />
                        </div>

                        {/* Split Type & Points */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Question Format</label>
                            <select
                              {...regQuestion("type", { required: true })}
                              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl text-xs font-extrabold focus:outline-none focus:border-neutral-400 dark:text-white appearance-none"
                            >
                              <option value="multiple_choice">Multiple Choice (Options)</option>
                              <option value="true_false">True / False</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Points Worth</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              {...regQuestion("points", { required: true })}
                              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl text-xs font-extrabold focus:outline-none focus:border-neutral-400 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Format-Specific Logic */}
                        {questionType === "multiple_choice" ? (
                          <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900/40 p-5 rounded-2xl border border-black/5 dark:border-white/5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500 block">Multiple Choice Choices</label>
                            
                            {/* Input to add */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Type answer choice..."
                                value={newOptionText}
                                onChange={(e) => setNewOptionText(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-xl text-xs font-medium focus:outline-none focus:border-neutral-400 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={handleAddOption}
                                className="px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-black font-extrabold rounded-xl text-xs hover:bg-opacity-95 transition-all cursor-pointer shrink-0"
                              >
                                Add Option
                              </button>
                            </div>

                            {/* Added list */}
                            {mcOptions.length > 0 ? (
                              <div className="space-y-2 pt-2">
                                <span className="text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">Configured choices (Select correct answer below):</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {mcOptions.map((opt, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-neutral-950 rounded-xl border border-black/5 dark:border-white/5 text-xs font-bold text-neutral-800 dark:text-neutral-250 truncate">
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
                                  <select
                                    {...regQuestion("correct_answer", { required: questionType === "multiple_choice" })}
                                    className="w-full px-4 py-3 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl text-xs font-extrabold focus:outline-none focus:border-neutral-400 dark:text-white"
                                  >
                                    {mcOptions.map((opt, i) => (
                                      <option key={i} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <p className="text-neutral-400 dark:text-neutral-500 text-[10px] font-bold py-1">No options configured yet. Add at least two choices.</p>
                            )}
                          </div>
                        ) : (
                          /* True/False logic */
                          <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900/40 p-5 rounded-2xl border border-black/5 dark:border-white/5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500 block">Select the Correct Response</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl text-xs font-black cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-850 text-neutral-850 dark:text-neutral-200">
                                <input
                                  type="radio"
                                  value="True"
                                  defaultChecked
                                  {...regQuestion("correct_answer", { required: questionType === "true_false" })}
                                  className="w-4 h-4 accent-[#A3D14B]"
                                />
                                <span>True</span>
                              </label>
                              <label className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl text-xs font-black cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-850 text-neutral-850 dark:text-neutral-200">
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
                          className="w-full py-3.5 bg-[#A3D14B] text-black font-extrabold rounded-2xl text-xs hover:bg-[#b5e05c] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#A3D14B]/10"
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
                      <h3 className="font-extrabold text-neutral-850 dark:text-neutral-250 text-sm uppercase tracking-wider">Quiz Questions List ({questions?.length || 0})</h3>

                      {loadingQuestions ? (
                        <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-8 text-center">
                          <Loader2 className="w-6 h-6 text-[#A3D14B] animate-spin mx-auto" />
                          <p className="mt-2 text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Syncing Question Bank...</p>
                        </div>
                      ) : questions && questions.length > 0 ? (
                        <div className="space-y-4">
                          {questions.map((q, idx) => (
                            <div key={q.id} className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-5 lg:p-6 shadow-sm flex gap-4">
                              <span className="w-7 h-7 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-black/5 dark:border-white/5 text-xs font-black text-neutral-700 dark:text-neutral-400 flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>

                              <div className="flex-1 min-w-0 space-y-3.5">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h4 className="text-xs font-black text-neutral-850 dark:text-neutral-200 leading-relaxed pr-2">{q.text}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-neutral-150 dark:bg-neutral-900 text-neutral-550 dark:text-neutral-400 border border-black/5 dark:border-white/5">
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
                                    className="p-2 border border-black/5 dark:border-white/5 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
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
                                        className={`p-3 rounded-xl border text-xs font-bold ${
                                          isCorrect
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
                        <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-3xl p-8 text-center text-neutral-400 dark:text-neutral-500 font-bold uppercase text-[10px] tracking-wider leading-relaxed">
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
    </DashboardLayout>
  );
}
