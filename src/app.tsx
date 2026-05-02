import { reatomComponent } from "@reatom/react";
import { Plus } from "lucide-react";

import { habitList, isHydrated, openAddDrawer, todayStats } from "@/entities/habit/model";
import { HabitFormDrawer } from "@/features/habit-form/ui";
import { HabitHistory } from "@/features/habit-history/ui";
import { HabitList } from "@/features/habit-list/ui";
import { formatDisplayDate } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

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

const LoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 py-3">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  );
};

const App = reatomComponent(() => {
  const hydrated = isHydrated();
  const stats = todayStats();

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-3 pb-20">
      <header className="flex items-center justify-between pb-2 pt-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">habitit</h1>
          <p className="text-sm capitalize text-muted-foreground">{formatDisplayDate()}</p>
        </div>

        {habitList().length > 0 && (
          <div className="relative flex items-center justify-center">
            <ProgressRing progress={stats.progress} />
            <span className="absolute text-xs font-semibold text-foreground">
              {stats.completed}/{stats.total}
            </span>
          </div>
        )}
      </header>

      <Tabs defaultValue="today" className="flex-1 py-2">
        <TabsList className="w-full">
          <TabsTrigger value="today" className="flex-1">
            Сегодня
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            История
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="py-3">
          {hydrated ? <HabitList /> : <LoadingSkeleton />}
        </TabsContent>

        <TabsContent value="history" className="py-3">
          {hydrated ? <HabitHistory /> : <LoadingSkeleton />}
        </TabsContent>
      </Tabs>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center pb-4">
        <Button
          size="lg"
          className="pointer-events-auto gap-1.5 rounded-full px-5 shadow-lg"
          onClick={() => openAddDrawer()}
        >
          <Plus data-icon="inline-start" />
          Добавить привычку
        </Button>
      </div>

      <HabitFormDrawer />
    </div>
  );
}, "App");

export default App;
