import { reatomComponent } from "@reatom/react";

import { habits, visibleHabits } from "@/entities/habit/model";
import { HabitCard } from "@/entities/habit/ui/habit-card";
import { Empty, EmptyDescription, EmptyTitle } from "@/shared/ui/empty";
import { Skeleton } from "@/shared/ui/skeleton";

export const HabitList = reatomComponent(() => {
  const ready = habits.ready();

  if (!ready) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    );
  }

  const visible = visibleHabits();

  if (visible.length === 0) {
    return (
      <Empty>
        <EmptyTitle>Нет привычек на сегодня</EmptyTitle>
        <EmptyDescription>Добавьте первую привычку, чтобы начать</EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {visible.map((habit) => (
        <div key={habit.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
          <HabitCard habit={habit} />
        </div>
      ))}
    </div>
  );
}, "HabitList");
