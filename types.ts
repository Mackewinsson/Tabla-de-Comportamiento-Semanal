export interface FeedbackEntry {
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  points: number;
  days: number[]; // Array of day indices, 0 = Lunes, 6 = Domingo
  completed: { [dayIndex: number]: boolean }; // Map of day index to completion state
}

export interface Child {
  id: string;
  name: string;
  avatar: string;
  scores: number[]; // Array of 7, index 0 is Monday. 0 = not rated.
  feedbackHistory: FeedbackEntry[];
  tasks: Task[]; // Tasks assigned to this child
  pointsGoal?: number; // Weekly points goal for reward
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}