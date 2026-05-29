import { Course, Module, Lesson } from "../../domain/entities/Course";
import { Quiz } from "../../domain/entities/Quiz";
import { Question } from "../../domain/entities/Question";
import { Comment } from "../../domain/entities/Comment";
import { CourseRepository } from "../../domain/repositories/CourseRepository";
import apiClient from "../api/client";

export class HttpCourseRepository implements CourseRepository {
  async getAllCourses(): Promise<Course[]> {
    const response = await apiClient.get<{ items: Course[]; total: number }>("/lms/courses");
    return response.data.items;
  }

  async getCourseById(id: string): Promise<Course | null> {
    const response = await apiClient.get<Course>(`/lms/courses/${id}`);
    return response.data;
  }

  async getCoursesByCategory(category: string): Promise<Course[]> {
    const response = await apiClient.get<{ items: Course[]; total: number }>(`/lms/courses?category=${category}`);
    return response.data.items;
  }

  async enrollInCourse(courseId: string): Promise<any> {
    const response = await apiClient.post(`/lms/enroll/${courseId}`);
    return response.data;
  }

  async getModulesByCourse(courseId: string): Promise<Module[]> {
    const response = await apiClient.get<Module[]>(`/lms/courses/${courseId}/modules`);
    return response.data;
  }

  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/lms/modules/${moduleId}/lessons`);
    return response.data;
  }

  async completeLesson(lessonId: string): Promise<any> {
    const response = await apiClient.post(`/lms/lessons/${lessonId}/complete`);
    return response.data;
  }

  async getQuizzesByTarget(targetId: string): Promise<Quiz[]> {
    const response = await apiClient.get<Quiz[]>(`/lms/assessments/quizzes/target/${targetId}`);
    return response.data;
  }

  async getQuizQuestions(quizId: string): Promise<Question[]> {
    const response = await apiClient.get<Question[]>(`/lms/assessments/quizzes/${quizId}/questions`);
    return response.data;
  }

  async submitQuizAttempt(quizId: string, answers: Record<string, string>): Promise<any> {
    const response = await apiClient.post(`/lms/assessments/quizzes/${quizId}/submit`, { answers });
    return response.data;
  }

  async getCommentsByTarget(targetId: string): Promise<Comment[]> {
    const response = await apiClient.get<Comment[]>(`/lms/engagement/discussions/${targetId}`);
    return response.data;
  }

  async postComment(targetId: string, targetType: string, text: string, parentId?: string): Promise<Comment> {
    const response = await apiClient.post<Comment>(`/lms/engagement/discussions`, {
      target_id: targetId,
      target_type: targetType,
      text,
      parent_id: parentId
    });
    return response.data;
  }
}
