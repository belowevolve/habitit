import { reatomComponent } from "@reatom/react";
import { Check } from "lucide-react";

import { groupedHistory, habitList, historyFilter, setHistoryFilter } from "@/entities/habit/model";
import type { HistoryEntry } from "@/entities/habit/model";
import { HABIT_TYPES } from "@/entities/habit/types";
import type { Habit } from "@/entities/habit/types";
import { formatHistoryDate, formatTime } from "@/shared/lib/date";
import { pluralizeHabits } from "@/shared/lib/pluralize";
import { Badge } from "@/shared/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/empty";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { Separator } from "@/shared/ui/separator";
import { Toggle } from "@/shared/ui/toggle";

const CompletionDetail = ({ habit, entry }: { habit: Habit; entry: HistoryEntry }) => {
  if (habit.type === HABIT_TYPES.counter) {
    return (
      <Badge variant="secondary">
        {entry.value}/{habit.target}
      </Badge>
    );
  }
  if (habit.type === HABIT_TYPES.schedule && entry.slot) {
    return <Badge variant="outline">{entry.slot}</Badge>;
  }
  return <Check className="size-4 text-primary" />;
};

const CompletionEntry = ({ entry }: { entry: HistoryEntry }) => {
  if (!entry.habit) {
    return null;
  }

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <div
        className="size-4 shrink-0 rounded-full"
        style={{ backgroundColor: entry.habit.color }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-foreground">{entry.habit.name}</span>
        <span className="text-xs text-muted-foreground">{formatTime(entry.completedAt)}</span>
      </div>
      <CompletionDetail habit={entry.habit} entry={entry} />
    </div>
  );
};

const DayGroup = ({ date, entries }: { date: string; entries: HistoryEntry[] }) => {
  const uniqueCount = new Set(entries.map((e) => e.habitId)).size;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{formatHistoryDate(date)}</h3>
        <Badge variant="secondary">{pluralizeHabits(uniqueCount)}</Badge>
      </div>
      <div className="flex flex-col">
        {entries.map((entry, i) => (
          <CompletionEntry
            key={`${entry.habitId}-${entry.date}-${entry.slot ?? i}`}
            entry={entry}
          />
        ))}
      </div>
    </div>
  );
};

const HabitFilterChips = reatomComponent(() => {
  const list = habitList();

  if (list.length === 0) {
    return null;
  }

  return (
    <ScrollArea>
      <div className="flex gap-1.5 pb-3">
        <Toggle
          pressed={historyFilter() === null}
          onPressedChange={() => setHistoryFilter(null)}
          size="sm"
          className="shrink-0 rounded-full aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        >
          Все
        </Toggle>
        {list.map((habit) => (
          <Toggle
            key={habit.id}
            pressed={historyFilter() === habit.id}
            onPressedChange={() => setHistoryFilter(historyFilter() === habit.id ? null : habit.id)}
            size="sm"
            className="shrink-0 gap-1 rounded-full aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            <div className="size-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
            {habit.name}
          </Toggle>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}, "HabitFilterChips");

export const HabitHistory = reatomComponent(() => {
  const history = groupedHistory();

  if (history.length === 0 && historyFilter() === null) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia>
            <span className="text-5xl">📊</span>
          </EmptyMedia>
          <EmptyTitle>История пуста</EmptyTitle>
          <EmptyDescription>
            Начните выполнять привычки, и здесь появится ваша история
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col">
      <HabitFilterChips />

      {history.length === 0 ? (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyTitle>Нет записей</EmptyTitle>
            <EmptyDescription>Для этой привычки пока нет истории</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map(({ date, entries }, i) => (
            <div key={date}>
              {i > 0 && <Separator className="mb-4" />}
              <DayGroup date={date} entries={entries} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}, "HabitHistory");
