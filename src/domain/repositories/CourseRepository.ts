import { Course } from "../entities/Course";

export interface CourseRepository {
  getAllCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | null>;
  getCoursesByCategory(category: string): Promise<Course[]>;
}
