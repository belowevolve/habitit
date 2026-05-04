import { completionsStore, habitsStore } from "./db";
import type { Completion, Habit, HabitBase } from "./types";
import { ALL_DAYS, HABIT_TYPES } from "./types";

interface RawHabit {
  id: string;
  name: string;
  color: string;
  type: string;
  createdAt: number;
  schedule?: number[];
  target?: number;
  days?: number[];
  slots?: string[];
}

const normalizeHabit = (raw: RawHabit): Habit => {
  const base: HabitBase = {
    color: raw.color,
    createdAt: raw.createdAt,
    id: raw.id,
    name: raw.name,
    schedule: raw.schedule ?? [...ALL_DAYS],
  };

  switch (raw.type) {
    case HABIT_TYPES.counter: {
      return { ...base, target: raw.target ?? 1, type: HABIT_TYPES.counter };
    }
    case HABIT_TYPES.schedule: {
      return {
        ...base,
        schedule: raw.schedule ?? raw.days ?? [...ALL_DAYS],
        slots: raw.slots ?? [],
        type: HABIT_TYPES.schedule,
      };
    }
    default: {
      return { ...base, type: HABIT_TYPES.boolean };
    }
  }
};

export const habitApi = {
  async getAll(): Promise<Habit[]> {
    const raw = (await habitsStore.getAll()) as unknown as RawHabit[];
    return raw.map(normalizeHabit);
  },

  remove(id: string): Promise<void> {
    return habitsStore.remove(id);
  },

  save(habit: Habit): Promise<void> {
    return habitsStore.save(habit);
  },
};

export const completionApi = {
  getAll(): Promise<Completion[]> {
    return completionsStore.getAll();
  },

  getByDate(date: string): Promise<Completion[]> {
    return completionsStore.getByDate(date);
  },

  getByHabit(habitId: string): Promise<Completion[]> {
    return completionsStore.getByHabit(habitId);
  },

  remove(habitId: string, date: string, slot?: string): Promise<void> {
    return completionsStore.remove(habitId, date, slot);
  },

  removeByHabit(habitId: string): Promise<void> {
    return completionsStore.removeByHabit(habitId);
  },

  save(completion: Completion): Promise<void> {
    return completionsStore.save(completion);
  },
};
