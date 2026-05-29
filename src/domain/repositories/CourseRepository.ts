import { Course, Module, Lesson } from "../entities/Course";
import { Quiz } from "../entities/Quiz";
import { Question } from "../entities/Question";
import { Comment } from "../entities/Comment";

export interface CourseRepository {
  getAllCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | null>;
  getCoursesByCategory(category: string): Promise<Course[]>;
  enrollInCourse(courseId: string): Promise<any>;
  getModulesByCourse(courseId: string): Promise<Module[]>;
  getLessonsByModule(moduleId: string): Promise<Lesson[]>;
  completeLesson(lessonId: string): Promise<any>;
  getQuizzesByTarget(targetId: string): Promise<Quiz[]>;
  getQuizQuestions(quizId: string): Promise<Question[]>;
  submitQuizAttempt(quizId: string, answers: Record<string, string>): Promise<any>;
  getCommentsByTarget(targetId: string): Promise<Comment[]>;
  postComment(targetId: string, targetType: string, text: string, parentId?: string): Promise<Comment>;
}
