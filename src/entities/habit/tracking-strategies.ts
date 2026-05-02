import { HABIT_TRACKING_TYPE } from "./types";
import type { Completion, Habit, HabitCompletionStatus, TrackingType } from "./types";

export interface TrackingStrategy {
  isCompleted(habit: Habit, dayCompletions: Completion[]): boolean;
  getStatus(habit: Habit, dayCompletions: Completion[]): HabitCompletionStatus;
}

const booleanStrategy: TrackingStrategy = {
  getStatus(_habit, dayCompletions) {
    const isDone = dayCompletions.length > 0;
    return { completed: isDone, completedSlots: [], current: isDone ? 1 : 0, target: 1 };
  },
  isCompleted(_habit, dayCompletions) {
    return dayCompletions.length > 0;
  },
};

const numericStrategy: TrackingStrategy = {
  getStatus(habit, dayCompletions) {
    if (habit.trackingType !== HABIT_TRACKING_TYPE.NUMERIC) {
      throw new Error("unreachable: numeric strategy called with non-numeric habit");
    }
    const entry = dayCompletions.find((c) => !c.slot);
    const current = entry?.value ?? 0;
    return {
      completed: current >= habit.target,
      completedSlots: [],
      current,
      target: habit.target,
    };
  },
  isCompleted(habit, dayCompletions) {
    if (habit.trackingType !== HABIT_TRACKING_TYPE.NUMERIC) {
      return false;
    }
    const entry = dayCompletions.find((c) => !c.slot);
    return entry ? (entry.value ?? 0) >= habit.target : false;
  },
};

const scheduleStrategy: TrackingStrategy = {
  getStatus(habit, dayCompletions) {
    if (habit.trackingType !== HABIT_TRACKING_TYPE.SCHEDULE) {
      throw new Error("unreachable: schedule strategy called with non-schedule habit");
    }
    const completedSlots = dayCompletions
      .filter((c): c is Completion & { slot: string } => c.slot !== undefined)
      .map((c) => c.slot);
    return {
      completed: habit.slots.length > 0 && completedSlots.length >= habit.slots.length,
      completedSlots,
      current: completedSlots.length,
      target: habit.slots.length,
    };
  },
  isCompleted(habit, dayCompletions) {
    if (habit.trackingType !== HABIT_TRACKING_TYPE.SCHEDULE) {
      return false;
    }
    const completed = dayCompletions.filter((c) => c.slot);
    return habit.slots.length > 0 && completed.length >= habit.slots.length;
  },
};

const strategies: Record<TrackingType, TrackingStrategy> = {
  [HABIT_TRACKING_TYPE.BOOLEAN]: booleanStrategy,
  [HABIT_TRACKING_TYPE.NUMERIC]: numericStrategy,
  [HABIT_TRACKING_TYPE.SCHEDULE]: scheduleStrategy,
};

export const getStrategy = (trackingType: TrackingType): TrackingStrategy =>
  strategies[trackingType];

export const getQuickAdds = (target: number): number[] => {
  if (target <= 3) {
    return [];
  }
  const candidates = [2, 3, 5, 10, 15, 20, 25, 50, 100];
  const valid = candidates.filter((n) => n < target && n <= target / 2);
  if (valid.length <= 3) {
    return valid;
  }
  const last = valid.length - 1;
  return [valid[0], valid[Math.floor(last / 2)], valid[last]];
};
