import { Course } from "../../domain/entities/Course";
import { CourseRepository } from "../../domain/repositories/CourseRepository";

export class GetCoursesUseCase {
  constructor(private courseRepository: CourseRepository) {}

  async execute(): Promise<Course[]> {
    return await this.courseRepository.getAllCourses();
  }
}
