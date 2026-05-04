import type { Habit } from "../types";
import { HABIT_TYPES } from "../types";
import { BooleanCard } from "./boolean-card";
import { CounterCard } from "./counter-card";
import { ScheduleCard } from "./schedule-card";

interface HabitCardProps {
  habit: Habit;
}

export const HabitCard = ({ habit }: HabitCardProps) => {
  switch (habit.type) {
    case HABIT_TYPES.boolean: {
      return <BooleanCard habit={habit} />;
    }
    case HABIT_TYPES.counter: {
      return <CounterCard habit={habit} />;
    }
    case HABIT_TYPES.schedule: {
      return <ScheduleCard habit={habit} />;
    }
    default: {
      const _exhaustive: never = habit;
      return _exhaustive;
    }
  }
};
