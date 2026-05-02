export const HABIT_TRACKING_TYPE = {
  BOOLEAN: "BOOLEAN",
  NUMERIC: "NUMERIC",
  SCHEDULE: "SCHEDULE",
} as const;

export type TrackingType = (typeof HABIT_TRACKING_TYPE)[keyof typeof HABIT_TRACKING_TYPE];

interface HabitBase {
  trackingType: TrackingType;
  id: string;
  title: string;
  emoji: string;
  frequency: "daily" | "weekly";
  createdAt: number;
}

export interface BooleanHabit extends HabitBase {
  trackingType: typeof HABIT_TRACKING_TYPE.BOOLEAN;
}

export interface NumericHabit extends HabitBase {
  trackingType: typeof HABIT_TRACKING_TYPE.NUMERIC;
  target: number;
}

export interface ScheduleHabit extends HabitBase {
  trackingType: typeof HABIT_TRACKING_TYPE.SCHEDULE;
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
