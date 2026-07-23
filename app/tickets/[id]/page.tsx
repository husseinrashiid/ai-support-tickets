import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PRIORITY_STYLE, PRIORITY_STYLES } from "@/lib/ticket-display";
import { TicketStatusControl } from "@/components/TicketStatusControl";
import { SuggestedResponseEditor } from "@/components/SuggestedResponseEditor";

export const dynamic = "force-dynamic";

export default async function TicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({ where: { id } });

  if (!ticket) {
    notFound();
  }

  const priorityStyle = ticket.priority
    ? PRIORITY_STYLES[ticket.priority] ?? DEFAULT_PRIORITY_STYLE
    : DEFAULT_PRIORITY_STYLE;

  return (
    <div className="min-h-full flex-1 bg-zinc-100 px-4 py-10 dark:bg-black sm:px-8 sm:py-14">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {ticket.title}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {ticket.category ?? "Uncategorized"}
              {" · "}
              <span className={priorityStyle.text}>
                {ticket.priority ?? "Unclassified"}
              </span>
            </p>
          </div>
          <TicketStatusControl ticketId={ticket.id} initialStatus={ticket.status} />
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Customer message
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {ticket.message}
          </p>
        </section>

        {ticket.aiSummary && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              AI summary
            </h2>
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
              {ticket.aiSummary}
            </p>
          </section>
        )}

        <SuggestedResponseEditor
          ticketId={ticket.id}
          initialValue={ticket.aiSuggestedResponse ?? ""}
        />
      </div>
    </div>
  );
}
