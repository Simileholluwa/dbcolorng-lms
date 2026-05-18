import { Course } from "../entities/Course";
import { Module } from "../entities/Module";
import { Lesson } from "../entities/Lesson";
import { Quiz } from "../entities/Quiz";
import { Question } from "../entities/Question";

export interface AdminCourseInput {
  title: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  status?: string;
}

export interface AdminModuleInput {
  title: string;
  order: number;
  description?: string;
}

export interface AdminLessonInput {
  title: string;
  order: number;
  video_url?: string;
  pdf_url?: string;
  body_text?: string;
  duration_seconds?: number;
}

export interface AdminQuizInput {
  target_id: string;
  target_type: string; // "course" | "module"
  title: string;
  description?: string;
  min_passing_score?: number;
}

export interface AdminQuestionInput {
  text: string;
  type: string; // "multiple_choice" | "true_false"
  correct_answer: string;
  options?: string[];
  points?: number;
}

export interface AdminRepository {
  getAllCourses(limit?: number, skip?: number): Promise<{ items: Course[]; total: number }>;
  getCourseById(id: string): Promise<Course>;
  createCourse(data: AdminCourseInput): Promise<Course>;
  updateCourse(id: string, data: Partial<AdminCourseInput>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;

  // Module CRUD
  getModulesByCourse(courseId: string): Promise<Module[]>;
  createModule(courseId: string, data: AdminModuleInput): Promise<Module>;
  updateModule(moduleId: string, data: Partial<AdminModuleInput>): Promise<Module>;
  deleteModule(moduleId: string): Promise<void>;

  // Lesson CRUD
  getLessonsByModule(moduleId: string): Promise<Lesson[]>;
  createLesson(moduleId: string, data: AdminLessonInput): Promise<Lesson>;
  updateLesson(lessonId: string, data: Partial<AdminLessonInput>): Promise<Lesson>;
  deleteLesson(lessonId: string): Promise<void>;

  // Quiz & Question CRUD
  getQuizzesByTarget(targetId: string): Promise<Quiz[]>;
  getQuestionsByQuiz(quizId: string): Promise<Question[]>;
  createQuiz(data: AdminQuizInput): Promise<Quiz>;
  deleteQuiz(quizId: string): Promise<void>;
  addQuestion(quizId: string, data: AdminQuestionInput): Promise<Question>;
  deleteQuestion(questionId: string): Promise<void>;
}
