"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AttachmentPicker } from "@/components/AttachmentPicker";

const MESSAGE_CHAR_LIMIT = 500;

export function TicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const messageCharCount = message.length;
  const atCharLimit = messageCharCount >= MESSAGE_CHAR_LIMIT;

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    setTitleError(trimmedTitle ? null : "Title is required.");
    setMessageError(trimmedMessage ? null : "Message is required.");
    if (!trimmedTitle || !trimmedMessage) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("title", trimmedTitle);
      formData.set("message", trimmedMessage);
      if (attachment) {
        formData.set("attachment", attachment);
      }

      const res = await fetch("/api/tickets", {
        method: "POST",
        body: formData,
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
      noValidate
      className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white px-6 pt-6 pb-[22px] dark:border-zinc-800 dark:bg-zinc-900"
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
          onChange={(event) => {
            setTitle(event.target.value);
            if (titleError) setTitleError(null);
          }}
          disabled={submitting}
          placeholder="Short summary of the issue"
          className={`rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 disabled:opacity-60 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 ${
            titleError
              ? "border-brand-red focus:border-brand-red focus:ring-2 focus:ring-brand-red/12"
              : "border-zinc-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 dark:border-zinc-700"
          }`}
        />
        {titleError && <p className="text-[13px] text-brand-red">{titleError}</p>}
      </div>

      <div className={`flex flex-col gap-2 ${messageError ? "mb-2" : ""}`}>
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
          rows={5}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            if (messageError) setMessageError(null);
          }}
          disabled={submitting}
          maxLength={MESSAGE_CHAR_LIMIT}
          placeholder="Describe the customer's issue in detail"
          className={`h-[144px] resize-y rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 disabled:opacity-60 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 ${
            messageError
              ? "border-brand-red focus:border-brand-red focus:ring-2 focus:ring-brand-red/12"
              : "border-zinc-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 dark:border-zinc-700"
          }`}
        />
        {messageError ? (
          <p className="text-[13px] text-brand-red">{messageError}</p>
        ) : atCharLimit ? (
          <p className="text-xs font-medium text-brand-red">Character limit reached.</p>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Used by AI to categorize, prioritize, and draft a reply.
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

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Attachment
        </span>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <AttachmentPicker file={attachment} onChange={setAttachment} disabled={submitting} />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {submitting ? "Creating…" : "Create ticket"}
          </button>
        </div>
      </div>
    </form>
  );
}
