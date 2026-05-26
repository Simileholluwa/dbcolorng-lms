import { Course, Module, Lesson } from "../../domain/entities/Course";
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
}
