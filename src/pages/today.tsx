import { Plus } from "lucide-react";

import { openHabitForm } from "@/entities/habit/model";
import { HabitForm } from "@/features/habit-form/ui";
import { HabitList } from "@/features/habit-list/ui";
import { formatDisplayDate } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";

export const TodayPage = () => {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-24 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Сегодня</h1>
        <p className="text-sm text-muted-foreground capitalize">{formatDisplayDate()}</p>
      </header>

      <HabitList />
      <HabitForm />

      <Button
        size="icon-lg"
        className="fixed bottom-6 right-6 size-12 rounded-full shadow-lg"
        onClick={() => openHabitForm()}
        aria-label="Добавить привычку"
      >
        <Plus className="size-5" />
      </Button>
    </div>
  );
};
