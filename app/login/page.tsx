import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "agent" ? "/" : "/my-tickets");
  }

  return (
    <div className="page-glow min-h-full flex-1 px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto flex max-w-[420px] flex-col gap-8">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Log in
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Access your tickets or the agent dashboard.
          </p>
        </header>

        <LoginForm />
      </div>
    </div>
  );
}
