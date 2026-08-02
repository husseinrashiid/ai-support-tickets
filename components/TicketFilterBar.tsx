"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@/lib/constants";
import {
  DEFAULT_STATUS_STYLE,
  PRIORITY_DOT_CLASSES,
  STATUS_STYLES,
} from "@/lib/ticket-display";
import { FilterDropdown } from "@/components/FilterDropdown";
import { SortDropdown } from "@/components/SortDropdown";

export function TicketFilterBar({
  status,
  category,
  priority,
  sort,
}: {
  status?: string;
  category?: string;
  priority?: string;
  sort: "asc" | "desc";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams);
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function updateSort(nextSort: "asc" | "desc") {
    const params = new URLSearchParams(searchParams);
    if (nextSort === "asc") {
      params.set("sort", "asc");
    } else {
      params.delete("sort");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasActiveFilters = Boolean(status || category || priority);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-stretch divide-x divide-zinc-200 rounded-lg border border-zinc-300 bg-white dark:divide-zinc-800 dark:border-zinc-700 dark:bg-zinc-900">
          <FilterDropdown
            ariaLabel="Filter by status"
            placeholder="Any status"
            options={TICKET_STATUSES}
            value={status}
            onSelect={(value) => updateParam("status", value)}
            dotClassFor={(option) => (STATUS_STYLES[option] ?? DEFAULT_STATUS_STYLE).dot}
            variant="grouped"
            edge="left"
            menuWidthClass="min-w-[220px]"
          />

          <FilterDropdown
            ariaLabel="Filter by category"
            placeholder="Any category"
            options={TICKET_CATEGORIES}
            value={category}
            onSelect={(value) => updateParam("category", value)}
            variant="grouped"
            menuWidthClass="min-w-[260px] max-w-[285px]"
            itemHeightClass="h-9"
          />

          <FilterDropdown
            ariaLabel="Filter by priority"
            placeholder="Any priority"
            options={TICKET_PRIORITIES}
            value={priority}
            onSelect={(value) => updateParam("priority", value)}
            dotClassFor={(option) => PRIORITY_DOT_CLASSES[option]}
            placeholderDotClass="bg-gray-400"
            variant="grouped"
            edge="right"
            menuWidthClass="min-w-[180px] max-w-[200px]"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="text-sm font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" aria-hidden="true" />
        <SortDropdown sort={sort} onChange={updateSort} />
      </div>
    </div>
  );
}
