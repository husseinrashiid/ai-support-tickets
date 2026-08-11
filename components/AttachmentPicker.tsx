"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ALLOWED_ATTACHMENT_MIME_TYPES, MAX_ATTACHMENT_SIZE_BYTES } from "@/lib/constants";
import { formatFileSize } from "@/lib/ticket-display";

const ACCEPT = ALLOWED_ATTACHMENT_MIME_TYPES.join(",");
const MAX_ATTACHMENT_MB = Math.floor(MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024));

export function AttachmentPicker({
  file,
  onChange,
  disabled,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!selected) return;

    if (!(ALLOWED_ATTACHMENT_MIME_TYPES as readonly string[]).includes(selected.type)) {
      setError("Only JPG, PNG, GIF, or WEBP images are allowed.");
      return;
    }
    if (selected.size > MAX_ATTACHMENT_SIZE_BYTES) {
      setError(`Images must be ${MAX_ATTACHMENT_MB}MB or smaller.`);
      return;
    }

    setError(null);
    onChange(selected);
  }

  function handleRemove() {
    setError(null);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleSelect}
        disabled={disabled}
        className="hidden"
      />
      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="inline-flex w-fit shrink-0 items-center gap-1.5 self-start rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <PaperclipIcon />
          Attach image
        </button>
      ) : (
        <div className="flex min-w-0 max-w-[260px] items-center gap-2 rounded-xl border border-zinc-300 px-2.5 py-1.5 dark:border-zinc-700">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
          )}
          <span className="min-w-0 flex-1 truncate text-xs text-zinc-700 dark:text-zinc-300">
            {file.name}
          </span>
          <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
            {formatFileSize(file.size)}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="shrink-0 text-xs font-medium text-zinc-500 hover:text-brand-red disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      )}
      {error && <p className="text-xs text-brand-red">{error}</p>}
    </div>
  );
}

function PaperclipIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
