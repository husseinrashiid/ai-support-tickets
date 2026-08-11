"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function SuggestedResponseEditor({
  ticketId,
  initialValue,
  onUseReply,
}: {
  ticketId: string;
  initialValue: string;
  onUseReply: (text: string) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [savedValue, setSavedValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
    setSavedValue(initialValue);
  }, [initialValue]);

  const dirty = value !== savedValue;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/response`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiSuggestedResponse: value }),
      });
      const data = (await res.json()) as {
        ticket?: { aiSuggestedResponse: string | null };
        error?: string;
      };

      if (!res.ok || !data.ticket) {
        setError(data.error ?? "Failed to save the draft.");
        setSaving(false);
        return;
      }

      setSavedValue(value);
      setSaving(false);
      setStatusMessage("Draft saved.");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSaving(false);
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/response/regenerate`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        ticket?: { aiSuggestedResponse: string | null };
        error?: string;
      };

      if (!res.ok || !data.ticket) {
        setError(data.error ?? "Failed to regenerate a suggestion.");
        setRegenerating(false);
        return;
      }

      setValue(data.ticket.aiSuggestedResponse ?? "");
      setSavedValue(data.ticket.aiSuggestedResponse ?? "");
      setExpanded(true);
      setRegenerating(false);
      setStatusMessage("New suggestion generated.");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setRegenerating(false);
    }
  }

  function handleUseReply() {
    if (!value.trim()) return;
    onUseReply(value);
    setExpanded(false);
  }

  return (
    <section className="rounded-[14px] border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black/20">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="flex items-center gap-2">
          <ChevronIcon expanded={expanded} />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            AI suggested response <span className="text-zinc-400 dark:text-zinc-500">· Internal</span>
          </span>
        </span>
      </button>

      {expanded && (
        <div className="mt-3">
          <textarea
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setStatusMessage(null);
            }}
            rows={4}
            disabled={regenerating || saving}
            placeholder="No AI suggested response yet — write one manually."
            className="min-h-[84px] w-full resize-y rounded-xl border border-zinc-400 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:placeholder:text-zinc-500"
          />
          {error && (
            <p role="alert" className="mt-2 text-xs text-brand-red">
              {error}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between gap-3">
            {statusMessage && !error ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{statusMessage}</p>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating || saving}
                className="shrink-0 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                {regenerating ? "Regenerating…" : "Regenerate"}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={regenerating || saving || !dirty}
                className="shrink-0 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                {saving ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                onClick={handleUseReply}
                disabled={regenerating || saving || !value.trim()}
                className="shrink-0 rounded-full bg-brand-blue px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-[#27313a] dark:disabled:text-[#7f8a96]"
              >
                Use this reply
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${expanded ? "rotate-90" : ""}`}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
