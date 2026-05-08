import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "./register-form";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/board");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 py-16 sm:py-24">
      <header className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          Start your workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
      </header>
      <RegisterForm />
      <p className="text-sm text-ink-soft">
        Already have one?{" "}
        <Link href="/login" className="link-ink text-ink hover:text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
