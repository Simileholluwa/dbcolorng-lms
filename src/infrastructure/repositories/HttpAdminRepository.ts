import { Course } from "../../domain/entities/Course";
import { Module } from "../../domain/entities/Module";
import { Lesson } from "../../domain/entities/Lesson";
import { Quiz } from "../../domain/entities/Quiz";
import { Question } from "../../domain/entities/Question";
import { 
  AdminRepository, 
  AdminCourseInput,
  AdminModuleInput,
  AdminLessonInput,
  AdminQuizInput,
  AdminQuestionInput
} from "../../domain/repositories/AdminRepository";
import apiClient from "../api/client";

export class HttpAdminRepository implements AdminRepository {
  async getAllCourses(limit: number = 20, skip: number = 0): Promise<{ items: Course[]; total: number }> {
    const response = await apiClient.get<{ items: Course[]; total: number }>(
      `/lms/admin/courses?limit=${limit}&skip=${skip}`
    );
    return response.data;
  }

  async getCourseById(id: string): Promise<Course> {
    const response = await apiClient.get<Course>(`/lms/admin/courses/${id}`);
    return response.data;
  }

  async createCourse(data: AdminCourseInput): Promise<Course> {
    const response = await apiClient.post<Course>("/lms/admin/courses", data);
    return response.data;
  }

  async updateCourse(id: string, data: Partial<AdminCourseInput>): Promise<Course> {
    const response = await apiClient.put<Course>(`/lms/admin/courses/${id}`, data);
    return response.data;
  }

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`/lms/admin/courses/${id}`);
  }

  // --- Module CRUD ---
  async getModulesByCourse(courseId: string): Promise<Module[]> {
    const response = await apiClient.get<Module[]>(`/lms/admin/courses/${courseId}/modules`);
    return response.data;
  }

  async createModule(courseId: string, data: AdminModuleInput): Promise<Module> {
    const response = await apiClient.post<Module>(`/lms/admin/courses/${courseId}/modules`, data);
    return response.data;
  }

  async updateModule(moduleId: string, data: Partial<AdminModuleInput>): Promise<Module> {
    const response = await apiClient.put<Module>(`/lms/admin/modules/${moduleId}`, data);
    return response.data;
  }

  async deleteModule(moduleId: string): Promise<void> {
    await apiClient.delete(`/lms/admin/modules/${moduleId}`);
  }

  // --- Lesson CRUD ---
  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/lms/admin/modules/${moduleId}/lessons`);
    return response.data;
  }

  async createLesson(moduleId: string, data: AdminLessonInput): Promise<Lesson> {
    const response = await apiClient.post<Lesson>(`/lms/admin/modules/${moduleId}/lessons`, data);
    return response.data;
  }

  async updateLesson(lessonId: string, data: Partial<AdminLessonInput>): Promise<Lesson> {
    const response = await apiClient.put<Lesson>(`/lms/admin/lessons/${lessonId}`, data);
    return response.data;
  }

  async deleteLesson(lessonId: string): Promise<void> {
    await apiClient.delete(`/lms/admin/lessons/${lessonId}`);
  }

  // --- Quiz & Question CRUD ---
  async getQuizzesByTarget(targetId: string): Promise<Quiz[]> {
    const response = await apiClient.get<Quiz[]>(`/lms/admin/assessments/quizzes/target/${targetId}`);
    return response.data;
  }

  async getQuestionsByQuiz(quizId: string): Promise<Question[]> {
    const response = await apiClient.get<Question[]>(`/lms/admin/assessments/quizzes/${quizId}/questions`);
    return response.data;
  }

  async createQuiz(data: AdminQuizInput): Promise<Quiz> {
    const response = await apiClient.post<Quiz>("/lms/admin/assessments/quizzes", data);
    return response.data;
  }

  async deleteQuiz(quizId: string): Promise<void> {
    await apiClient.delete(`/lms/admin/assessments/quizzes/${quizId}`);
  }

  async addQuestion(quizId: string, data: AdminQuestionInput): Promise<Question> {
    const response = await apiClient.post<Question>(`/lms/admin/assessments/quizzes/${quizId}/questions`, data);
    return response.data;
  }

  async deleteQuestion(questionId: string): Promise<void> {
    await apiClient.delete(`/lms/admin/assessments/questions/${questionId}`);
  }
}
