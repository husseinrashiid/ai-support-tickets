import Link from "next/link";
import { TicketForm } from "@/components/TicketForm";

export default function NewTicketPage() {
  return (
    <div className="min-h-full flex-1 bg-zinc-100 px-4 py-10 dark:bg-black sm:px-8 sm:py-14">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to tickets
        </Link>

        <header className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            New ticket
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            AI analysis runs automatically once you submit.
          </p>
        </header>

        <TicketForm />
      </div>
    </div>
  );
}
