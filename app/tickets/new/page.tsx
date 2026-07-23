import { TicketForm } from "@/components/TicketForm";

export default function NewTicketPage() {
  return (
    <div className="min-h-full flex-1 bg-zinc-100 px-4 py-10 dark:bg-black sm:px-8 sm:py-14">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
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
