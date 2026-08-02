import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TicketRow } from "@/components/TicketRow";
import { TicketListControls } from "@/components/TicketListControls";
import { TicketFilterBar } from "@/components/TicketFilterBar";
import {
  DEFAULT_TICKET_PAGE_SIZE,
  TICKET_CATEGORIES,
  TICKET_PAGE_SIZES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketPageSize,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const requestedPageSize = Number(params.pageSize);
  const pageSize: TicketPageSize = TICKET_PAGE_SIZES.includes(
    requestedPageSize as TicketPageSize
  )
    ? (requestedPageSize as TicketPageSize)
    : DEFAULT_TICKET_PAGE_SIZE;

  const requestedPage = Number(params.page);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const status = TICKET_STATUSES.includes(params.status as (typeof TICKET_STATUSES)[number])
    ? (params.status as string)
    : undefined;
  const category = TICKET_CATEGORIES.includes(
    params.category as (typeof TICKET_CATEGORIES)[number]
  )
    ? (params.category as string)
    : undefined;
  const priority = TICKET_PRIORITIES.includes(
    params.priority as (typeof TICKET_PRIORITIES)[number]
  )
    ? (params.priority as string)
    : undefined;
  const sort: "asc" | "desc" = params.sort === "asc" ? "asc" : "desc";

  const where: Prisma.TicketWhereInput = {
    ...(status && { status }),
    ...(category && { category }),
    ...(priority && { priority }),
  };
  const hasActiveFilters = Boolean(status || category || priority);

  const [total, open, resolved, urgent, matchingTotal, tickets] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "Open" } }),
    prisma.ticket.count({ where: { status: { in: ["Resolved", "Closed"] } } }),
    prisma.ticket.count({ where: { priority: "Urgent" } }),
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      orderBy: { createdAt: sort },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(matchingTotal / pageSize));

  return (
    <div className="dashboard-glow flex min-h-full flex-1 flex-col">
      <div className="mx-auto flex w-[min(1120px,calc(100%-48px))] flex-1 flex-col pt-9 pb-14 sm:pt-11 sm:pb-16">
        <header className="mb-7 flex items-start justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Tickets
              <span className="ml-1 text-brand-blue">.</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {urgent > 0
                ? `${urgent} need${urgent === 1 ? "s" : ""} attention today`
                : "No urgent tickets"}
            </p>
          </div>
          <Link
            href="/tickets/new"
            className="shrink-0 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark"
          >
            + New ticket
          </Link>
        </header>

        <section className="mb-[30px] grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Urgent" value={urgent} accent="text-brand-red" />
          <StatCard label="Open" value={open} />
          <StatCard label="Resolved" value={resolved} />
          <StatCard label="Total" value={total} />
        </section>

        <div className="mb-4">
          <TicketFilterBar status={status} category={category} priority={priority} sort={sort} />
        </div>

        <section className="mb-[22px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
          <div className="hidden grid-cols-[1fr_auto_2.5rem] gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 sm:grid">
            <span>Ticket</span>
            <span>Status</span>
            <span className="text-right">Age</span>
          </div>
          <ul className="min-h-[360px] divide-y divide-zinc-200 dark:divide-zinc-800">
            {tickets.length === 0 ? (
              <li className="px-5 py-14 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {hasActiveFilters
                  ? "No tickets match these filters."
                  : "No tickets yet. Create the first one to get started."}
              </li>
            ) : (
              tickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)
            )}
          </ul>
        </section>

        {matchingTotal > 0 && (
          <div className="mt-4">
            <TicketListControls
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${accent ?? "text-zinc-900 dark:text-zinc-50"}`}>
        {value}
      </p>
    </div>
  );
}
