"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const inputClasses =
  "h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 pr-11 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50";

export function PasswordInput({
  id = "password",
  value,
  onChange,
  disabled,
  placeholder = "At least 8 characters",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name="password"
        type={showPassword ? "text" : "password"}
        required
        minLength={8}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={inputClasses}
      />
      <button
        type="button"
        onClick={() => setShowPassword((visible) => !visible)}
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
