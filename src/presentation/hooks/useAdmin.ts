import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpAdminRepository } from "@/infrastructure/repositories/HttpAdminRepository";
import { 
  AdminCourseInput,
  AdminModuleInput,
  AdminLessonInput,
  AdminQuizInput,
  AdminQuestionInput
} from "@/domain/repositories/AdminRepository";
import { toast } from "sonner";

const adminRepository = new HttpAdminRepository();

export const useAdmin = () => {
  const queryClient = useQueryClient();

  const useGetCourses = (limit: number = 50, skip: number = 0) => {
    return useQuery({
      queryKey: ["admin-courses", limit, skip],
      queryFn: () => adminRepository.getAllCourses(limit, skip),
    });
  };

  const useGetCourseById = (id: string) => {
    return useQuery({
      queryKey: ["admin-course", id],
      queryFn: () => adminRepository.getCourseById(id),
      enabled: !!id,
    });
  };

  const createCourseMutation = useMutation({
    mutationFn: (data: AdminCourseInput) => adminRepository.createCourse(data),
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course Created!", {
        description: `"${newCourse.title}" has been successfully added to your LMS.`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to create course", {
        description: error.response?.data?.detail || "Please verify your input and try again.",
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminCourseInput> }) =>
      adminRepository.updateCourse(id, data),
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-course", updatedCourse.id] });
      toast.success("Course Updated!", {
        description: `"${updatedCourse.title}" details have been updated.`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update course", {
        description: error.response?.data?.detail || "Please verify your input and try again.",
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => adminRepository.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course Deleted Successfully", {
        description: "The course and all its modules/lessons have been completely removed.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to delete course", {
        description: error.response?.data?.detail || "Please try again later.",
      });
    },
  });

  // --- Module Mutations & Queries ---
  const useGetModulesByCourse = (courseId: string) => {
    return useQuery({
      queryKey: ["admin-modules", courseId],
      queryFn: () => adminRepository.getModulesByCourse(courseId),
      enabled: !!courseId,
    });
  };

  const createModuleMutation = useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: AdminModuleInput }) =>
      adminRepository.createModule(courseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules", variables.courseId] });
      toast.success("Module Created!", {
        description: "The module has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to create module", {
        description: error.response?.data?.detail || "Please verify your input and try again.",
      });
    },
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ moduleId, data, courseId }: { moduleId: string; data: Partial<AdminModuleInput>; courseId: string }) =>
      adminRepository.updateModule(moduleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules", variables.courseId] });
      toast.success("Module Updated!", {
        description: "Module settings have been updated.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update module", {
        description: error.response?.data?.detail || "Please verify your input and try again.",
      });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: ({ moduleId, courseId }: { moduleId: string; courseId: string }) =>
      adminRepository.deleteModule(moduleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules", variables.courseId] });
      toast.success("Module Deleted", {
        description: "Module and nested syllabus lessons were successfully removed.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to delete module", {
        description: error.response?.data?.detail || "Please try again.",
      });
    },
  });

  // --- Lesson Mutations & Queries ---
  const useGetLessonsByModule = (moduleId: string) => {
    return useQuery({
      queryKey: ["admin-lessons", moduleId],
      queryFn: () => adminRepository.getLessonsByModule(moduleId),
      enabled: !!moduleId,
    });
  };

  const createLessonMutation = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: AdminLessonInput }) =>
      adminRepository.createLesson(moduleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", variables.moduleId] });
      toast.success("Lesson Created!", {
        description: "The lesson has been successfully added to this module.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to create lesson", {
        description: error.response?.data?.detail || "Please verify your input and try again.",
      });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ lessonId, data, moduleId }: { lessonId: string; data: Partial<AdminLessonInput>; moduleId: string }) =>
      adminRepository.updateLesson(lessonId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", variables.moduleId] });
      toast.success("Lesson Updated!", {
        description: "Lesson details have been updated.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update lesson", {
        description: error.response?.data?.detail || "Please verify your input and try again.",
      });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: ({ lessonId, moduleId }: { lessonId: string; moduleId: string }) =>
      adminRepository.deleteLesson(lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", variables.moduleId] });
      toast.success("Lesson Deleted", {
        description: "The lesson has been successfully removed from this module.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to delete lesson", {
        description: error.response?.data?.detail || "Please try again.",
      });
    },
  });

  // --- Quiz & Question CRUD ---
  const useGetQuizzesByTarget = (targetId: string) => {
    return useQuery({
      queryKey: ["admin-quizzes", targetId],
      queryFn: () => adminRepository.getQuizzesByTarget(targetId),
      enabled: !!targetId,
    });
  };

  const useGetQuizQuestions = (quizId: string) => {
    return useQuery({
      queryKey: ["admin-questions", quizId],
      queryFn: () => adminRepository.getQuestionsByQuiz(quizId),
      enabled: !!quizId,
    });
  };

  const createQuizMutation = useMutation({
    mutationFn: (data: AdminQuizInput) => adminRepository.createQuiz(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes", variables.target_id] });
      toast.success("Quiz Created!", {
        description: "The quiz shell has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to create quiz", {
        description: error.response?.data?.detail || "Please verify your input and try again.",
      });
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: ({ quizId, targetId }: { quizId: string; targetId: string }) =>
      adminRepository.deleteQuiz(quizId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes", variables.targetId] });
      toast.success("Quiz Deleted", {
        description: "The quiz has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to delete quiz", {
        description: error.response?.data?.detail || "Please try again.",
      });
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: AdminQuestionInput }) =>
      adminRepository.addQuestion(quizId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions", variables.quizId] });
      toast.success("Question Added!", {
        description: "Your question has been successfully appended to the quiz.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to add question", {
        description: error.response?.data?.detail || "Please verify your input and try again.",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: ({ questionId, quizId }: { questionId: string; quizId: string }) =>
      adminRepository.deleteQuestion(questionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions", variables.quizId] });
      toast.success("Question Deleted", {
        description: "The question has been removed.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to delete question", {
        description: error.response?.data?.detail || "Please try again.",
      });
    },
  });

  return {
    useGetCourses,
    useGetCourseById,
    createCourse: createCourseMutation.mutateAsync,
    isCreating: createCourseMutation.isPending,
    updateCourse: updateCourseMutation.mutateAsync,
    isUpdating: updateCourseMutation.isPending,
    deleteCourse: deleteCourseMutation.mutateAsync,
    isDeletingCourse: deleteCourseMutation.isPending,

    // Module CRUD
    useGetModulesByCourse,
    createModule: createModuleMutation.mutateAsync,
    isCreatingModule: createModuleMutation.isPending,
    updateModule: updateModuleMutation.mutateAsync,
    isUpdatingModule: updateModuleMutation.isPending,
    deleteModule: deleteModuleMutation.mutateAsync,
    isDeletingModule: deleteModuleMutation.isPending,

    // Lesson CRUD
    useGetLessonsByModule,
    createLesson: createLessonMutation.mutateAsync,
    isCreatingLesson: createLessonMutation.isPending,
    updateLesson: updateLessonMutation.mutateAsync,
    isUpdatingLesson: updateLessonMutation.isPending,
    deleteLesson: deleteLessonMutation.mutateAsync,
    isDeletingLesson: deleteLessonMutation.isPending,

    // Quiz & Question CRUD
    useGetQuizzesByTarget,
    useGetQuizQuestions,
    createQuiz: createQuizMutation.mutateAsync,
    isCreatingQuiz: createQuizMutation.isPending,
    deleteQuiz: deleteQuizMutation.mutateAsync,
    isDeletingQuiz: deleteQuizMutation.isPending,
    addQuestion: addQuestionMutation.mutateAsync,
    isAddingQuestion: addQuestionMutation.isPending,
    deleteQuestion: deleteQuestionMutation.mutateAsync,
    isDeletingQuestion: deleteQuestionMutation.isPending,
  };
};
