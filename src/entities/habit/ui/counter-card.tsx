import { reatomComponent } from "@reatom/react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";

import { completions, setCounterValue } from "../model";
import type { CounterHabit } from "../types";
import { ScheduleIndicator } from "./schedule-indicator";

interface CounterCardProps {
  habit: CounterHabit;
}

export const CounterCard = reatomComponent<CounterCardProps>(({ habit }) => {
  const all = completions.data();
  const completion = all.find((c) => c.habitId === habit.id);
  const current = completion?.value ?? 0;
  const percentage = Math.min((current / habit.target) * 100, 100);

  const decrement = () => setCounterValue(habit.id, Math.max(0, current - 1));
  const increment = () => setCounterValue(habit.id, current + 1);

  return (
    <Card size="sm" className="transition-transform active:scale-[0.98]">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className={current >= habit.target ? "text-muted-foreground line-through" : ""}>
              {habit.name}
            </span>
            <ScheduleIndicator schedule={habit.schedule} />
          </div>
          <div className="ml-auto size-3 rounded-full" style={{ backgroundColor: habit.color }} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={decrement}
            disabled={current <= 0}
            aria-label="Уменьшить"
          >
            <Minus />
          </Button>
          <div className="flex-1">
            <Progress value={percentage} />
          </div>
          <span className="min-w-[3ch] text-center text-xs tabular-nums text-muted-foreground">
            {current}/{habit.target}
          </span>
          <Button variant="outline" size="icon-sm" onClick={increment} aria-label="Увеличить">
            <Plus />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}, "CounterCard");
