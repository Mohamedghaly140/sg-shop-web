import { endOfDay, parseISO, startOfDay, subDays } from "date-fns";

export function resolveDateRange(from: string | null, to: string | null) {
  const end = to ? parseISO(to) : new Date();
  const start = from ? parseISO(from) : subDays(end, 30);
  return { start: startOfDay(start), end: endOfDay(end) };
}
