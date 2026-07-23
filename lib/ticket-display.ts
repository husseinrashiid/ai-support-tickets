export function formatRelativeAge(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

export const PRIORITY_STYLES: Record<string, { border: string; text: string }> = {
  Urgent: { border: "border-brand-red", text: "text-brand-red" },
  High: { border: "border-orange-500", text: "text-orange-600 dark:text-orange-400" },
  Medium: { border: "border-amber-400", text: "text-amber-600 dark:text-amber-400" },
  Low: { border: "border-zinc-300 dark:border-zinc-700", text: "text-zinc-500 dark:text-zinc-400" },
};

export const DEFAULT_PRIORITY_STYLE = {
  border: "border-zinc-200 dark:border-zinc-800",
  text: "text-zinc-400 dark:text-zinc-500",
};

export const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  Open: { dot: "bg-brand-blue", text: "text-zinc-700 dark:text-zinc-300" },
  "In Progress": { dot: "bg-amber-500", text: "text-zinc-700 dark:text-zinc-300" },
  Resolved: { dot: "bg-green-600", text: "text-zinc-700 dark:text-zinc-300" },
  Closed: { dot: "bg-zinc-400", text: "text-zinc-400 dark:text-zinc-500" },
};

export const DEFAULT_STATUS_STYLE = {
  dot: "bg-zinc-400",
  text: "text-zinc-500 dark:text-zinc-400",
};
