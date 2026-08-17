import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  DEFAULT_PRIORITY_STYLE,
  DEFAULT_STATUS_STYLE,
  NEEDS_REVIEW_BADGE_CLASSES,
  PRIORITY_DOT_CLASSES,
  PRIORITY_STYLES,
  STATUS_STYLES,
  formatDateTime,
  formatTicketReference,
} from "@/lib/ticket-display";
import { MessageThread, type LeadingEntry } from "@/components/MessageThread";

export const dynamic = "force-dynamic";

export default async function CustomerTicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "customer") redirect("/");

  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { attachments: { omit: { data: true } } },
  });

  if (!ticket || ticket.ownerId !== user.id) {
    notFound();
  }

  const messages = await prisma.message.findMany({
    where: { ticketId: id },
    orderBy: { createdAt: "asc" },
    include: { attachments: { omit: { data: true } } },
  });

  const priorityStyle = ticket.priority
    ? PRIORITY_STYLES[ticket.priority] ?? DEFAULT_PRIORITY_STYLE
    : DEFAULT_PRIORITY_STYLE;
  const statusStyle = STATUS_STYLES[ticket.status] ?? DEFAULT_STATUS_STYLE;

  const leadingEntries: LeadingEntry[] = [
    {
      key: "original-message",
      author: "You",
      variant: "customer",
      timestamp: ticket.createdAt,
      content: ticket.message,
      attachment: ticket.attachments[0],
    },
  ];

  const hasSentResponse = messages.some((message) => message.senderRole === "agent");

  return (
    <div className="page-glow min-h-full flex-1 px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
        <Link
          href="/my-tickets"
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to my tickets
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {ticket.title}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">
              Ticket #{formatTicketReference(ticket.id)}
            </span>
            <span className={`flex items-center gap-1.5 font-medium ${statusStyle.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
              {ticket.status}
            </span>
            {ticket.priority && (
              <span className={`flex items-center gap-1.5 font-medium ${priorityStyle.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT_CLASSES[ticket.priority] ?? "bg-zinc-400"}`} />
                {ticket.priority}
              </span>
            )}
            {!hasSentResponse && ticket.status !== "Closed" && (
              <span className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Awaiting response
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_335px]">
          <div className={ticket.status === "Closed" ? "lg:self-start" : undefined}>
            <MessageThread
              ticketId={ticket.id}
              status={ticket.status}
              viewerId={user.id}
              initialMessages={messages}
              leadingEntries={leadingEntries}
              awaitingResponse={!hasSentResponse}
            />
          </div>

          <aside className="rounded-[14px] border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900 lg:h-fit">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
              Ticket details
            </h2>
            <dl className="grid gap-3">
              <div className="grid gap-[5px]">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                  Status
                </dt>
                <dd className={`flex items-center gap-2 text-sm font-semibold ${statusStyle.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  {ticket.status}
                </dd>
              </div>
              <div className="grid gap-[5px]">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                  Category
                </dt>
                <dd className="text-sm text-zinc-700 dark:text-zinc-300">
                  {ticket.category ?? (
                    <span className={NEEDS_REVIEW_BADGE_CLASSES}>Needs review</span>
                  )}
                </dd>
              </div>
              <div className="grid gap-[5px]">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                  Priority
                </dt>
                <dd className={`text-sm ${priorityStyle.text}`}>
                  {ticket.priority ?? "—"}
                </dd>
              </div>
              <div className="grid gap-[5px]">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                  Created
                </dt>
                <dd className="text-sm text-zinc-700 dark:text-zinc-300">
                  {formatDateTime(ticket.createdAt)}
                </dd>
              </div>
              <div className="grid gap-[5px]">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                  Last updated
                </dt>
                <dd className="text-sm text-zinc-700 dark:text-zinc-300">
                  {formatDateTime(ticket.updatedAt)}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
