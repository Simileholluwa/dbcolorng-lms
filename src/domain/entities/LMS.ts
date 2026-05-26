import { Course } from "./Course";

export interface LMSProfile {
  user_id: string;
  total_xp: number;
  level: number;
  enrolled_courses_count: number;
  completed_lessons_count: number;
  badges: string[];
  display_name?: string;
  photo_url?: string | null;
}

export interface Enrollment {
  id: string;
  course_id: string;
  status: "active" | "completed";
  completed_lessons: string[];
  progress_percent: number;
  enrolled_at: number;
  completed_at?: number;
  course: Course;
}

export interface Announcement {
  id: string;
  course_id: string;
  instructor_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: number;
  updated_at: number;
}
