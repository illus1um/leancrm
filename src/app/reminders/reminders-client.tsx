"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select-native";
import {
  createReminder,
  deleteReminder,
  toggleReminder,
} from "@/lib/actions/reminders";
import { formatRelative } from "@/lib/utils";

type Reminder = {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  dealId: string | null;
  dealTitle: string | null;
};

type Deal = { id: string; title: string };

export function RemindersClient({
  reminders,
  deals,
}: {
  reminders: Reminder[];
  deals: Deal[];
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const formRef = React.useRef<HTMLFormElement>(null);

  const fieldError = (n: string) => fieldErrors[n]?.[0] ?? null;
  const clearField = (n: string) => {
    if (!fieldErrors[n]) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[n];
      return next;
    });
  };

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    setFieldErrors({});
    const result = await createReminder(formData);
    setPending(false);
    if (result.ok) {
      formRef.current?.reset();
      router.refresh();
    } else {
      setError(result.fieldErrors ? null : result.error);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  const open = reminders.filter((r) => r.status === "OPEN");
  const completed = reminders.filter((r) => r.status === "COMPLETED");

  return (
    <div className="mt-8 grid gap-10">
      <form
        ref={formRef}
        action={action}
        className="grid gap-4 rounded-md border border-rule bg-paper-deep/40 p-5"
      >
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          New reminder
        </p>
        <div className="grid gap-4 md:grid-cols-[1fr_180px_1fr_auto] md:items-end">
          <Field label="Title" id="title" error={fieldError("title")}>
            <Input
              id="title"
              name="title"
              required
              maxLength={160}
              aria-invalid={Boolean(fieldError("title")) || undefined}
              onInput={() => clearField("title")}
              placeholder="Send SOC2 docs to Lookout"
            />
          </Field>
          <Field label="Due" id="dueDate" error={fieldError("dueDate")}>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              required
              aria-invalid={Boolean(fieldError("dueDate")) || undefined}
              onInput={() => clearField("dueDate")}
            />
          </Field>
          <Field label="Linked deal" id="dealId" error={fieldError("dealId")}>
            <NativeSelect id="dealId" name="dealId" defaultValue="">
              <option value="">—</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Button type="submit" disabled={pending} className="md:self-end">
            {pending ? "Adding…" : "Add"}
          </Button>
        </div>
        {error ? (
          <p className="text-xs uppercase tracking-wider text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <Section title={`Open (${open.length})`} reminders={open} />
      {completed.length > 0 ? (
        <Section title={`Completed (${completed.length})`} reminders={completed} muted />
      ) : null}
    </div>
  );
}

function Section({
  title,
  reminders,
  muted = false,
}: {
  title: string;
  reminders: Reminder[];
  muted?: boolean;
}) {
  if (reminders.length === 0) {
    return (
      <section>
        <h2 className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">Nothing here.</p>
      </section>
    );
  }
  const now = new Date();
  return (
    <section>
      <h2 className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
        {title}
      </h2>
      <ul className="mt-3 divide-y divide-rule rounded-md border border-rule bg-paper-deep/40">
        {reminders.map((r) => {
          const due = new Date(r.dueDate);
          const overdue = !muted && due < now;
          return (
            <li
              key={r.id}
              className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-3 ${muted ? "opacity-60" : ""}`}
            >
              <form action={toggleReminder}>
                <input type="hidden" name="id" value={r.id} />
                <button
                  type="submit"
                  title={muted ? "Reopen reminder" : "Mark complete"}
                  aria-label={muted ? "Reopen reminder" : "Mark complete"}
                  className={`grid h-7 w-7 cursor-pointer place-items-center rounded-full border transition-all ${
                    muted
                      ? "border-accent bg-accent text-paper hover:bg-paper hover:text-accent"
                      : overdue
                      ? "border-destructive/60 text-destructive hover:bg-destructive hover:text-paper"
                      : "border-rule text-ink-soft hover:border-accent hover:text-accent"
                  }`}
                >
                  {muted ? (
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.25} />
                  ) : (
                    <Check className="h-4 w-4" strokeWidth={2.25} />
                  )}
                </button>
              </form>
              <div>
                <p className="text-[15px]">{r.title}</p>
                {r.dealTitle ? (
                  <Link
                    href={`/deals/${r.dealId}`}
                    className="link-ink text-xs text-ink-soft hover:text-accent"
                  >
                    Linked: {r.dealTitle}
                  </Link>
                ) : null}
              </div>
              <span
                className={`text-xs uppercase tracking-[0.18em] tabular-nums ${overdue ? "text-destructive" : "text-ink-soft"}`}
              >
                {overdue ? "Overdue · " : ""}
                {formatRelative(due)}
              </span>
              <form action={deleteReminder}>
                <input type="hidden" name="id" value={r.id} />
                <button
                  type="submit"
                  className="text-xs uppercase tracking-[0.18em] text-ink-soft hover:text-destructive"
                  aria-label="Delete"
                >
                  Remove
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </section>
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
    <div className="grid gap-1.5">
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
