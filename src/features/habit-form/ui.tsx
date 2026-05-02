import { entries } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import {
  addHabit,
  closeDrawer,
  deleteHabit,
  drawerOpen,
  editHabit,
  habits,
  selectedHabitId,
} from "@/entities/habit/model";
import type { Habit, NewHabit, TrackingType } from "@/entities/habit/types";
import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/badge";
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
import { Field, FieldGroup, FieldLabel, FieldTitle } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    emojis: ["💪", "🏃", "🧘", "🚴", "🏋️", "🤸", "💧", "🥗", "💊", "🛌", "🧠", "🦷"],
    label: "Здоровье",
  },
  {
    emojis: ["📚", "✍️", "🎓", "💻", "🔬", "🧮", "📝", "🗣️"],
    label: "Обучение",
  },
  {
    emojis: ["🎨", "🎵", "📸", "🎸", "🎭", "✏️", "🎬", "🪡"],
    label: "Творчество",
  },
  {
    emojis: ["🧹", "🌅", "🪴", "🐕", "👔", "🛒", "🍳", "☕"],
    label: "Быт",
  },
  {
    emojis: ["🎯", "📱", "⏰", "📊", "✅", "🗓️", "💰", "📧"],
    label: "Продуктивность",
  },
];

const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap((c) => c.emojis);

const FREQUENCY_SET: ReadonlySet<string> = new Set(["daily", "weekly"]);
const isFrequency = (v: string): v is "daily" | "weekly" => FREQUENCY_SET.has(v);

const TRACKING_TYPE_SET: ReadonlySet<string> = new Set(["boolean", "numeric", "schedule"]);
const isTrackingType = (v: string): v is TrackingType => TRACKING_TYPE_SET.has(v);

const TRACKING_LABELS: Record<TrackingType, string> = {
  boolean: "Да / Нет",
  numeric: "Счётчик",
  schedule: "Расписание",
};

const EmojiPicker = ({ value, onChange }: { value: string; onChange: (emoji: string) => void }) => {
  return (
    <div className="flex flex-col gap-2.5">
      {EMOJI_CATEGORIES.map((cat) => (
        <div key={cat.label} className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{cat.label}</span>
          <div className="flex flex-wrap gap-1.5">
            {cat.emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => onChange(e)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg text-lg transition-all",
                  value === e
                    ? "scale-110 bg-primary/15 ring-2 ring-primary"
                    : "bg-muted hover:bg-muted/80",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const HabitForm = ({ habit }: { habit?: Habit }) => {
  const [title, setTitle] = useState(habit?.title ?? "");
  const [emoji, setEmoji] = useState(habit?.emoji ?? ALL_EMOJIS[0]);
  const [frequency, setFrequency] = useState<"daily" | "weekly">(habit?.frequency ?? "daily");
  const [trackingType, setTrackingType] = useState<TrackingType>(habit?.trackingType ?? "boolean");
  const [target, setTarget] = useState(habit?.trackingType === "numeric" ? habit.target : 10);
  const [slots, setSlots] = useState<string[]>(
    habit?.trackingType === "schedule" ? habit.slots : ["Утро", "Вечер"],
  );
  const [newSlot, setNewSlot] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    const base = { emoji, frequency, title: trimmed };
    let payload: NewHabit;
    switch (trackingType) {
      case "boolean": {
        payload = { ...base, trackingType };
        break;
      }
      case "numeric": {
        payload = { ...base, target, trackingType };
        break;
      }
      case "schedule": {
        payload = { ...base, slots, trackingType };
        break;
      }
      default: {
        throw new Error(`Invalid tracking type: ${trackingType}`);
      }
    }

    if (habit) {
      editHabit(habit.id, payload);
    } else {
      addHabit(payload);
    }
    closeDrawer();
  };

  const handleDelete = () => {
    if (habit) {
      deleteHabit(habit.id);
      closeDrawer();
    }
  };

  const addSlot = () => {
    const trimmed = newSlot.trim();
    if (trimmed && !slots.includes(trimmed)) {
      setSlots([...slots, trimmed]);
      setNewSlot("");
    }
  };

  const removeSlot = (slot: string) => {
    setSlots(slots.filter((s) => s !== slot));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col px-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="habit-title">Название</FieldLabel>
          <Input
            id="habit-title"
            placeholder="Например: Выпить 8 стаканов воды"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </Field>

        <Field>
          <FieldTitle>Иконка</FieldTitle>
          <EmojiPicker value={emoji} onChange={setEmoji} />
        </Field>

        <Field>
          <FieldTitle id="frequency-label">Частота</FieldTitle>
          <ToggleGroup
            aria-labelledby="frequency-label"
            value={[frequency]}
            onValueChange={(v) => {
              if (v.length > 0 && isFrequency(v[0])) {
                setFrequency(v[0]);
              }
            }}
            className="w-full"
            spacing={2}
          >
            <ToggleGroupItem value="daily" className="flex-1">
              Ежедневно
            </ToggleGroupItem>
            <ToggleGroupItem value="weekly" className="flex-1">
              Еженедельно
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        <Field>
          <FieldTitle id="tracking-label">Тип отслеживания</FieldTitle>
          <ToggleGroup
            aria-labelledby="tracking-label"
            value={[trackingType]}
            onValueChange={(v) => {
              if (v.length > 0 && isTrackingType(v[0])) {
                setTrackingType(v[0]);
              }
            }}
            className="w-full"
            spacing={2}
          >
            {entries(TRACKING_LABELS).map(([key, label]) => (
              <ToggleGroupItem key={key} value={key} className="flex-1">
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        {trackingType === "numeric" && (
          <Field>
            <FieldLabel htmlFor="habit-target">Цель (количество)</FieldLabel>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTarget(Math.max(1, target - 1))}
              >
                <Minus data-icon="inline-start" />
              </Button>
              <Input
                id="habit-target"
                type="number"
                min={1}
                value={target}
                onChange={(e) => setTarget(Math.max(1, Number(e.target.value)))}
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTarget(target + 1)}
              >
                <Plus data-icon="inline-start" />
              </Button>
            </div>
          </Field>
        )}

        {trackingType === "schedule" && (
          <Field>
            <FieldTitle>Расписание</FieldTitle>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {slots.map((slot) => (
                  <Badge key={slot} variant="secondary" className="gap-1 py-1 text-sm">
                    {slot}
                    <Button
                      type="button"
                      variant="ghost"
                      className="size-4 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => removeSlot(slot)}
                    >
                      <X className="size-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Новый слот..."
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSlot();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                  <Plus data-icon="inline-start" />
                </Button>
              </div>
            </div>
          </Field>
        )}
      </FieldGroup>

      <DrawerFooter className="px-0">
        <Button type="submit" disabled={!title.trim()}>
          {habit ? "Сохранить" : "Добавить привычку"}
        </Button>

        {habit && (
          <Button type="button" variant="destructive" onClick={handleDelete}>
            <Trash2 data-icon="inline-start" />
            Удалить привычку
          </Button>
        )}

        <DrawerClose render={<Button variant="ghost" type="button" />}>Отмена</DrawerClose>
      </DrawerFooter>
    </form>
  );
};

export const HabitFormDrawer = reatomComponent(() => {
  const open = drawerOpen();
  const editId = selectedHabitId();
  const allHabits = habits();

  const editingHabit = editId ? allHabits.get(editId) : undefined;

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
          <DrawerTitle>{editingHabit ? "Редактировать привычку" : "Новая привычка"}</DrawerTitle>
          <DrawerDescription>
            {editingHabit ? "Обновите параметры привычки" : "Какую привычку вы хотите развить?"}
          </DrawerDescription>
        </DrawerHeader>

        <HabitForm habit={editingHabit} key={editId ?? "new"} />
      </DrawerContent>
    </Drawer>
  );
}, "HabitFormDrawer");
