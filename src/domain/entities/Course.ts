export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: "video" | "text" | "quiz";
  order: number;
  duration?: number; // in minutes
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  thumbnail_url?: string;
  instructorId?: string;
  instructor_id?: string;
  price?: number;
  category: string;
  modules?: Module[];
  createdAt?: Date;
  updatedAt?: Date;
  created_at?: number;
  updated_at?: number;
  status?: string;
}

