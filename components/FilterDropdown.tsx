"use client";

import { useEffect, useRef, useState } from "react";

export function FilterDropdown({
  ariaLabel,
  placeholder,
  options,
  value,
  onSelect,
  dotClassFor,
  clearable = true,
  variant = "standalone",
  edge = "none",
  align = "left",
  menuWidthClass = "min-w-[180px] max-w-[220px]",
  itemHeightClass = "h-[38px]",
  placeholderDotClass = "bg-zinc-400",
}: {
  ariaLabel: string;
  placeholder: string;
  options: readonly string[];
  value?: string;
  onSelect: (value: string | undefined) => void;
  dotClassFor?: (option: string) => string | undefined;
  clearable?: boolean;
  variant?: "standalone" | "grouped";
  edge?: "left" | "right" | "none";
  align?: "left" | "right";
  menuWidthClass?: string;
  itemHeightClass?: string;
  placeholderDotClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(next: string | undefined) {
    setOpen(false);
    onSelect(next);
  }

  const isActive = Boolean(value);
  const selectedDot = isActive ? dotClassFor?.(value!) : undefined;

  const edgeRounding =
    edge === "left" ? "rounded-l-lg" : edge === "right" ? "rounded-r-lg" : "";

  const triggerClasses =
    variant === "grouped"
      ? `flex items-center gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${edgeRounding} ${
          isActive
            ? "font-medium text-zinc-900 dark:text-zinc-50"
            : "text-zinc-500 dark:text-zinc-400"
        }`
      : `flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
          isActive
            ? "border-zinc-300 bg-white font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            : "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
        }`;

  function rowClasses(selected: boolean, isPlaceholder: boolean) {
    const base = `flex w-full items-center justify-between gap-2.5 rounded-[9px] px-3 text-left text-[15px] transition-colors ${itemHeightClass}`;
    if (selected) {
      return `${base} bg-zinc-100 font-semibold text-zinc-900 dark:bg-[#24262b] dark:text-[#f4f4f5]`;
    }
    if (isPlaceholder) {
      return `${base} text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-[#a4a7af] dark:hover:bg-[#202227] dark:hover:text-[#f4f4f5]`;
    }
    return `${base} text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-[#c3c5cb] dark:hover:bg-[#202227] dark:hover:text-[#f4f4f5]`;
  }

  return (
    <div ref={containerRef} className="relative inline-block w-fit shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={triggerClasses}
      >
        {selectedDot && <span className={`h-1.5 w-1.5 rounded-full ${selectedDot}`} />}
        {value ?? placeholder}
        <ChevronDownIcon />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute top-[calc(100%+8px)] z-20 w-max overflow-hidden rounded-xl border border-zinc-200 bg-white p-2.5 shadow-[0_14px_35px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.25)] dark:border-[#2c2e34] dark:bg-[#191a1e] ${
            align === "right" ? "right-0" : "left-0"
          } ${menuWidthClass}`}
        >
          {clearable && (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSelect(undefined)}
              className={rowClasses(!isActive, true)}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                {dotClassFor && (
                  <span className={`h-2 w-2 shrink-0 rounded-full ${placeholderDotClass}`} />
                )}
                <span className="truncate">{placeholder}</span>
              </span>
              <span className="flex w-[18px] shrink-0 justify-center text-brand-blue">
                {!isActive && <CheckIcon />}
              </span>
            </button>
          )}
          {options.map((option) => {
            const dot = dotClassFor?.(option);
            const isSelected = option === value;
            return (
              <button
                key={option}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(option)}
                className={rowClasses(isSelected, false)}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {dot && <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />}
                  <span className="truncate">{option}</span>
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-zinc-400"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
