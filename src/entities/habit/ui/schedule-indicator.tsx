const SHORT_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;
const FULL_WEEK = 7;

interface ScheduleIndicatorProps {
  schedule: number[];
}

export const ScheduleIndicator = ({ schedule }: ScheduleIndicatorProps) => {
  if (schedule.length >= FULL_WEEK) {
    return null;
  }

  return (
    <div className="flex gap-0.5">
      {SHORT_DAYS.map((label, idx) => (
        <span
          key={label}
          className={
            schedule.includes(idx)
              ? "text-[10px] font-medium text-primary"
              : "text-[10px] text-muted-foreground/40"
          }
        >
          {label}
        </span>
      ))}
    </div>
  );
};
