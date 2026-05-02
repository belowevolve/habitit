import { reatomComponent } from "@reatom/react";
import { Check, Flame, Minus, Plus } from "lucide-react";

import {
  decrementCompletion,
  getHabitCompletionStatus,
  getStreak,
  habitList,
  incrementCompletion,
  openEditDrawer,
  toggleCompletion,
  toggleSlotCompletion,
} from "@/entities/habit/model";
import { getQuickAdds } from "@/entities/habit/tracking-strategies";
import type { Habit, NumericHabit, ScheduleHabit } from "@/entities/habit/types";
import { cn } from "@/shared/lib/css";
import { pluralizeDays } from "@/shared/lib/pluralize";
import { useLongPress } from "@/shared/lib/use-long-press";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/empty";
import { Toggle } from "@/shared/ui/toggle";

const BooleanControl = reatomComponent(
  ({ id, title, emoji }: { id: string; title: string; emoji: string }) => {
    const status = getHabitCompletionStatus(id);
    return (
      <button
        type="button"
        onClick={() => toggleCompletion(id)}
        aria-pressed={status.completed}
        aria-label={
          status.completed ? `Отметить ${title} невыполненной` : `Отметить ${title} выполненной`
        }
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border-2 text-lg transition-all",
          status.completed
            ? "scale-95 border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            : "border-border bg-background hover:border-primary/50",
        )}
      >
        {status.completed ? <Check className="size-5" strokeWidth={3} /> : emoji}
      </button>
    );
  },
  "BooleanControl",
);

const NumericControl = reatomComponent(({ habit }: { habit: NumericHabit }) => {
  const status = getHabitCompletionStatus(habit.id);
  const quickAdds = getQuickAdds(habit.target);
  const incrementProps = useLongPress(() => incrementCompletion(habit.id));
  const decrementProps = useLongPress(() => decrementCompletion(habit.id));

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="size-8 touch-none p-0 select-none"
          disabled={status.current === 0}
          {...decrementProps}
        >
          <Minus className="size-4" />
        </Button>
        <Badge
          variant={status.completed ? "default" : "secondary"}
          className="min-w-10 justify-center text-xs tabular-nums"
        >
          {status.current}/{status.target}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 touch-none p-0 select-none"
          {...incrementProps}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {quickAdds.length > 0 && (
        <div className="flex gap-1">
          {quickAdds.map((n) => (
            <Button
              key={n}
              variant="ghost"
              size="xs"
              className="tabular-nums"
              onClick={() => incrementCompletion(habit.id, n)}
            >
              +{n}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}, "NumericControl");

const ScheduleControl = reatomComponent(({ habit }: { habit: ScheduleHabit }) => {
  const status = getHabitCompletionStatus(habit.id);
  return (
    <div className="flex flex-wrap gap-1">
      {habit.slots.map((slot) => (
        <Toggle
          key={slot}
          pressed={status.completedSlots.includes(slot)}
          onPressedChange={() => toggleSlotCompletion(habit.id, slot)}
          size="sm"
          className="aria-pressed:bg-primary/15 aria-pressed:text-primary aria-pressed:line-through"
        >
          {slot}
        </Toggle>
      ))}
    </div>
  );
}, "ScheduleControl");

const HabitItem = reatomComponent(({ habit }: { habit: Habit }) => {
  const status = getHabitCompletionStatus(habit.id);
  const streak = getStreak(habit.id);

  return (
    <li
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 transition-colors",
        status.completed && "border-primary/20 bg-primary/5",
      )}
    >
      {habit.trackingType === "boolean" && (
        <BooleanControl id={habit.id} title={habit.title} emoji={habit.emoji} />
      )}

      {habit.trackingType !== "boolean" && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
          {habit.emoji}
        </span>
      )}

      <button
        type="button"
        className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left"
        onClick={() => openEditDrawer(habit.id)}
      >
        <span
          className={cn(
            "text-sm font-medium leading-tight",
            status.completed ? "text-muted-foreground line-through" : "text-foreground",
          )}
        >
          {habit.title}
        </span>
        {streak > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="size-3 text-chart-1" />
            {pluralizeDays(streak)}
          </span>
        )}
      </button>

      {habit.trackingType === "numeric" && <NumericControl habit={habit} />}
      {habit.trackingType === "schedule" && <ScheduleControl habit={habit} />}
    </li>
  );
}, "HabitItem");

export const HabitList = reatomComponent(() => {
  const list = habitList();

  if (list.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia>
            <span className="text-5xl">🌱</span>
          </EmptyMedia>
          <EmptyTitle>Привычек пока нет</EmptyTitle>
          <EmptyDescription>Нажмите кнопку ниже, чтобы создать первую привычку</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {list.map((habit) => (
        <HabitItem key={habit.id} habit={habit} />
      ))}
    </ul>
  );
}, "HabitList");
