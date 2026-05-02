import { useAtom } from "@reatom/react";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  addHabit,
  closeDrawer,
  deleteHabit,
  drawerOpen,
  editHabit,
  habits,
  selectedHabitId,
} from "@/entities/habit/model";
import type { Habit } from "@/entities/habit/types";
import { Button } from "@/shared/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";

const EMOJI_OPTIONS = [
  "💪",
  "📚",
  "🏃",
  "💧",
  "🧘",
  "🎯",
  "✍️",
  "🛌",
  "🥗",
  "🎨",
  "🎵",
  "💊",
  "🧹",
  "📱",
  "🌅",
  "🧠",
];

const HabitForm = ({ habit }: { habit?: Habit }) => {
  const [title, setTitle] = useState(habit?.title ?? "");
  const [emoji, setEmoji] = useState(habit?.emoji ?? EMOJI_OPTIONS[0]);
  const [frequency, setFrequency] = useState<"daily" | "weekly">(habit?.frequency ?? "daily");

  useEffect(() => {
    setTitle(habit?.title ?? "");
    setEmoji(habit?.emoji ?? EMOJI_OPTIONS[0]);
    setFrequency(habit?.frequency ?? "daily");
  }, [habit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    if (habit) {
      editHabit(habit.id, { emoji, frequency, title: trimmed });
    } else {
      addHabit({ emoji, frequency, title: trimmed });
    }
    closeDrawer();
  };

  const handleDelete = () => {
    if (habit) {
      deleteHabit(habit.id);
      closeDrawer();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 px-4 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="habit-title" className="text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="habit-title"
          type="text"
          placeholder="e.g. Drink 8 glasses of water"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Icon</span>
        <div className="grid grid-cols-8 gap-1.5">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`flex size-10 items-center justify-center rounded-lg text-lg transition-all ${
                emoji === e
                  ? "bg-primary/15 ring-2 ring-primary scale-110"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Frequency</span>
        <div className="flex gap-2">
          {(["daily", "weekly"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                frequency === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <DrawerFooter className="px-0">
        <Button type="submit" disabled={!title.trim()}>
          {habit ? "Save changes" : "Add habit"}
        </Button>

        {habit && (
          <Button type="button" variant="destructive" onClick={handleDelete}>
            <Trash2 className="size-4" />
            Delete habit
          </Button>
        )}

        <DrawerClose render={<Button variant="ghost" type="button" />}>Cancel</DrawerClose>
      </DrawerFooter>
    </form>
  );
};

export const HabitFormDrawer = () => {
  const [open] = useAtom(drawerOpen);
  const [editId] = useAtom(selectedHabitId);
  const [habitList] = useAtom(habits);

  const editingHabit = editId ? habitList.find((h) => h.id === editId) : undefined;

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeDrawer();
        }
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{editingHabit ? "Edit habit" : "New habit"}</DrawerTitle>
          <DrawerDescription>
            {editingHabit ? "Update your habit details" : "What habit do you want to build?"}
          </DrawerDescription>
        </DrawerHeader>

        <HabitForm habit={editingHabit} key={editId ?? "new"} />
      </DrawerContent>
    </Drawer>
  );
};
