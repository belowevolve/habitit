import { action, atom, computed, reatomBoolean, reatomMap, withIndexedDb } from "@reatom/core";

import { today, toDateString } from "@/shared/lib/date";

import { getStrategy } from "./tracking-strategies";
import type { Completion, Habit, HabitCompletionStatus, NewHabit } from "./types";

export const isHydrated = atom(false, "app.hydrated");
setTimeout(() => {
  isHydrated.set(true);
}, 100);

export const habits = reatomMap<Habit["id"], Habit>(new Map(), "habits").extend(
  withIndexedDb({
    fromSnapshot: (raw) => {
      isHydrated.set(true);
      return new Map(raw as Map<string, Habit>);
    },
    key: "habits",
  }),
);

export const habitList = computed(() => [...habits().values()], "habitList");

export const completions = reatomMap<string, Completion[]>(new Map(), "completions").extend(
  withIndexedDb({
    key: "completions",
  }),
);

export const addHabit = action((data: NewHabit) => {
  const id = crypto.randomUUID();
  habits.set(id, { ...data, createdAt: Date.now(), id });
}, "habits.add");

export const editHabit = action((id: string, data: NewHabit) => {
  const existing = habits().get(id);
  if (!existing) {
    return;
  }
  habits.set(id, { ...existing, ...data });
}, "habits.edit");

export const deleteHabit = action((id: string) => {
  habits.delete(id);
  completions.delete(id);
}, "habits.delete");

export const toggleCompletion = action((habitId: string) => {
  const dateStr = today();
  const list = completions().get(habitId) ?? [];
  const exists = list.some((c) => c.date === dateStr && !c.slot);
  if (exists) {
    completions.set(
      habitId,
      list.filter((c) => !(c.date === dateStr && !c.slot)),
    );
  } else {
    completions.set(habitId, [...list, { completedAt: Date.now(), date: dateStr, habitId }]);
  }
}, "completions.toggle");

export const incrementCompletion = action((habitId: string, step = 1) => {
  const dateStr = today();
  const list = completions().get(habitId) ?? [];
  const idx = list.findIndex((c) => c.date === dateStr && !c.slot);
  if (idx === -1) {
    completions.set(habitId, [
      ...list,
      { completedAt: Date.now(), date: dateStr, habitId, value: step },
    ]);
  } else {
    completions.set(
      habitId,
      list.with(idx, {
        ...list[idx],
        completedAt: Date.now(),
        value: (list[idx].value ?? 0) + step,
      }),
    );
  }
}, "completions.increment");

export const decrementCompletion = action((habitId: string, step = 1) => {
  const dateStr = today();
  const list = completions().get(habitId) ?? [];
  const idx = list.findIndex((c) => c.date === dateStr && !c.slot);
  if (idx === -1) {
    return;
  }
  const current = list[idx].value ?? 0;
  if (current <= step) {
    completions.set(
      habitId,
      list.filter((_, i) => i !== idx),
    );
  } else {
    completions.set(habitId, list.with(idx, { ...list[idx], value: current - step }));
  }
}, "completions.decrement");

export const toggleSlotCompletion = action((habitId: string, slot: string) => {
  const dateStr = today();
  const list = completions().get(habitId) ?? [];
  const exists = list.some((c) => c.date === dateStr && c.slot === slot);
  if (exists) {
    completions.set(
      habitId,
      list.filter((c) => !(c.date === dateStr && c.slot === slot)),
    );
  } else {
    completions.set(habitId, [...list, { completedAt: Date.now(), date: dateStr, habitId, slot }]);
  }
}, "completions.toggleSlot");

const getCompletionsForDate = (habitId: string, dateStr: string): Completion[] => {
  const list = completions().get(habitId) ?? [];
  return list.filter((c) => c.date === dateStr);
};

export const todayStats = computed(() => {
  const habitMap = habits();
  const total = habitMap.size;
  if (total === 0) {
    return { completed: 0, progress: 0, total: 0 };
  }

  const dateStr = today();
  let completed = 0;
  for (const habit of habitMap.values()) {
    const tc = getCompletionsForDate(habit.id, dateStr);
    if (getStrategy(habit.trackingType).isCompleted(habit, tc)) {
      completed += 1;
    }
  }
  return { completed, progress: completed / total, total };
}, "todayStats");

export const getHabitCompletionStatus = (habitId: string): HabitCompletionStatus => {
  const habit = habits().get(habitId);
  if (!habit) {
    return { completed: false, completedSlots: [], current: 0, target: 0 };
  }
  const tc = getCompletionsForDate(habitId, today());
  return getStrategy(habit.trackingType).getStatus(habit, tc);
};

export const getStreak = (habitId: string): number => {
  const habit = habits().get(habitId);
  const all = completions().get(habitId) ?? [];
  if (!habit || all.length === 0) {
    return 0;
  }

  const strategy = getStrategy(habit.trackingType);
  const byDate = new Map<string, Completion[]>();
  for (const c of all) {
    const list = byDate.get(c.date) ?? [];
    list.push(c);
    byDate.set(c.date, list);
  }

  let streak = 0;
  const current = new Date(today());
  for (;;) {
    const key = toDateString(current);
    const day = byDate.get(key) ?? [];
    if (day.length > 0 && strategy.isCompleted(habit, day)) {
      streak += 1;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export const historyFilter = atom<string | null>(null, "ui.historyFilter");

export const groupedHistory = computed(() => {
  const habitMap = habits();
  const filter = historyFilter();
  const allCompletions = completions();

  const byDate = new Map<string, (Completion & { habit?: Habit })[]>();

  const collect = (habitId: string, list: Completion[]) => {
    const habit = habitMap.get(habitId);
    for (const c of list) {
      const entries = byDate.get(c.date) ?? [];
      entries.push({ ...c, habit });
      byDate.set(c.date, entries);
    }
  };

  if (filter) {
    collect(filter, allCompletions.get(filter) ?? []);
  } else {
    for (const [habitId, list] of allCompletions) {
      collect(habitId, list);
    }
  }

  return [...byDate.entries()]
    .toSorted(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => ({ date, entries }));
}, "groupedHistory");

export const selectedHabitId = atom<string | null>(null, "ui.selectedHabitId");
export const drawerOpen = reatomBoolean(false, "ui.drawerOpen");

export const openAddDrawer = action(() => {
  selectedHabitId.set(null);
  drawerOpen.setTrue();
}, "ui.openAddDrawer");

export const openEditDrawer = action((id: string) => {
  selectedHabitId.set(id);
  drawerOpen.setTrue();
}, "ui.openEditDrawer");

export const closeDrawer = action(() => {
  drawerOpen.setFalse();
  selectedHabitId.set(null);
}, "ui.closeDrawer");
