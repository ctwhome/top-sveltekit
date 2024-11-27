export interface Todo extends Record<string, unknown> {
  id?: string;
  title: string;
  completed: boolean;
  created_at?: string;
  user?: string; // Reference to user:id
}
