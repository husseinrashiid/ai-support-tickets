import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "agent" ? "/" : "/my-tickets");
  }

  return (
    <div className="page-glow flex min-h-full flex-1 items-start justify-center px-4 pt-[90px] pb-14 sm:px-8">
      <div className="w-full max-w-[440px]">
        <header>
          <h1 className="text-[32px] font-bold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
            Log in
          </h1>
          <p className="mt-2 text-[15px] text-zinc-600 dark:text-[#9aa0aa]">
            Access your tickets or the agent dashboard.
          </p>
        </header>

        <LoginForm />
      </div>
    </div>
  );
}
