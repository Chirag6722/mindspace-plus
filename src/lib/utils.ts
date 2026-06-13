/** Combine class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** Generate a short unique id without external deps. */
export function uid(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 9);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}${time}${rand}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  const due = new Date(iso);
  const now = new Date();
  due.setHours(23, 59, 59, 999);
  return due.getTime() < now.getTime();
}
