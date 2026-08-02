"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RetryAnalysisButton({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/analyze`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to retry AI analysis.");
        setLoading(false);
        return;
      }

      router.refresh();
      setLoading(false);
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleRetry}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
      >
        {loading && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-700/40 border-t-amber-700 dark:border-amber-400/40 dark:border-t-amber-400" />
        )}
        {loading ? "Retrying…" : "Retry AI analysis"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}
