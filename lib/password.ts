export const PASSWORD_REQUIREMENTS_TEXT =
  "Password must be at least 8 characters and include a number and a special character.";

export function isPasswordStrong(password: string): boolean {
  return (
    password.length >= 8 &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
