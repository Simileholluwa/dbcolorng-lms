import { Course } from "../../domain/entities/Course";
import { CourseRepository } from "../../domain/repositories/CourseRepository";
import apiClient from "../api/client";

export class HttpCourseRepository implements CourseRepository {
  async getAllCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>("/lms/courses");
    return response.data;
  }

  async getCourseById(id: string): Promise<Course | null> {
    const response = await apiClient.get<Course>(`/lms/courses/${id}`);
    return response.data;
  }

  async getCoursesByCategory(category: string): Promise<Course[]> {
    const response = await apiClient.get<Course[]>(`/lms/courses?category=${category}`);
    return response.data;
  }
}
