"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const fieldError = (name: string) => fieldErrors[name]?.[0] ?? null;
  const clearField = (name: string) => {
    if (!fieldErrors[name]) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    setFieldErrors({});
    const result = await loginUser(formData);
    setPending(false);
    if (result.ok) {
      router.push("/board");
      router.refresh();
    } else {
      setError(result.fieldErrors ? null : result.error);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <form action={action} className="grid gap-5">
      <Field label="Email" id="email" error={fieldError("email")}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={160}
          aria-invalid={Boolean(fieldError("email")) || undefined}
          onInput={() => clearField("email")}
          placeholder="you@company.com"
        />
      </Field>
      <Field label="Password" id="password" error={fieldError("password")}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(fieldError("password")) || undefined}
          onInput={() => clearField("password")}
        />
      </Field>
      {error ? (
        <p className="text-xs uppercase tracking-wider text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label
        htmlFor={id}
        className="text-[10px] uppercase tracking-[0.22em] text-ink-soft"
      >
        {label}
      </Label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs leading-tight text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
