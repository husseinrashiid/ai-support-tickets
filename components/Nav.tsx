import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-4xl items-center px-4 py-3 sm:px-8">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Support Tickets
          <span className="text-brand-blue">.</span>
        </Link>
      </div>
    </header>
  );
}
