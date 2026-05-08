import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/board");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 py-16 sm:py-24">
      <header className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          Welcome back
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to LeanCRM
        </h1>
      </header>
      <LoginForm />
      <p className="text-sm text-ink-soft">
        New here?{" "}
        <Link href="/register" className="link-ink text-ink hover:text-accent">
          Create an account
        </Link>
      </p>
    </div>
  );
}
