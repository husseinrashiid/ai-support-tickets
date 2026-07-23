"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SuggestedResponseEditor({
  ticketId,
  initialValue,
}: {
  ticketId: string;
  initialValue: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [savedValue, setSavedValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedJustNow, setSavedJustNow] = useState(false);

  const isDirty = value !== savedValue;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSavedJustNow(false);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/response`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiSuggestedResponse: value }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to save the response.");
        setSaving(false);
        return;
      }

      setSavedValue(value);
      setSaving(false);
      setSavedJustNow(true);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Suggested response
        </h2>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="shrink-0 rounded-full bg-brand-blue px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSavedJustNow(false);
        }}
        rows={6}
        disabled={saving}
        placeholder="No AI suggested response yet — write one manually."
        className="mt-3 w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
      />
      {error && (
        <p role="alert" className="mt-2 text-xs text-brand-red">
          {error}
        </p>
      )}
      {savedJustNow && !error && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Saved.</p>
      )}
    </section>
  );
}
