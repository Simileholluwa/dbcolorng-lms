import { Course, Module, Lesson } from "../entities/Course";

export interface CourseRepository {
  getAllCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | null>;
  getCoursesByCategory(category: string): Promise<Course[]>;
  enrollInCourse(courseId: string): Promise<any>;
  getModulesByCourse(courseId: string): Promise<Module[]>;
  getLessonsByModule(moduleId: string): Promise<Lesson[]>;
}
