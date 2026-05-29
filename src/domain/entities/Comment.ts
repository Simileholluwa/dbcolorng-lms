export interface Comment {
  id: string;
  target_id: string;
  target_type: "lesson" | "course";
  user_id: string;
  user_display_name: string;
  text: string;
  parent_id?: string;
  created_at: number;
}
