import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpCourseRepository } from "@/infrastructure/repositories/HttpCourseRepository";
import { toast } from "sonner";

const courseRepository = new HttpCourseRepository();

export const useCourses = () => {
  const queryClient = useQueryClient();

  const useGetAllCourses = () => {
    return useQuery({
      queryKey: ["courses"],
      queryFn: () => courseRepository.getAllCourses(),
    });
  };

  const useGetCourseById = (courseId: string) => {
    return useQuery({
      queryKey: ["course-details", courseId],
      queryFn: () => courseRepository.getCourseById(courseId),
      enabled: !!courseId,
    });
  };

  const useGetCourseModules = (courseId: string) => {
    return useQuery({
      queryKey: ["course-modules", courseId],
      queryFn: () => courseRepository.getModulesByCourse(courseId),
      enabled: !!courseId,
    });
  };

  const useGetModuleLessons = (moduleId: string) => {
    return useQuery({
      queryKey: ["module-lessons", moduleId],
      queryFn: () => courseRepository.getLessonsByModule(moduleId),
      enabled: !!moduleId,
    });
  };

  const enrollInCourseMutation = useMutation({
    mutationFn: (courseId: string) => courseRepository.enrollInCourse(courseId),
    onSuccess: () => {
      // Invalidate enrollments and profile queries so dashboard and catalog update instantly
      queryClient.invalidateQueries({ queryKey: ["lms-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["lms-profile"] });
      toast.success("Enrolled Successfully!", {
        description: "You have been registered for this course. Start learning now!",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to Enroll", {
        description: error.response?.data?.detail || "Please try again later.",
      });
    },
  });

  const useGetQuizzesByTarget = (targetId: string) => {
    return useQuery({
      queryKey: ["quizzes", targetId],
      queryFn: () => courseRepository.getQuizzesByTarget(targetId),
      enabled: !!targetId,
    });
  };

  const useGetQuizQuestions = (quizId: string) => {
    return useQuery({
      queryKey: ["quiz-questions", quizId],
      queryFn: () => courseRepository.getQuizQuestions(quizId),
      enabled: !!quizId,
    });
  };

  const completeLessonMutation = useMutation({
    mutationFn: (lessonId: string) => courseRepository.completeLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["lms-profile"] });
      toast.success("Lesson Completed!", {
        description: "You earned +10 XP!",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to complete lesson", {
        description: error.response?.data?.detail || "Please try again later.",
      });
    },
  });

  const submitQuizAttemptMutation = useMutation({
    mutationFn: ({ quizId, answers }: { quizId: string; answers: Record<string, string> }) =>
      courseRepository.submitQuizAttempt(quizId, answers),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lms-profile"] });
      queryClient.invalidateQueries({ queryKey: ["lms-enrollments"] });
      if (data.passed) {
        toast.success("Quiz Passed!", {
          description: `Score: ${data.score}% - Great job!`,
        });
      } else {
        toast.error("Quiz Failed", {
          description: `Score: ${data.score}% - You can try again.`,
        });
      }
    },
    onError: (error: any) => {
      toast.error("Failed to submit quiz", {
        description: error.response?.data?.detail || "Please try again later.",
      });
    },
  });

  const useGetComments = (targetId: string) => {
    return useQuery({
      queryKey: ["discussion-comments", targetId],
      queryFn: () => courseRepository.getCommentsByTarget(targetId),
      enabled: !!targetId,
    });
  };

  const postCommentMutation = useMutation({
    mutationFn: ({ targetId, targetType, text, parentId }: { targetId: string; targetType: string; text: string; parentId?: string }) =>
      courseRepository.postComment(targetId, targetType, text, parentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["discussion-comments", variables.targetId] });
      toast.success("Comment Posted!");
    },
    onError: (error: any) => {
      toast.error("Failed to post comment", {
        description: error.response?.data?.detail || "Please try again later.",
      });
    },
  });

  return {
    useGetAllCourses,
    useGetCourseById,
    useGetCourseModules,
    useGetModuleLessons,
    enrollInCourseMutation,
    useGetQuizzesByTarget,
    useGetQuizQuestions,
    completeLessonMutation,
    submitQuizAttemptMutation,
    useGetComments,
    postCommentMutation,
  };
};
