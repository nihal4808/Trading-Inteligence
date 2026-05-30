export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function cn(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getStreakDays(entries: Array<{ date: string | Date }>): number {
  if (entries.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  const currentDate = new Date(today);
  currentDate.setHours(0, 0, 0, 0);

  while (true) {
    const hasEntry = entries.some((e) => {
      const entryDate = new Date(e.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === currentDate.getTime();
    });

    if (!hasEntry && streak > 0) break;
    if (hasEntry) streak++;

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

export function getDayName(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(date)
  );
}

export function getWeekDates(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;

  const start = new Date(d.setDate(diff));
  const end = new Date(d.setDate(diff + 6));

  return { start, end };
}
