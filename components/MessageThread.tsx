"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Attachment, Message } from "@prisma/client";
import { formatDateTime } from "@/lib/ticket-display";
import { MESSAGE_WRITABLE_STATUSES } from "@/lib/constants";
import { AttachmentPicker } from "@/components/AttachmentPicker";
import { AttachmentThumbnail } from "@/components/AttachmentThumbnail";

const CONTENT_LIMIT = 500;

type Variant = "customer" | "agent";

// The API omits the attachment's raw bytes from every response that isn't
// the dedicated /api/attachments/[id] download route - the UI only ever
// needs id/filename to build that download URL.
export type MessageWithAttachments = Message & { attachments: Omit<Attachment, "data">[] };

export type LeadingEntry = {
  key: string;
  author: string;
  variant: Variant;
  timestamp: Date;
  content: string;
  badge?: string;
  attachment?: { id: string; filename: string } | null;
};

export type MessageThreadHandle = {
  useReply: (text: string) => void;
};

const VARIANT_DOT: Record<Variant, string> = {
  customer: "bg-zinc-400 dark:bg-zinc-500",
  agent: "bg-brand-blue",
};

const VARIANT_AUTHOR_TEXT: Record<Variant, string> = {
  customer: "text-zinc-900 dark:text-zinc-50",
  agent: "text-brand-blue dark:text-sky-400",
};

export const MessageThread = forwardRef<
  MessageThreadHandle,
  {
    ticketId: string;
    status: string;
    viewerId: string;
    initialMessages: MessageWithAttachments[];
    leadingEntries?: LeadingEntry[];
    awaitingResponse?: boolean;
  }
>(function MessageThread(
  { ticketId, status, viewerId, initialMessages, leadingEntries = [], awaitingResponse = false },
  ref
) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    useReply(text: string) {
      setContent(text.slice(0, CONTENT_LIMIT));
      requestAnimationFrame(() => textareaRef.current?.focus());
    },
  }));

  const canWrite = MESSAGE_WRITABLE_STATUSES.includes(status as (typeof MESSAGE_WRITABLE_STATUSES)[number]);
  const charCount = content.length;

  async function handleSend() {
    if (!content.trim()) return;

    setSending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("content", content);
      if (attachment) {
        formData.set("attachment", attachment);
      }

      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { message?: MessageWithAttachments; error?: string };

      if (!res.ok || !data.message) {
        setError(data.error ?? "Failed to send message.");
        setSending(false);
        return;
      }

      setMessages((current) => [...current, data.message!]);
      setContent("");
      setAttachment(null);
      setSending(false);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSending(false);
    }
  }

  const hasEntries = leadingEntries.length > 0 || messages.length > 0;

  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
        Conversation
      </h2>

      <div className="relative mt-[22px] flex flex-col">
        {!hasEntries ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No messages yet.
          </p>
        ) : (
          <>
            <div className="absolute bottom-2 left-[5px] top-2 w-px bg-zinc-300 dark:bg-zinc-600" />

            {leadingEntries.map((entry) => (
              <MessageRow
                key={entry.key}
                author={entry.author}
                variant={entry.variant}
                timestamp={entry.timestamp}
                content={entry.content}
                badge={entry.badge}
                attachment={entry.attachment}
              />
            ))}

            {messages.map((message) => {
              const isViewer = message.senderId === viewerId;
              const senderLabel = isViewer
                ? "You"
                : message.senderRole === "agent"
                  ? "Support Agent"
                  : "Customer";

              return (
                <MessageRow
                  key={message.id}
                  author={senderLabel}
                  variant={message.senderRole === "agent" ? "agent" : "customer"}
                  timestamp={message.createdAt}
                  content={message.content}
                  attachment={message.attachments[0]}
                />
              );
            })}
          </>
        )}
      </div>

      {awaitingResponse && status !== "Closed" && (
        <p className="mt-2 flex items-center gap-2 pl-5 text-[13px] text-amber-700/90 dark:text-amber-500/80">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
          Waiting for support response.
        </p>
      )}

      {canWrite ? (
        <div className="mt-[18px] border-t border-zinc-200 pt-[18px] dark:border-zinc-800">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value.slice(0, CONTENT_LIMIT))}
            disabled={sending}
            minLength={1}
            maxLength={CONTENT_LIMIT}
            rows={3}
            placeholder="Write a follow-up message…"
            className="min-h-[96px] w-full resize-y rounded-xl border border-zinc-400 bg-white p-4 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/[0.12] disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
          {error && (
            <p role="alert" className="mt-2 text-xs text-brand-red">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <AttachmentPicker file={attachment} onChange={setAttachment} disabled={sending} />
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {charCount} / {CONTENT_LIMIT} characters
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !content.trim()}
                className="shrink-0 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none dark:disabled:bg-[#27313a] dark:disabled:text-[#7f8a96]"
              >
                {sending ? "Sending…" : "Send reply"}
              </button>
            </div>
          </div>
        </div>
      ) : status === "Closed" ? (
        <div className="mt-[18px] border-t border-zinc-200 pt-[18px] dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            This ticket is closed.
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            New messages are disabled.
          </p>
        </div>
      ) : (
        <p className="mt-[18px] border-t border-zinc-200 pt-[18px] text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          This ticket is {status} — new messages are disabled.
        </p>
      )}
    </section>
  );
});

function MessageRow({
  author,
  variant,
  timestamp,
  content,
  badge,
  attachment,
}: {
  author: string;
  variant: Variant;
  timestamp: Date | string;
  content: string;
  badge?: string;
  attachment?: { id: string; filename: string } | null;
}) {
  return (
    <div className="relative py-4 pl-5 first:pt-0 last:pb-0">
      <span
        className={`absolute left-0 top-[5px] h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-900 ${VARIANT_DOT[variant]}`}
      />
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className={`text-sm font-semibold ${VARIANT_AUTHOR_TEXT[variant]}`}>
          {author}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          · {formatDateTime(timestamp)}
        </span>
        {badge && (
          <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-400">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-1 max-w-[800px] whitespace-pre-wrap text-sm leading-[1.55] text-zinc-700 dark:text-zinc-300">
        {content}
      </p>
      {attachment && <AttachmentThumbnail attachment={attachment} />}
    </div>
  );
}
