"use client";

import { useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { CheckIcon, ChevronDownIcon } from "@/components/icons/MenuIcons";

const OPTIONS: {
  label: string;
  value: "desc" | "asc";
  Icon: (props: { className?: string }) => React.ReactElement;
}[] = [
  { label: "Newest first", value: "desc", Icon: ArrowDownIcon },
  { label: "Oldest first", value: "asc", Icon: ArrowUpIcon },
];

export function SortDropdown({
  sort,
  onChange,
}: {
  sort: "asc" | "desc";
  onChange: (sort: "asc" | "desc") => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(open, setOpen);

  const current = OPTIONS.find((option) => option.value === sort) ?? OPTIONS[0];

  return (
    <div ref={containerRef} className="relative inline-block w-fit shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Sort by date"
        className="flex h-10 items-center gap-2 whitespace-nowrap rounded-[11px] border border-zinc-300 bg-white px-3.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
      >
        <span className="text-zinc-500 dark:text-zinc-400">Sort:</span>
        {current.label}
        <ChevronDownIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[180px] overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.14),0_3px_8px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-900"
        >
          {OPTIONS.map((option) => {
            const isSelected = option.value === sort;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onChange(option.value);
                }}
                className={`flex h-[42px] w-full items-center justify-between gap-2.5 whitespace-nowrap rounded-lg px-3 text-left text-[15px] transition-colors ${
                  isSelected
                    ? "bg-[#edf6fc] font-semibold text-zinc-900 dark:bg-brand-blue/15 dark:text-zinc-50"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <option.Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      isSelected ? "text-slate-300" : "text-gray-400"
                    }`}
                  />
                  {option.label}
                </span>
                <span className="flex w-[18px] shrink-0 justify-center text-brand-blue">
                  {isSelected && <CheckIcon />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 4v16M6 14l6 6 6-6" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20V4M6 10l6-6 6 6" />
    </svg>
  );
}
