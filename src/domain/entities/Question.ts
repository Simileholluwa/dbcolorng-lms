export interface Question {
  id: string;
  quiz_id: string;
  text: string;
  type: string; // "multiple_choice" | "true_false" | "short_answer"
  options: string[];
  correct_answer: string;
  points: number;
}
