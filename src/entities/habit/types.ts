export interface Habit {
  id: string;
  title: string;
  emoji: string;
  frequency: "daily" | "weekly";
  createdAt: number;
}

export interface Completion {
  habitId: string;
  date: string;
}
