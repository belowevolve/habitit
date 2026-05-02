import { useAtom } from "@reatom/react";
import { Check, Flame } from "lucide-react";

import {
  getStreak,
  habits,
  isCompletedToday,
  openEditDrawer,
  todayCompletions,
  toggleCompletion,
} from "@/entities/habit/model";

const HabitItem = ({ id, title, emoji }: { id: string; title: string; emoji: string }) => {
  useAtom(todayCompletions);
  const completed = isCompletedToday(id);
  const streak = getStreak(id);

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors">
      <button
        type="button"
        aria-label={completed ? `Mark ${title} incomplete` : `Mark ${title} complete`}
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border-2 text-lg transition-all ${
          completed
            ? "border-primary bg-primary text-primary-foreground scale-95"
            : "border-border bg-background hover:border-primary/50"
        }`}
        onClick={() => toggleCompletion(id)}
      >
        {completed ? <Check className="size-5" strokeWidth={3} /> : emoji}
      </button>

      <button
        type="button"
        className="flex min-w-0 flex-1 flex-col items-start text-left"
        onClick={() => openEditDrawer(id)}
      >
        <span
          className={`text-sm font-medium leading-tight ${
            completed ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {title}
        </span>
        {streak > 0 && (
          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="size-3 text-chart-1" />
            {streak} day{streak === 1 ? "" : "s"}
          </span>
        )}
      </button>
    </li>
  );
};

export const HabitList = () => {
  const [habitList] = useAtom(habits);
  useAtom(todayCompletions);

  if (habitList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="text-5xl">🌱</div>
        <p className="text-lg font-medium text-foreground">No habits yet</p>
        <p className="text-sm text-muted-foreground">
          Tap the button below to start building your first habit
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {habitList.map((habit) => (
        <HabitItem key={habit.id} id={habit.id} title={habit.title} emoji={habit.emoji} />
      ))}
    </ul>
  );
};
