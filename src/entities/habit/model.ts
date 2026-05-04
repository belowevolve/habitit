import { action, atom, computed, withAsync, withAsyncData, wrap } from "@reatom/core";

import { today } from "@/shared/lib/date";

import { completionApi, habitApi } from "./api";
import type { Completion, Habit, HabitType } from "./types";
import { ALL_DAYS, HABIT_TYPES } from "./types";

// --- Habits ---

export const habits = computed(async () => await wrap(habitApi.getAll()), "habits").extend(
  withAsyncData({ initState: [] as Habit[] }),
);

export const selectedDate = atom(today(), "habits.selectedDate");

export const completions = computed(async () => {
  const date = selectedDate();
  return await wrap(completionApi.getByDate(date));
}, "habits.completions").extend(withAsyncData({ initState: [] as Completion[] }));

const getTodayWeekday = (): number => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
};

export const visibleHabits = computed((): Habit[] => {
  const all = habits.data();
  const weekday = getTodayWeekday();
  return all.filter((h) => h.schedule.includes(weekday));
}, "habits.visible");

// --- History ---

export const allCompletions = computed(
  async () => await wrap(completionApi.getAll()),
  "history.allCompletions",
).extend(withAsyncData({ initState: [] as Completion[] }));

export const historyFilter = atom<string | null>(null, "history.filter");

export const setHistoryFilter = action((id: string | null) => {
  historyFilter.set(id);
}, "history.setFilter");

export const habitList = computed(() => habits.data(), "history.habitList");

export interface HistoryEntry extends Completion {
  habit?: Habit;
}

export interface HistoryGroup {
  date: string;
  entries: HistoryEntry[];
}

export const groupedHistory = computed((): HistoryGroup[] => {
  const all = allCompletions.data();
  const filter = historyFilter();
  const habitMap = new Map(habits.data().map((h) => [h.id, h]));

  const filtered = filter ? all.filter((c) => c.habitId === filter) : all;

  const groups = new Map<string, HistoryEntry[]>();
  for (const c of filtered) {
    const entries = groups.get(c.date) ?? [];
    entries.push({ ...c, habit: habitMap.get(c.habitId) });
    groups.set(c.date, entries);
  }

  return [...groups.entries()]
    .toSorted(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => ({
      date,
      entries: entries.toSorted((a, b) => b.completedAt - a.completedAt),
    }));
}, "history.grouped");

// --- Form Draft ---

const DEFAULT_COLOR = "#3b82f6";
const DEFAULT_TARGET = 10;
const DEFAULT_SLOTS: string[] = ["08:00", "12:00", "18:00"];

export const isDrawerOpen = atom(false, "habitForm.isOpen");

export const habitDraft = {
  color: atom(DEFAULT_COLOR, "habitDraft.color"),
  name: atom("", "habitDraft.name"),
  schedule: atom<number[]>([...ALL_DAYS], "habitDraft.schedule"),
  slots: atom<string[]>([...DEFAULT_SLOTS], "habitDraft.slots"),
  target: atom(DEFAULT_TARGET, "habitDraft.target"),
  type: atom<HabitType>(HABIT_TYPES.boolean, "habitDraft.type"),
};

export const resetDraft = action(() => {
  habitDraft.name.set("");
  habitDraft.type.set(HABIT_TYPES.boolean);
  habitDraft.color.set(DEFAULT_COLOR);
  habitDraft.target.set(DEFAULT_TARGET);
  habitDraft.schedule.set([...ALL_DAYS]);
  habitDraft.slots.set([...DEFAULT_SLOTS]);
}, "habitDraft.reset");

export const openHabitForm = action(() => {
  resetDraft();
  isDrawerOpen.set(true);
}, "habitForm.open");

export const closeHabitForm = action(() => {
  isDrawerOpen.set(false);
}, "habitForm.close");

export const createHabitFromDraft = action(async () => {
  const name = habitDraft.name().trim();
  if (!name) {
    return;
  }

  const type = habitDraft.type();
  const base = {
    color: habitDraft.color(),
    createdAt: Date.now(),
    id: crypto.randomUUID(),
    name,
    schedule: habitDraft.schedule(),
  };

  let habit: Habit;
  switch (type) {
    case HABIT_TYPES.boolean: {
      habit = { ...base, type: HABIT_TYPES.boolean };
      break;
    }
    case HABIT_TYPES.counter: {
      habit = { ...base, target: habitDraft.target(), type: HABIT_TYPES.counter };
      break;
    }
    case HABIT_TYPES.schedule: {
      habit = { ...base, slots: habitDraft.slots(), type: HABIT_TYPES.schedule };
      break;
    }
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown habit type: ${_exhaustive}`);
    }
  }

  await wrap(habitApi.save(habit));
  habits.retry();
  closeHabitForm();
}, "habitDraft.create").extend(withAsync());

// --- Habit CRUD ---

export const updateHabit = action(async (habit: Habit) => {
  await wrap(habitApi.save(habit));
  habits.retry();
}, "habits.update").extend(withAsync());

export const removeHabit = action(async (id: string) => {
  await wrap(completionApi.removeByHabit(id));
  await wrap(habitApi.remove(id));
  habits.retry();
  allCompletions.retry();
}, "habits.remove").extend(withAsync());

// --- Completions ---

export const toggleCompletion = action(async (habitId: string, slot?: string) => {
  const date = selectedDate();
  const current = completions.data();

  const existing =
    slot === undefined
      ? current.find((c) => c.habitId === habitId)
      : current.find((c) => c.habitId === habitId && c.slot === slot);

  if (existing) {
    await wrap(completionApi.remove(habitId, date, slot));
  } else {
    const completion: Completion = {
      completedAt: Date.now(),
      date,
      habitId,
      id: crypto.randomUUID(),
      ...(slot === undefined ? {} : { slot }),
      value: 1,
    };
    await wrap(completionApi.save(completion));
  }

  completions.retry();
  allCompletions.retry();
}, "habits.toggleCompletion").extend(withAsync());

export const setCounterValue = action(async (habitId: string, value: number) => {
  const date = selectedDate();
  const current = completions.data();
  const existing = current.find((c) => c.habitId === habitId);

  if (value <= 0 && existing) {
    await wrap(completionApi.remove(habitId, date));
  } else if (value > 0) {
    const completion: Completion = {
      completedAt: Date.now(),
      date,
      habitId,
      id: existing?.id ?? crypto.randomUUID(),
      value,
    };
    await wrap(completionApi.save(completion));
  }

  completions.retry();
  allCompletions.retry();
}, "habits.setCounterValue").extend(withAsync());
