import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { TicketRow } from "@/components/TicketRow";

export const dynamic = "force-dynamic";

export default async function MyTicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "customer") redirect("/");

  const tickets = await prisma.ticket.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="dashboard-glow flex min-h-full flex-1 flex-col">
      <div className="mx-auto flex w-[min(1120px,calc(100%-48px))] flex-1 flex-col pt-[42px] pb-14 sm:pb-16">
        <header className="mb-7 flex items-start justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-[#f5f5f6]">
              My Tickets
              <span className="ml-1 text-brand-blue">.</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              View and manage your support requests.
            </p>
          </div>
          {tickets.length > 0 && (
            <Link
              href="/tickets/new"
              className="shrink-0 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark"
            >
              + New ticket
            </Link>
          )}
        </header>

        {tickets.length === 0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
            <div className="mb-[18px] flex h-12 w-12 items-center justify-center rounded-[14px] border border-brand-blue/20 bg-brand-blue/10 text-brand-blue dark:border-brand-blue/25 dark:bg-brand-blue/15 dark:text-sky-400">
              <TicketIcon />
            </div>
            <h2 className="mb-2.5 text-xl font-bold text-zinc-900 dark:text-zinc-50">No tickets yet</h2>
            <p className="max-w-[440px] text-sm leading-[1.55] text-zinc-500 dark:text-zinc-400">
              Submit your first support request and track replies from the support team.
            </p>
            <Link href="/tickets/new" className="mt-6 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark">
              + Create ticket
            </Link>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
            <div className="hidden grid-cols-[1fr_auto_2.5rem] gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 sm:grid">
              <span>Ticket</span>
              <span>Status</span>
              <span className="text-right">Age</span>
            </div>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {tickets.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} href={`/my-tickets/${ticket.id}`} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2.5 2.5 0 0 0 0 5v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2.5 2.5 0 0 0 0-5V7Z" />
      <path d="M13 8h4M13 12h4M13 16h2" />
    </svg>
  );
}
