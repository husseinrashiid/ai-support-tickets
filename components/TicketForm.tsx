"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MESSAGE_CHAR_LIMIT = 500;

export function TicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const messageCharCount = message.length;
  const atCharLimit = messageCharCount >= MESSAGE_CHAR_LIMIT;

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle || !trimmedMessage) {
      setError("Please fill in both the title and message before submitting.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle, message: trimmedMessage }),
      });
      const data = (await res.json()) as {
        ticket?: { id: string };
        error?: string;
      };

      if (!res.ok || !data.ticket) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/my-tickets/${data.ticket.id}`);
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="title"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Title <span className="text-brand-red">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={submitting}
          placeholder="Short summary of the issue"
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="message"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Message <span className="text-brand-red">*</span>
          </label>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {messageCharCount} / {MESSAGE_CHAR_LIMIT} characters
          </span>
        </div>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={submitting}
          maxLength={MESSAGE_CHAR_LIMIT}
          placeholder="Describe the customer's issue in detail"
          className="resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        {atCharLimit ? (
          <p className="text-xs font-medium text-brand-red">Character limit reached.</p>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            The full customer message. This is what the AI analysis reads to
            categorize, prioritize, and draft a suggested reply.
          </p>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-brand-red bg-red-50 px-4 py-3 text-sm text-brand-red dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {submitting ? "Creating…" : "Create ticket"}
      </button>
    </form>
  );
}
