"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/PasswordInput";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        user?: { role: string };
        error?: string;
      };

      if (!res.ok || !data.user) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(data.user.role === "agent" ? "/" : "/my-tickets");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Email <span className="text-brand-red">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={submitting}
          placeholder="you@example.com"
          className="h-12 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Password <span className="text-brand-red">*</span>
        </label>
        <PasswordInput value={password} onChange={setPassword} disabled={submitting} placeholder="Enter your password" />
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
        className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {submitting ? "Logging in…" : "Log in"}
      </button>

      <p className="-mt-0.5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand-blue hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
