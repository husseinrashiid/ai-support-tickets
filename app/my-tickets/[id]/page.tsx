import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  DEFAULT_PRIORITY_STYLE,
  DEFAULT_STATUS_STYLE,
  NEEDS_REVIEW_BADGE_CLASSES,
  PRIORITY_STYLES,
  STATUS_STYLES,
} from "@/lib/ticket-display";

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
  const ticket = await prisma.ticket.findUnique({ where: { id } });

  if (!ticket || ticket.ownerId !== user.id) {
    notFound();
  }

  const priorityStyle = ticket.priority
    ? PRIORITY_STYLES[ticket.priority] ?? DEFAULT_PRIORITY_STYLE
    : DEFAULT_PRIORITY_STYLE;
  const statusStyle = STATUS_STYLES[ticket.status] ?? DEFAULT_STATUS_STYLE;

  return (
    <div className="page-glow min-h-full flex-1 px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Link
          href="/my-tickets"
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
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

        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {ticket.title}
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Your message
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {ticket.message}
              </p>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Support response
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {ticket.aiSuggestedResponse ?? "No response yet — a support agent will reply soon."}
              </p>
            </section>
          </div>

          <aside className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:h-fit">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Status
              </h2>
              <div className={`mt-2 flex items-center gap-2 text-sm font-semibold ${statusStyle.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                {ticket.status}
              </div>
            </div>

            <dl className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Category
                </dt>
                <dd className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {ticket.category ?? (
                    <span className={NEEDS_REVIEW_BADGE_CLASSES}>Needs review</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Priority
                </dt>
                <dd className={`mt-1 text-sm ${priorityStyle.text}`}>
                  {ticket.priority ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Created
                </dt>
                <dd className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {ticket.createdAt.toLocaleString()}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
