import Link from "next/link";
import type { Ticket } from "@prisma/client";
import {
  DEFAULT_PRIORITY_STYLE,
  DEFAULT_STATUS_STYLE,
  NEEDS_REVIEW_BADGE_CLASSES,
  PRIORITY_STYLES,
  STATUS_STYLES,
  formatRelativeAge,
} from "@/lib/ticket-display";

export function TicketRow({ ticket, href }: { ticket: Ticket; href?: string }) {
  const priorityStyle = ticket.priority
    ? PRIORITY_STYLES[ticket.priority] ?? DEFAULT_PRIORITY_STYLE
    : DEFAULT_PRIORITY_STYLE;
  const statusStyle = STATUS_STYLES[ticket.status] ?? DEFAULT_STATUS_STYLE;
  const isClosed = ticket.status === "Closed";

  return (
    <li>
      <Link
        href={href ?? `/tickets/${ticket.id}`}
        className={`group relative flex min-h-[72px] items-center gap-4 px-5 py-[15px] transition-colors hover:bg-brand-blue/[0.055] ${
          isClosed ? "opacity-[0.62]" : ""
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-y-2.5 left-0 w-1 rounded-r-full ${priorityStyle.bar}`}
        />
        <div className="min-w-0 flex-1 transition-transform duration-150 ease-out group-hover:translate-x-0.5">
          <p className="truncate text-[0.95rem] leading-snug font-semibold text-zinc-900 dark:text-zinc-50">
            {ticket.title}
          </p>
          {ticket.category ? (
            <p className="mt-[3px] truncate text-[0.78rem] text-zinc-500 dark:text-zinc-400">
              {ticket.category}
              {" · "}
              <span>{ticket.priority ?? "Unclassified"}</span>
            </p>
          ) : (
            <p className="mt-[5px]">
              <span className={NEEDS_REVIEW_BADGE_CLASSES}>Needs review</span>
            </p>
          )}
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
