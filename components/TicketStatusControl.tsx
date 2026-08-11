"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TICKET_STATUSES } from "@/lib/constants";
import { DEFAULT_STATUS_STYLE, STATUS_STYLES } from "@/lib/ticket-display";

const OPEN_STATUSES = TICKET_STATUSES.filter((status) => status !== "Closed");

export function TicketStatusControl({
  ticketId,
  initialStatus,
}: {
  ticketId: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const statusStyle = STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE;
  const isClosed = status === "Closed";

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

  async function updateStatus(nextStatus: string) {
    setOpen(false);
    if (nextStatus === status) return;

    const previousStatus = status;
    setStatus(nextStatus);
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setStatus(previousStatus);
        setError(data.error ?? "Failed to update status.");
        setSaving(false);
        return;
      }

      setSaving(false);
      router.refresh();
    } catch {
      setStatus(previousStatus);
      setError("Could not reach the server. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block w-fit shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={saving}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`group flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 ${
          isClosed
            ? "border-zinc-200 dark:border-zinc-800"
            : "border-zinc-300 dark:border-zinc-700"
        } ${statusStyle.text}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
        {status}
        <ChevronDownIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-full top-0 z-20 ml-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          {OPEN_STATUSES.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitem"
              onClick={() => updateStatus(option)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  STATUS_STYLES[option]?.dot ?? DEFAULT_STATUS_STYLE.dot
                }`}
              />
              {option}
            </button>
          ))}
          <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
          <button
            type="button"
            role="menuitem"
            onClick={() => updateStatus("Closed")}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-red hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <XCircleIcon />
            Closed
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="absolute right-0 top-full mt-1 whitespace-nowrap text-xs text-brand-red"
        >
          {error}
        </p>
      )}
    </div>
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
      className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function XCircleIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </svg>
  );
}
