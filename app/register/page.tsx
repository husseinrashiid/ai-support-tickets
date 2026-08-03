import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/RegisterForm";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "agent" ? "/" : "/my-tickets");
  }

  return (
    <div className="page-glow flex min-h-full flex-1 items-center justify-center px-4 pt-10 pb-20 sm:px-8">
      <div className="flex w-full max-w-[420px] flex-col">
        <header className="mb-7">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Register as a customer to submit tickets or as a support agent to manage them.
          </p>
        </header>

        <RegisterForm />
      </div>
    </div>
  );
}
