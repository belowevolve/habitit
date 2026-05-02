type PluralForms = [one: string, two: string, five: string];

const pluralize = (n: number, forms: PluralForms): string => {
  const abs = Math.abs(n) % 100;
  const lastDigit = abs % 10;

  if (abs > 10 && abs < 20) {
    return forms[2];
  }
  if (lastDigit === 1) {
    return forms[0];
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return forms[1];
  }
  return forms[2];
};

export const createPluralizer =
  (forms: PluralForms) =>
  (n: number): string =>
    `${n} ${pluralize(n, forms)}`;

export const DAY_FORMS = ["день", "дня", "дней"] satisfies PluralForms;
export const pluralizeDays = createPluralizer(DAY_FORMS);

export const HABIT_FORMS = ["привычка", "привычки", "привычек"] satisfies PluralForms;
export const pluralizeHabits = createPluralizer(HABIT_FORMS);
