"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const baseInputClasses =
  "h-[46px] w-full rounded-lg border bg-white px-3 pr-11 text-sm text-zinc-900 outline-none transition-colors disabled:opacity-60 dark:bg-zinc-900 dark:text-zinc-50";
const normalBorderClasses =
  "border-zinc-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 dark:border-zinc-500";
const invalidBorderClasses = "border-brand-red/65 focus:ring-0";

export function PasswordInput({
  id = "password",
  value,
  onChange,
  disabled,
  placeholder = "At least 8 characters",
  invalid = false,
  onFocus,
  onBlur,
  showPassword: showPasswordProp,
  onToggleShowPassword,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  invalid?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Pass together with onToggleShowPassword to share reveal state across multiple fields (e.g. password + confirm). */
  showPassword?: boolean;
  onToggleShowPassword?: () => void;
}) {
  const [internalShowPassword, setInternalShowPassword] = useState(false);
  const isControlled = showPasswordProp !== undefined && onToggleShowPassword !== undefined;
  const showPassword = isControlled ? showPasswordProp : internalShowPassword;
  const toggleShowPassword = isControlled
    ? onToggleShowPassword
    : () => setInternalShowPassword((visible) => !visible);

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={showPassword ? "text" : "password"}
        required
        minLength={8}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`${baseInputClasses} ${invalid ? invalidBorderClasses : normalBorderClasses}`}
      />
      <button
        type="button"
        onClick={toggleShowPassword}
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
