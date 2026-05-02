import { action, atom, computed, withIndexedDb } from "@reatom/core";

import { today } from "@/shared/lib/date";

import type { Completion, Habit } from "./types";

export const habits = atom<Habit[]>([], "habits").extend(withIndexedDb("habits"));

export const completions = atom<Completion[]>([], "completions").extend(
  withIndexedDb("completions"),
);

export const addHabit = action((habit: Omit<Habit, "id" | "createdAt">) => {
  const newHabit: Habit = {
    ...habit,
    createdAt: Date.now(),
    id: crypto.randomUUID(),
  };
  habits.set((prev) => [...prev, newHabit]);
  return newHabit;
}, "habits.add");

export const editHabit = action((id: string, patch: Partial<Omit<Habit, "id" | "createdAt">>) => {
  habits.set((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
}, "habits.edit");

export const deleteHabit = action((id: string) => {
  habits.set((prev) => prev.filter((h) => h.id !== id));
  completions.set((prev) => prev.filter((c) => c.habitId !== id));
}, "habits.delete");

export const toggleCompletion = action((habitId: string) => {
  const dateStr = today();
  const exists = completions().some((c) => c.habitId === habitId && c.date === dateStr);

  if (exists) {
    completions.set((prev) => prev.filter((c) => !(c.habitId === habitId && c.date === dateStr)));
  } else {
    completions.set((prev) => [...prev, { date: dateStr, habitId }]);
  }
}, "completions.toggle");

export const todayCompletions = computed(() => {
  const dateStr = today();
  return completions().filter((c) => c.date === dateStr);
}, "completions.today");

export const todayProgress = computed(() => {
  const total = habits().length;
  if (total === 0) {
    return 0;
  }
  return todayCompletions().length / total;
}, "completions.todayProgress");

export const isCompletedToday = (habitId: string): boolean =>
  todayCompletions().some((c) => c.habitId === habitId);

const formatDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const getStreak = (habitId: string): number => {
  const dateStr = today();
  const habitCompletions = new Set(
    completions()
      .filter((c) => c.habitId === habitId)
      .map((c) => c.date),
  );

  let streak = 0;
  const current = new Date(dateStr);

  while (true) {
    const key = formatDate(current);
    if (habitCompletions.has(key)) {
      streak += 1;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export const selectedHabitId = atom<string | null>(null, "ui.selectedHabitId");

export const drawerOpen = atom(false, "ui.drawerOpen");

export const openAddDrawer = action(() => {
  selectedHabitId.set(null);
  drawerOpen.set(true);
}, "ui.openAddDrawer");

export const openEditDrawer = action((id: string) => {
  selectedHabitId.set(id);
  drawerOpen.set(true);
}, "ui.openEditDrawer");

export const closeDrawer = action(() => {
  drawerOpen.set(false);
  selectedHabitId.set(null);
}, "ui.closeDrawer");
