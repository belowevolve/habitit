export type TrackingType = "boolean" | "numeric" | "schedule";
interface HabitBase {
  id: string;
  title: string;
  emoji: string;
  frequency: "daily" | "weekly";
  createdAt: number;
}

export interface BooleanHabit extends HabitBase {
  trackingType: "boolean";
}

export interface NumericHabit extends HabitBase {
  trackingType: "numeric";
  target: number;
}

export interface ScheduleHabit extends HabitBase {
  trackingType: "schedule";
  slots: string[];
}

export type Habit = BooleanHabit | NumericHabit | ScheduleHabit;

type DistributiveOmit<T, K extends string> = T extends unknown ? Omit<T, K> : never;

export type NewHabit = DistributiveOmit<Habit, "id" | "createdAt">;

export interface Completion {
  habitId: Habit["id"];
  date: string;
  completedAt: number;
  value?: number;
  slot?: string;
}

export interface HabitCompletionStatus {
  completed: boolean;
  completedSlots: string[];
  current: number;
  target: number;
}
