import Link from "next/link";
import { redirect } from "next/navigation";
import { TicketForm } from "@/components/TicketForm";
import { getCurrentUser } from "@/lib/auth";

export default async function NewTicketPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "customer") redirect("/");

  return (
    <div className="page-glow min-h-full flex-1 px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
        <Link
          href="/my-tickets"
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
          Back to my tickets
        </Link>

        <header>
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
