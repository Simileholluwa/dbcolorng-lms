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

  return {
    useGetAllCourses,
    useGetCourseModules,
    useGetModuleLessons,
    enrollInCourseMutation,
  };
};
