import Link from "next/link";
import type { Ticket } from "@prisma/client";
import {
  DEFAULT_PRIORITY_STYLE,
  DEFAULT_STATUS_STYLE,
  PRIORITY_STYLES,
  STATUS_STYLES,
  formatRelativeAge,
} from "@/lib/ticket-display";

export function TicketRow({ ticket }: { ticket: Ticket }) {
  const priorityStyle = ticket.priority
    ? PRIORITY_STYLES[ticket.priority] ?? DEFAULT_PRIORITY_STYLE
    : DEFAULT_PRIORITY_STYLE;
  const statusStyle = STATUS_STYLES[ticket.status] ?? DEFAULT_STATUS_STYLE;
  const isClosed = ticket.status === "Closed";

  return (
    <li>
      <Link
        href={`/tickets/${ticket.id}`}
        className={`flex items-center gap-4 border-l-4 px-5 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${priorityStyle.border} ${
          isClosed ? "opacity-60" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {ticket.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {ticket.category ?? "Uncategorized"}
            {" · "}
            <span className={priorityStyle.text}>
              {ticket.priority ?? "Unclassified"}
            </span>
          </p>
        </div>
        <div className={`flex shrink-0 items-center gap-1.5 text-sm ${statusStyle.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {ticket.status}
        </div>
        <span
          className="w-10 shrink-0 text-right text-xs text-zinc-400 dark:text-zinc-500"
          title={ticket.createdAt.toLocaleString()}
        >
          {formatRelativeAge(ticket.createdAt)}
        </span>
      </Link>
    </li>
  );
}
