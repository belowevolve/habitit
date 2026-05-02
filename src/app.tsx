import { useAtom } from "@reatom/react";
import { Plus } from "lucide-react";

import { habits, openAddDrawer, todayCompletions, todayProgress } from "@/entities/habit/model";
import { HabitFormDrawer } from "@/features/habit-form/ui";
import { HabitList } from "@/features/habit-list/ui";
import { formatDisplayDate } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";

const ProgressRing = ({ progress }: { progress: number }) => {
  const radius = 18;
  const stroke = 3.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg width="44" height="44" className="-rotate-90">
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-muted"
      />
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-primary transition-all duration-500"
      />
    </svg>
  );
};

const App = () => {
  const [habitList] = useAtom(habits);
  const [completed] = useAtom(todayCompletions);
  const [progress] = useAtom(todayProgress);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-24">
      <header className="flex items-center justify-between pb-2 pt-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">habitit</h1>
          <p className="text-sm text-muted-foreground">{formatDisplayDate()}</p>
        </div>

        {habitList.length > 0 && (
          <div className="relative flex items-center justify-center">
            <ProgressRing progress={progress} />
            <span className="absolute text-xs font-semibold text-foreground">
              {completed.length}/{habitList.length}
            </span>
          </div>
        )}
      </header>

      <main className="flex-1 py-4">
        <HabitList />
      </main>

      <div className="fixed inset-x-0 bottom-0 flex justify-center pb-6 pointer-events-none">
        <Button
          size="lg"
          className="pointer-events-auto gap-1.5 rounded-full px-5 shadow-lg"
          onClick={() => openAddDrawer()}
        >
          <Plus className="size-5" />
          Add habit
        </Button>
      </div>

      <HabitFormDrawer />
    </div>
  );
};

export default App;
