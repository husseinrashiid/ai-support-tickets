export function formatRelativeAge(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

export const PRIORITY_STYLES: Record<string, { bar: string; text: string }> = {
  Urgent: { bar: "bg-brand-red", text: "text-brand-red" },
  High: { bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  Medium: { bar: "bg-zinc-400 dark:bg-zinc-500", text: "text-zinc-500 dark:text-zinc-400" },
  Low: { bar: "bg-zinc-300 dark:bg-zinc-600", text: "text-zinc-500 dark:text-zinc-400" },
};

export const DEFAULT_PRIORITY_STYLE = {
  bar: "bg-zinc-200 dark:bg-zinc-800",
  text: "text-zinc-400 dark:text-zinc-500",
};

export const PRIORITY_DOT_CLASSES: Record<string, string> = {
  Low: "bg-blue-400",
  Medium: "bg-amber-400",
  High: "bg-orange-500",
  Urgent: "bg-red-500",
};

export const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  Open: { dot: "bg-brand-blue", text: "text-zinc-700 dark:text-zinc-300" },
  "In Progress": { dot: "bg-zinc-500", text: "text-zinc-700 dark:text-zinc-300" },
  Resolved: { dot: "bg-green-600", text: "text-zinc-700 dark:text-zinc-300" },
  Closed: { dot: "bg-zinc-400", text: "text-zinc-400 dark:text-zinc-500" },
};

export const DEFAULT_STATUS_STYLE = {
  dot: "bg-zinc-400",
  text: "text-zinc-500 dark:text-zinc-400",
};

export const NEEDS_REVIEW_BADGE_CLASSES =
  "inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-400";
