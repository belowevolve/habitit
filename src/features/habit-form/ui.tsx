import { reatomComponent } from "@reatom/react";
import { X } from "lucide-react";
import { useRef } from "react";

import { createHabitFromDraft, habitDraft, isDrawerOpen } from "@/entities/habit/model";
import { HABIT_TYPES } from "@/entities/habit/types";
import type { HabitType } from "@/entities/habit/types";
import { Button } from "@/shared/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";
import { Field, FieldGroup, FieldTitle } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
] as const;

const DAYS_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

const HabitFormContent = reatomComponent(() => {
  const name = habitDraft.name();
  const type = habitDraft.type();
  const color = habitDraft.color();
  const target = habitDraft.target();
  const schedule = habitDraft.schedule();
  const slots = habitDraft.slots();
  const slotInputRef = useRef<HTMLInputElement>(null);

  const toggleDay = (day: number) => {
    habitDraft.schedule.set(
      schedule.includes(day)
        ? schedule.filter((d) => d !== day)
        : [...schedule, day].toSorted((a, b) => a - b),
    );
  };

  const addSlot = () => {
    const value = slotInputRef.current?.value;
    if (value && !slots.includes(value)) {
      habitDraft.slots.set([...slots, value].toSorted());
    }
    if (slotInputRef.current) {
      slotInputRef.current.value = "";
    }
  };

  const removeSlot = (time: string) => {
    habitDraft.slots.set(slots.filter((s) => s !== time));
  };

  return (
    <>
      <div className="flex flex-col gap-5 px-4 py-2">
        <FieldGroup>
          <Field>
            <FieldTitle>Название</FieldTitle>
            <Input
              value={name}
              onChange={(e) => habitDraft.name.set(e.target.value)}
              placeholder="Например: Пить воду"
              autoFocus
            />
          </Field>

          <Field>
            <FieldTitle>Тип</FieldTitle>
            <ToggleGroup
              value={[type]}
              onValueChange={(val) => {
                if (val.length > 0) {
                  habitDraft.type.set(val[0] as HabitType);
                }
              }}
              variant="outline"
              className="w-full"
            >
              <ToggleGroupItem value={HABIT_TYPES.boolean} className="flex-1">
                Да/Нет
              </ToggleGroupItem>
              <ToggleGroupItem value={HABIT_TYPES.counter} className="flex-1">
                Счётчик
              </ToggleGroupItem>
              <ToggleGroupItem value={HABIT_TYPES.schedule} className="flex-1">
                Расписание
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>

          {type === HABIT_TYPES.counter && (
            <Field>
              <FieldTitle>Цель (повторений)</FieldTitle>
              <Input
                type="number"
                min={1}
                value={target}
                onChange={(e) => habitDraft.target.set(Number(e.target.value))}
              />
            </Field>
          )}

          {type === HABIT_TYPES.schedule && (
            <Field>
              <FieldTitle>Временные слоты</FieldTitle>
              <div className="flex flex-col gap-2">
                {slots.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {slots.map((slot) => (
                      <span
                        key={slot}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {slot}
                        <button
                          type="button"
                          onClick={() => removeSlot(slot)}
                          className="ml-0.5 text-primary/60 hover:text-primary"
                          aria-label={`Удалить слот ${slot}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={slotInputRef}
                    type="time"
                    className="flex h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                  <Button variant="outline" size="sm" onClick={addSlot}>
                    Добавить
                  </Button>
                </div>
              </div>
            </Field>
          )}

          <Field>
            <FieldTitle>Дни недели</FieldTitle>
            <div className="flex gap-1">
              {DAYS_LABELS.map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={
                    schedule.includes(idx)
                      ? "flex-1 rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground transition-colors"
                      : "flex-1 rounded-md border py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <Field>
            <FieldTitle>Цвет</FieldTitle>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => habitDraft.color.set(c)}
                  className={
                    color === c
                      ? "size-7 rounded-full ring-2 ring-offset-2 ring-primary transition-transform scale-110"
                      : "size-7 rounded-full transition-transform hover:scale-110"
                  }
                  style={{ backgroundColor: c }}
                  aria-label={`Цвет ${c}`}
                />
              ))}
            </div>
          </Field>
        </FieldGroup>
      </div>

      <DrawerFooter>
        <Button onClick={() => createHabitFromDraft()} disabled={!name.trim()}>
          Создать
        </Button>
        <DrawerClose render={<Button variant="outline" />}>Отмена</DrawerClose>
      </DrawerFooter>
    </>
  );
}, "HabitFormContent");

export const HabitForm = reatomComponent(() => {
  const open = isDrawerOpen();

  return (
    <Drawer open={open} onOpenChange={(v) => isDrawerOpen.set(v)}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Новая привычка</DrawerTitle>
        </DrawerHeader>
        <HabitFormContent />
      </DrawerContent>
    </Drawer>
  );
}, "HabitForm");
