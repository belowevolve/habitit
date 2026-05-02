const msPerDay = 86_400_000;

export const toDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const today = (): string => toDateString(new Date());

export const formatDisplayDate = (date: Date = new Date()): string =>
  date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });

export const formatTime = (ts?: number): string | null => {
  if (!ts) {
    return null;
  }
  return new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

export const formatHistoryDate = (dateStr: string): string => {
  const todayStr = today();
  if (dateStr === todayStr) {
    return "Сегодня";
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === toDateString(yesterday)) {
    return "Вчера";
  }

  const date = new Date(`${dateStr}T00:00:00`);
  return formatDisplayDate(date);
};

export const daysBetween = (a: string, b: string): number => {
  const dateA = new Date(a).getTime();
  const dateB = new Date(b).getTime();
  return Math.round(Math.abs(dateA - dateB) / msPerDay);
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return toDateString(date);
};
