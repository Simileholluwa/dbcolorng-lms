export interface Quiz {
  id: string;
  target_id: string;
  target_type: string; // "course" | "module"
  title: string;
  description: string;
  min_passing_score: number;
}
