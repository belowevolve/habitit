import { reatomComponent } from "@reatom/react";

import { Card, CardContent } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";

import { completions, toggleCompletion } from "../model";
import type { BooleanHabit } from "../types";
import { ScheduleIndicator } from "./schedule-indicator";

interface BooleanCardProps {
  habit: BooleanHabit;
}

export const BooleanCard = reatomComponent<BooleanCardProps>(({ habit }) => {
  const all = completions.data();
  const done = all.some((c) => c.habitId === habit.id);

  return (
    <Card size="sm" className="transition-transform active:scale-[0.98]">
      <CardContent className="flex items-center gap-3">
        <Checkbox
          checked={done}
          onCheckedChange={() => toggleCompletion(habit.id)}
          aria-label={`Отметить "${habit.name}"`}
          className="size-5"
        />
        <div className="flex flex-col">
          <span className={done ? "line-through text-muted-foreground" : ""}>{habit.name}</span>
          <ScheduleIndicator schedule={habit.schedule} />
        </div>
        <div className="ml-auto size-3 rounded-full" style={{ backgroundColor: habit.color }} />
      </CardContent>
    </Card>
  );
}, "BooleanCard");
