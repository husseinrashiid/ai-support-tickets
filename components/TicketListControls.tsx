"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TICKET_PAGE_SIZES, type TicketPageSize } from "@/lib/constants";

export function TicketListControls({
  page,
  pageSize,
  totalPages,
}: {
  page: number;
  pageSize: TicketPageSize;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(nextPage: number, nextPageSize: number = pageSize) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    params.set("pageSize", String(nextPageSize));
    return `${pathname}?${params.toString()}`;
  }

  function handlePageSizeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    router.push(buildHref(1, Number(event.target.value)));
  }

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <label
          htmlFor="rows-per-page"
          className="text-sm text-zinc-500 dark:text-zinc-400"
        >
          Rows per page
        </label>
        <select
          id="rows-per-page"
          value={pageSize}
          onChange={handlePageSizeChange}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {TICKET_PAGE_SIZES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-1.5">
          <PaginationButton
            href={buildHref(page - 1)}
            disabled={!canGoPrev}
            label="Previous page"
          >
            <ChevronLeftIcon />
          </PaginationButton>
          <PaginationButton
            href={buildHref(page + 1)}
            disabled={!canGoNext}
            label="Next page"
          >
            <ChevronRightIcon />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
}

function PaginationButton({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const className =
    "rounded-full border p-2 transition-colors border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800";

  if (disabled) {
    return (
      <span
        aria-hidden
        className="rounded-full border border-zinc-200 p-2 text-zinc-300 dark:border-zinc-800 dark:text-zinc-700"
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label} className={className}>
      {children}
    </Link>
  );
}

function ChevronLeftIcon() {
  return (
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
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
