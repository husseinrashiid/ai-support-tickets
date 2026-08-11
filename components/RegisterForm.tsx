"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isPasswordStrong } from "@/lib/password";
import { PasswordInput } from "@/components/PasswordInput";

const PASSWORD_HINT_TEXT = "8+ characters, including a number and special character";

const inputClasses =
  "h-[46px] rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 disabled:opacity-60 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-50";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordInvalid = passwordTouched && !isPasswordStrong(password);
  const passwordBorderInvalid = passwordInvalid && !passwordFocused;

  const confirmPasswordEmpty = confirmPassword.length === 0;
  const confirmPasswordMismatch = !confirmPasswordEmpty && confirmPassword !== password;
  const confirmPasswordInvalid = confirmPasswordTouched && (confirmPasswordEmpty || confirmPasswordMismatch);
  const confirmPasswordBorderInvalid = confirmPasswordInvalid && !confirmPasswordFocused;
  const confirmPasswordErrorText = confirmPasswordEmpty
    ? "Please confirm your password."
    : "Passwords do not match.";

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const passwordOk = isPasswordStrong(password);
    const confirmOk = confirmPassword.length > 0 && confirmPassword === password;

    if (!passwordOk) {
      setPasswordTouched(true);
      setPasswordFocused(false);
    }
    if (!confirmOk) {
      setConfirmPasswordTouched(true);
      setConfirmPasswordFocused(false);
    }
    if (!passwordOk || !confirmOk) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
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

      router.push("/my-tickets");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-[30px] flex flex-col gap-5">
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

      <div className="flex flex-col gap-4">
        <div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              Password <span className="text-brand-red">*</span>
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              disabled={submitting}
              placeholder="Enter your password"
              invalid={passwordBorderInvalid}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword((visible) => !visible)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => {
                setPasswordFocused(false);
                setPasswordTouched(true);
              }}
            />
          </div>
          <p
            className={`mt-[7px] text-[13px] ${
              passwordInvalid ? "text-[#f87171]" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {PASSWORD_HINT_TEXT}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Confirm password <span className="text-brand-red">*</span>
          </label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={submitting}
            placeholder="Re-enter your password"
            invalid={confirmPasswordBorderInvalid}
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword((visible) => !visible)}
            onFocus={() => setConfirmPasswordFocused(true)}
            onBlur={() => {
              setConfirmPasswordFocused(false);
              setConfirmPasswordTouched(true);
            }}
          />
          {confirmPasswordInvalid && (
            <p className="text-[13px] text-[#f87171]">{confirmPasswordErrorText}</p>
          )}
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
        className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-brand-blue text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {submitting ? "Creating account…" : "Create account"}
      </button>

      <p className="-mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#4a7fa3] hover:text-[#3a6a8c] hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
