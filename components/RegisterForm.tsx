"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { USER_ROLES, type UserRole } from "@/lib/constants";
import { PASSWORD_REQUIREMENTS_TEXT, isPasswordStrong } from "@/lib/password";
import { PasswordInput } from "@/components/PasswordInput";

const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Customer",
  agent: "Support Agent",
};

const inputClasses =
  "h-12 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordChecks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "A number", met: /[0-9]/.test(password) },
    { label: "A special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isPasswordStrong(password)) {
      setError(PASSWORD_REQUIREMENTS_TEXT);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
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
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Password <span className="text-brand-red">*</span>
        </label>
        <PasswordInput value={password} onChange={setPassword} disabled={submitting} />
        <ul className="flex flex-col gap-1">
          {passwordChecks.map((check) => (
            <li
              key={check.label}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                check.met
                  ? "text-[#35b66f]"
                  : "text-[#8f96a3]"
              }`}
            >
              {check.met ? <CheckIcon /> : <DotIcon />}
              {check.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          I am a <span className="text-brand-red">*</span>
        </span>
        <div className="grid grid-cols-2 gap-3">
          {USER_ROLES.map((option) => {
            const selected = role === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                disabled={submitting}
                aria-pressed={selected}
                className={`flex h-12 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors ${
                  selected
                    ? "border-brand-blue bg-brand-blue/15 text-brand-blue dark:bg-brand-blue/20 dark:text-sky-400"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
                }`}
              >
                {ROLE_LABELS[option]}
              </button>
            );
          })}
        </div>
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
        className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-blue text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {submitting ? "Creating account…" : "Create account"}
      </button>

      <p className="-mt-0.5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-blue hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 shrink-0"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}
