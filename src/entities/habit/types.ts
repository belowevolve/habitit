export const HABIT_TYPES = {
  boolean: "boolean",
  counter: "counter",
  schedule: "schedule",
} as const;

export type HabitType = (typeof HABIT_TYPES)[keyof typeof HABIT_TYPES];

export const ALL_DAYS: readonly number[] = [0, 1, 2, 3, 4, 5, 6];

export interface HabitBase {
  id: string;
  name: string;
  color: string;
  schedule: number[];
  createdAt: number;
}

export type BooleanHabit = HabitBase & {
  type: typeof HABIT_TYPES.boolean;
};

export type CounterHabit = HabitBase & {
  type: typeof HABIT_TYPES.counter;
  target: number;
};

export type ScheduleHabit = HabitBase & {
  type: typeof HABIT_TYPES.schedule;
  slots: string[];
};

export type Habit = BooleanHabit | CounterHabit | ScheduleHabit;

export interface Completion {
  id: string;
  habitId: string;
  date: string;
  value: number;
  slot?: string;
  completedAt: number;
}
