import { reatomComponent } from "@reatom/react";

import { Card, CardContent } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";

import { completions, toggleCompletion } from "../model";
import type { ScheduleHabit } from "../types";
import { ScheduleIndicator } from "./schedule-indicator";

interface ScheduleCardProps {
  habit: ScheduleHabit;
}

export const ScheduleCard = reatomComponent<ScheduleCardProps>(({ habit }) => {
  const all = completions.data();
  const habitCompletions = all.filter((c) => c.habitId === habit.id);
  const completedSlots = new Set(habitCompletions.map((c) => c.slot));
  const allDone = habit.slots.length > 0 && habit.slots.every((s) => completedSlots.has(s));

  return (
    <Card size="sm" className="transition-transform active:scale-[0.98]">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className={allDone ? "line-through text-muted-foreground" : ""}>
              {habit.name}
            </span>
            <ScheduleIndicator schedule={habit.schedule} />
          </div>
          <div className="ml-auto size-3 rounded-full" style={{ backgroundColor: habit.color }} />
        </div>
        {habit.slots.length > 0 && (
          <div className="flex flex-col gap-1 pl-1">
            {habit.slots.map((slot) => (
              <div key={slot} className="flex items-center gap-2">
                <Checkbox
                  checked={completedSlots.has(slot)}
                  onCheckedChange={() => toggleCompletion(habit.id, slot)}
                  aria-label={`Отметить "${habit.name}" на ${slot}`}
                  className="size-4"
                />
                <span
                  className={
                    completedSlots.has(slot)
                      ? "text-xs text-muted-foreground line-through"
                      : "text-xs"
                  }
                >
                  {slot}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}, "ScheduleCard");
