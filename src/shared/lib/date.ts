const msPerDay = 86_400_000;

export const toDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const today = (): string => toDateString(new Date());

export const formatDisplayDate = (date: Date = new Date()): string =>
  date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });

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
