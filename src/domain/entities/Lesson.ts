export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  video_url?: string;
  pdf_url?: string;
  body_text?: string;
  order: number;
  duration_seconds?: number;
  duration?: number;
}
